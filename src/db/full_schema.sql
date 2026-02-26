-- 1. ESQUEMA SQL

-- Tabla relacion_huecos (completa, sin modificaciones)
CREATE TABLE IF NOT EXISTS relacion_huecos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL,
  
  -- Cabecera Global
  tela text,
  visillo text,
  medida numeric,
  nombre_tela text,

  -- Datos del Hueco
  habitacion text NOT NULL,
  ancho_hueco numeric NOT NULL,
  altura numeric NOT NULL,

  -- Precios y Factores
  precio_confeccion numeric NOT NULL,
  precio_tela numeric NOT NULL,
  precio_instalacion numeric NOT NULL,
  fruncido numeric NOT NULL,
  bajo_y_cresta numeric, -- Solo almacenamiento
  num_hojas integer NOT NULL,
  margen numeric NOT NULL,

  -- Campos Calculados (Persistidos)
  medida_de_hoja numeric NOT NULL,
  mts_de_tela numeric NOT NULL,
  coste_tela numeric NOT NULL,
  coste_confeccion numeric NOT NULL,
  precio_hueco numeric NOT NULL,
  beneficio numeric NOT NULL,
  total_hueco numeric NOT NULL,

  created_at timestamptz DEFAULT now()
);

-- Tabla cuadrante_corte (solo 1_hoja)
CREATE TABLE IF NOT EXISTS cuadrante_corte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Input
  tipo_medicion text NOT NULL CHECK (tipo_medicion = '1_hoja'),
  hab text NOT NULL,
  ancho numeric NOT NULL, -- ancho_hueco
  alto numeric NOT NULL,  -- altura
  
  -- Calculados
  alto_final numeric NOT NULL,
  ancho_estandar numeric NOT NULL,
  ancho_corte numeric NOT NULL,
  cortes integer NOT NULL,
  alto_corte numeric NOT NULL,

  created_at timestamptz DEFAULT now()
);

-- 2. FUNCIÓN SQL/PLPGSQL: calcular_relacion()
CREATE OR REPLACE FUNCTION calcular_relacion(input jsonb) RETURNS jsonb AS $$
DECLARE
  -- Entradas
  v_ancho_hueco numeric;
  v_fruncido numeric;
  v_num_hojas int;
  v_precio_tela numeric;
  v_precio_confeccion numeric;
  v_precio_instalacion numeric;
  v_margen numeric;
  
  -- Salidas
  v_medida_de_hoja numeric;
  v_mts_de_tela numeric;
  v_coste_tela numeric;
  v_coste_confeccion numeric;
  v_precio_hueco numeric;
  v_beneficio numeric;
  v_total_hueco numeric;
BEGIN
  -- Extracción de datos (Casting estricto a numeric)
  v_ancho_hueco := (input->>'ancho_hueco')::numeric;
  v_fruncido := (input->>'fruncido')::numeric;
  v_num_hojas := (input->>'num_hojas')::int;
  v_precio_tela := (input->>'precio_tela')::numeric;
  v_precio_confeccion := (input->>'precio_confeccion')::numeric;
  v_precio_instalacion := (input->>'precio_instalacion')::numeric;
  v_margen := (input->>'margen')::numeric;

  -- Fórmulas EXACTAS
  v_medida_de_hoja := v_ancho_hueco * v_fruncido;
  v_mts_de_tela := v_medida_de_hoja * v_num_hojas;
  v_coste_tela := v_mts_de_tela * v_precio_tela;
  v_coste_confeccion := v_mts_de_tela * v_precio_confeccion;
  v_precio_hueco := v_precio_instalacion + v_coste_tela + v_coste_confeccion;
  v_beneficio := v_precio_hueco * v_margen;
  v_total_hueco := v_precio_hueco + v_beneficio;

  -- Retorno del objeto enriquecido
  RETURN input || jsonb_build_object(
    'medida_de_hoja', v_medida_de_hoja,
    'mts_de_tela', v_mts_de_tela,
    'coste_tela', v_coste_tela,
    'coste_confeccion', v_coste_confeccion,
    'precio_hueco', v_precio_hueco,
    'beneficio', v_beneficio,
    'total_hueco', v_total_hueco
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. FUNCIÓN SQL/PLPGSQL: calcular_cuadrante()
CREATE OR REPLACE FUNCTION calcular_cuadrante(input jsonb) RETURNS jsonb AS $$
DECLARE
  v_tipo_medicion text;
  v_ancho_hueco numeric;
  v_altura numeric;
  v_descuento_altura numeric;
  v_fruncido numeric;
  v_num_hojas int;
  
  v_alto_final numeric;
  v_ancho_estandar numeric;
  v_ancho_corte numeric;
  v_alto_corte numeric;
  v_cortes int;
BEGIN
  -- Validación de Tipo
  v_tipo_medicion := input->>'tipo_medicion';
  
  IF v_tipo_medicion IS DISTINCT FROM '1_hoja' THEN
    RAISE EXCEPTION 'Error de Negocio: Tipo de medición no soportado "%". Solo se permite "1_hoja".', v_tipo_medicion;
  END IF;

  -- Extracción
  v_ancho_hueco := (input->>'ancho_hueco')::numeric;
  v_altura := (input->>'altura')::numeric;
  v_descuento_altura := (input->>'descuento_altura')::numeric;
  v_fruncido := (input->>'fruncido')::numeric;
  v_num_hojas := (input->>'num_hojas')::int;

  -- Lógica Exacta (Pasos 1-5)
  -- Paso 1: alto_final
  v_alto_final := v_altura - v_descuento_altura;

  -- Paso 2: ancho_estandar (FLOOR / 0.25)
  v_ancho_estandar := FLOOR(v_ancho_hueco / 0.25) * 0.25;

  -- Paso 3: ancho_corte
  v_ancho_corte := v_ancho_estandar * v_fruncido;

  -- Paso 4: alto_corte (ROUND / 0.03)
  v_alto_corte := ROUND(v_alto_final / 0.03) * 0.03;

  -- Paso 5: cortes
  v_cortes := v_num_hojas;

  -- Retorno
  RETURN input || jsonb_build_object(
    'alto_final', v_alto_final,
    'ancho_estandar', v_ancho_estandar,
    'ancho_corte', v_ancho_corte,
    'alto_corte', v_alto_corte,
    'cortes', v_cortes
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. FUNCIÓN SQL: procesar_array_huecos()
CREATE OR REPLACE FUNCTION procesar_array_huecos(huecos jsonb, cabecera jsonb) RETURNS jsonb AS $$
DECLARE
  hueco jsonb;
  resultado jsonb := '[]'::jsonb;
  hueco_calculado jsonb;
  hueco_completo jsonb;
BEGIN
  -- Iterar sobre el array de huecos
  FOR hueco IN SELECT * FROM jsonb_array_elements(huecos)
  LOOP
    -- Fusionar cabecera con hueco (la cabecera puede contener precios default si no vienen en el hueco, 
    -- pero asumimos que el input hueco ya trae lo necesario o se combina aquí)
    -- En este caso, asumimos que 'hueco' trae los precios específicos o se heredan.
    -- Para simplificar y cumplir la firma, pasamos el hueco tal cual a calcular si tiene todo.
    
    -- Si faltan precios en el hueco, se podrían tomar de la cabecera aquí.
    -- Asumiremos que el objeto 'hueco' ya está preparado con todos los campos numéricos requeridos.
    
    hueco_calculado := calcular_relacion(hueco);
    
    -- Añadir campos de cabecera al resultado final para persistencia plana si es necesario
    hueco_completo := hueco_calculado || cabecera;
    
    resultado := resultado || hueco_completo;
  END LOOP;
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
