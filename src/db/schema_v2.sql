-- 1. ESQUEMA SQL COMPLETO

-- Tabla 1: Configuración Global por Obra
CREATE TABLE IF NOT EXISTS relacion_configuracion (
  obra_id uuid PRIMARY KEY, -- 1:1 con la obra
  
  -- Grupo A: Datos Tela/Sistema
  tipo_tela text,
  referencia_tela text,
  medida_rollo numeric,
  num_hojas_global integer NOT NULL CHECK (num_hojas_global = 1),
  fruncido_global numeric NOT NULL,
  bajo_cresta_global numeric NOT NULL,
  cierre_global numeric NOT NULL,

  -- Grupo B: Datos Económicos Globales
  precio_confeccion_global numeric NOT NULL,
  precio_tela_global numeric NOT NULL,
  precio_instalacion_global numeric NOT NULL,
  margen_global numeric NOT NULL,

  updated_at timestamptz DEFAULT now()
);

-- Tabla 2: Relación Económica (Huecos con Overrides)
CREATE TABLE IF NOT EXISTS relacion_huecos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES relacion_configuracion(obra_id) ON DELETE CASCADE,
  
  -- Inputs Obligatorios
  habitacion text NOT NULL,
  ancho_hueco numeric NOT NULL,
  altura numeric NOT NULL,

  -- Overrides Opcionales (NULL = usar global)
  precio_confeccion numeric,
  precio_tela numeric,
  precio_instalacion numeric,
  margen numeric,
  fruncido numeric,
  bajo_y_cresta numeric,
  num_hojas integer,

  -- Campos Calculados (Persistidos tras recalcular)
  medida_de_hoja numeric,
  mts_de_tela numeric,
  coste_tela numeric,
  coste_confeccion numeric,
  precio_hueco numeric,
  beneficio numeric,
  total_hueco numeric,

  created_at timestamptz DEFAULT now()
);

-- Tabla 3: Cuadrante de Corte (Generado)
CREATE TABLE IF NOT EXISTS cuadrante_corte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hueco_id uuid NOT NULL REFERENCES relacion_huecos(id) ON DELETE CASCADE,
  obra_id uuid NOT NULL,
  
  -- Input
  tipo_medicion text NOT NULL CHECK (tipo_medicion = '1_hoja'),
  hab text NOT NULL,
  
  -- Dimensiones Base
  ancho numeric NOT NULL, -- ancho_hueco
  alto numeric NOT NULL,  -- altura
  
  -- Calculados Dimensionales
  alto_final numeric NOT NULL,
  ancho_estandar numeric NOT NULL,
  ancho_corte numeric NOT NULL,
  alto_corte numeric NOT NULL,
  cortes integer NOT NULL,

  created_at timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_relacion_huecos_obra ON relacion_huecos(obra_id);
CREATE INDEX IF NOT EXISTS idx_cuadrante_corte_obra ON cuadrante_corte(obra_id);

-- 2. FUNCIONES PL/PGSQL

-- Función: upsert_configuracion_global
CREATE OR REPLACE FUNCTION upsert_configuracion_global(p_obra_id uuid, p_datos jsonb) 
RETURNS RECORD AS $$
DECLARE
  v_res RECORD;
BEGIN
  INSERT INTO relacion_configuracion (
    obra_id, tipo_tela, referencia_tela, medida_rollo,
    num_hojas_global, fruncido_global, bajo_cresta_global, cierre_global,
    precio_confeccion_global, precio_tela_global, precio_instalacion_global, margen_global
  ) VALUES (
    p_obra_id,
    p_datos->>'tipo_tela',
    p_datos->>'referencia_tela',
    (p_datos->>'medida_rollo')::numeric,
    (p_datos->>'num_hojas_global')::int,
    (p_datos->>'fruncido_global')::numeric,
    (p_datos->>'bajo_cresta_global')::numeric,
    (p_datos->>'cierre_global')::numeric,
    (p_datos->>'precio_confeccion_global')::numeric,
    (p_datos->>'precio_tela_global')::numeric,
    (p_datos->>'precio_instalacion_global')::numeric,
    (p_datos->>'margen_global')::numeric
  )
  ON CONFLICT (obra_id) DO UPDATE SET
    tipo_tela = EXCLUDED.tipo_tela,
    referencia_tela = EXCLUDED.referencia_tela,
    medida_rollo = EXCLUDED.medida_rollo,
    num_hojas_global = EXCLUDED.num_hojas_global,
    fruncido_global = EXCLUDED.fruncido_global,
    bajo_cresta_global = EXCLUDED.bajo_cresta_global,
    cierre_global = EXCLUDED.cierre_global,
    precio_confeccion_global = EXCLUDED.precio_confeccion_global,
    precio_tela_global = EXCLUDED.precio_tela_global,
    precio_instalacion_global = EXCLUDED.precio_instalacion_global,
    margen_global = EXCLUDED.margen_global,
    updated_at = now()
  RETURNING * INTO v_res;
  
  RETURN v_res;
END;
$$ LANGUAGE plpgsql;

-- Función: upsert_habitacion
CREATE OR REPLACE FUNCTION upsert_habitacion(p_obra_id uuid, p_fila jsonb) 
RETURNS RECORD AS $$
DECLARE
  v_res RECORD;
BEGIN
  INSERT INTO relacion_huecos (
    obra_id, habitacion, ancho_hueco, altura,
    precio_confeccion, precio_tela, precio_instalacion,
    margen, fruncido, bajo_y_cresta, num_hojas
  ) VALUES (
    p_obra_id,
    p_fila->>'habitacion',
    (p_fila->>'ancho_hueco')::numeric,
    (p_fila->>'altura')::numeric,
    (p_fila->>'precio_confeccion')::numeric, -- Puede ser NULL
    (p_fila->>'precio_tela')::numeric,       -- Puede ser NULL
    (p_fila->>'precio_instalacion')::numeric,-- Puede ser NULL
    (p_fila->>'margen')::numeric,            -- Puede ser NULL
    (p_fila->>'fruncido')::numeric,          -- Puede ser NULL
    (p_fila->>'bajo_y_cresta')::numeric,     -- Puede ser NULL
    (p_fila->>'num_hojas')::int              -- Puede ser NULL
  )
  RETURNING id, obra_id INTO v_res;
  
  RETURN v_res;
END;
$$ LANGUAGE plpgsql;

-- Función: recalcular_relacion
CREATE OR REPLACE FUNCTION recalcular_relacion(p_hueco_id uuid) 
RETURNS RECORD AS $$
DECLARE
  v_hueco relacion_huecos%ROWTYPE;
  v_conf relacion_configuracion%ROWTYPE;
  
  -- Variables resueltas (Defaults/Overrides)
  v_fruncido numeric;
  v_bajo_y_cresta numeric;
  v_num_hojas int;
  v_precio_confeccion numeric;
  v_precio_tela numeric;
  v_precio_instalacion numeric;
  v_margen numeric;
  
  -- Variables calculadas
  v_medida_de_hoja numeric;
  v_mts_de_tela numeric;
  v_coste_tela numeric;
  v_coste_confeccion numeric;
  v_precio_hueco numeric;
  v_beneficio numeric;
  v_total_hueco numeric;
BEGIN
  -- 1. Obtener Hueco
  SELECT * INTO v_hueco FROM relacion_huecos WHERE id = p_hueco_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Hueco % no encontrado', p_hueco_id; END IF;

  -- 2. Obtener Configuración Global
  SELECT * INTO v_conf FROM relacion_configuracion WHERE obra_id = v_hueco.obra_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Configuración para obra % no encontrada', v_hueco.obra_id; END IF;

  -- 3. Resolver Defaults (COALESCE)
  v_fruncido := COALESCE(v_hueco.fruncido, v_conf.fruncido_global);
  v_bajo_y_cresta := COALESCE(v_hueco.bajo_y_cresta, v_conf.bajo_cresta_global);
  v_num_hojas := COALESCE(v_hueco.num_hojas, v_conf.num_hojas_global);
  v_precio_confeccion := COALESCE(v_hueco.precio_confeccion, v_conf.precio_confeccion_global);
  v_precio_tela := COALESCE(v_hueco.precio_tela, v_conf.precio_tela_global);
  v_precio_instalacion := COALESCE(v_hueco.precio_instalacion, v_conf.precio_instalacion_global);
  v_margen := COALESCE(v_hueco.margen, v_conf.margen_global);

  -- 4. Cálculos Comerciales Exactos
  v_medida_de_hoja := v_hueco.ancho_hueco * v_fruncido;
  v_mts_de_tela := v_medida_de_hoja * v_num_hojas;
  v_coste_tela := v_mts_de_tela * v_precio_tela;
  v_coste_confeccion := v_mts_de_tela * v_precio_confeccion;
  v_precio_hueco := v_precio_instalacion + v_coste_tela + v_coste_confeccion;
  v_beneficio := v_precio_hueco * v_margen;
  v_total_hueco := v_precio_hueco + v_beneficio;

  -- 5. Actualizar Hueco
  UPDATE relacion_huecos SET
    medida_de_hoja = v_medida_de_hoja,
    mts_de_tela = v_mts_de_tela,
    coste_tela = v_coste_tela,
    coste_confeccion = v_coste_confeccion,
    precio_hueco = v_precio_hueco,
    beneficio = v_beneficio,
    total_hueco = v_total_hueco
  WHERE id = p_hueco_id
  RETURNING * INTO v_hueco;

  RETURN v_hueco;
END;
$$ LANGUAGE plpgsql;

-- Función: generar_cuadrante
CREATE OR REPLACE FUNCTION generar_cuadrante(p_obra_id uuid) 
RETURNS jsonb AS $$
DECLARE
  v_hueco RECORD;
  v_conf relacion_configuracion%ROWTYPE;
  
  -- Variables resueltas para dimensional
  v_bajo_y_cresta numeric;
  v_fruncido numeric;
  v_num_hojas int;
  
  -- Variables dimensionales
  v_alto_final numeric;
  v_ancho_estandar numeric;
  v_ancho_corte numeric;
  v_alto_corte numeric;
  v_cortes int;
  
  v_res_array jsonb := '[]'::jsonb;
  v_corte_insertado RECORD;
BEGIN
  -- Limpiar cuadrante existente para esta obra (regeneración completa)
  DELETE FROM cuadrante_corte WHERE obra_id = p_obra_id;

  -- Obtener config global para resolución de defaults (necesaria para dimensionales)
  SELECT * INTO v_conf FROM relacion_configuracion WHERE obra_id = p_obra_id;

  -- Iterar sobre huecos de la obra
  FOR v_hueco IN SELECT * FROM relacion_huecos WHERE obra_id = p_obra_id LOOP
    
    -- Recalcular relación primero para asegurar datos frescos (opcional, pero seguro)
    -- En este flujo asumimos que ya se llamó a recalcular_relacion, pero para dimensionales
    -- necesitamos resolver los defaults nuevamente o leerlos si se persistieran los resueltos.
    -- Como los resueltos NO se persisten (solo los calculados económicos), resolvemos aquí:
    
    v_bajo_y_cresta := COALESCE(v_hueco.bajo_y_cresta, v_conf.bajo_cresta_global);
    v_fruncido := COALESCE(v_hueco.fruncido, v_conf.fruncido_global);
    v_num_hojas := COALESCE(v_hueco.num_hojas, v_conf.num_hojas_global);

    -- Algoritmo Dimensional (Secuencia Obligatoria)
    
    -- Paso 1: Ajuste vertical
    v_alto_final := v_hueco.altura - v_bajo_y_cresta;

    -- Paso 2: Normalización ancho (paso 0.25)
    v_ancho_estandar := FLOOR(v_hueco.ancho_hueco / 0.25) * 0.25;

    -- Paso 3: Aplicar fruncido
    v_ancho_corte := v_ancho_estandar * v_fruncido;

    -- Paso 4: Normalización alto (paso 0.03)
    v_alto_corte := ROUND(v_alto_final / 0.03) * 0.03;

    -- Paso 5: Número de cortes
    v_cortes := v_num_hojas;

    -- Insertar en Cuadrante
    INSERT INTO cuadrante_corte (
      hueco_id, obra_id, tipo_medicion, hab,
      ancho, alto,
      alto_final, ancho_estandar, ancho_corte, alto_corte, cortes
    ) VALUES (
      v_hueco.id, p_obra_id, '1_hoja', v_hueco.habitacion,
      v_hueco.ancho_hueco, v_hueco.altura,
      v_alto_final, v_ancho_estandar, v_ancho_corte, v_alto_corte, v_cortes
    )
    RETURNING * INTO v_corte_insertado;
    
    v_res_array := v_res_array || row_to_json(v_corte_insertado)::jsonb;
    
  END LOOP;

  RETURN v_res_array;
END;
$$ LANGUAGE plpgsql;

-- Función: procesar_medicion (Entry Point)
CREATE OR REPLACE FUNCTION procesar_medicion(p_payload jsonb) 
RETURNS jsonb AS $$
DECLARE
  v_obra_id uuid;
  v_tipo_medicion text;
  v_config_data jsonb;
  v_huecos_data jsonb;
  v_hueco_item jsonb;
  v_hueco_record RECORD;
  v_cuadrante_res jsonb;
BEGIN
  -- Validación Tipo Medición
  v_tipo_medicion := p_payload->>'tipo_medicion';
  IF v_tipo_medicion IS DISTINCT FROM '1_hoja' THEN
    RAISE EXCEPTION 'Error Controlado: Tipo de medición "%" no soportado. Solo "1_hoja".', v_tipo_medicion;
  END IF;

  v_obra_id := (p_payload->>'obra_id')::uuid;
  v_config_data := p_payload->'configuracion_global';
  v_huecos_data := p_payload->'huecos';

  -- 1. Upsert Configuración Global
  PERFORM upsert_configuracion_global(v_obra_id, v_config_data);

  -- 2. Procesar Huecos
  FOR v_hueco_item IN SELECT * FROM jsonb_array_elements(v_huecos_data) LOOP
    -- Upsert Hueco (Inputs)
    SELECT id INTO v_hueco_record FROM upsert_habitacion(v_obra_id, v_hueco_item) AS f(id uuid, obra_id uuid);
    
    -- Recalcular Relación (Económica)
    PERFORM recalcular_relacion(v_hueco_record.id);
  END LOOP;

  -- 3. Generar Cuadrante (Dimensional)
  v_cuadrante_res := generar_cuadrante(v_obra_id);

  RETURN jsonb_build_object(
    'success', true,
    'obra_id', v_obra_id,
    'cuadrante', v_cuadrante_res
  );
END;
$$ LANGUAGE plpgsql;
