-- 1️⃣ SQL DE AMBAS TABLAS

-- Tabla: RELACIÓN (Tabla económica por hueco)
CREATE TABLE relacion_huecos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  obra_id uuid NOT NULL,

  tela text,
  visillo text,
  medida numeric,
  nombre_tela text,

  habitacion text NOT NULL,
  ancho_hueco numeric NOT NULL,
  altura numeric NOT NULL,

  precio_confeccion numeric NOT NULL,
  precio_tela numeric NOT NULL,
  precio_instalacion numeric NOT NULL,

  fruncido numeric NOT NULL,
  bajo_y_cresta numeric,

  medida_de_hoja numeric NOT NULL,
  num_hojas integer NOT NULL,
  mts_de_tela numeric NOT NULL,

  coste_tela numeric NOT NULL,
  coste_confeccion numeric NOT NULL,

  precio_hueco numeric NOT NULL,
  margen numeric NOT NULL,
  beneficio numeric NOT NULL,
  total_hueco numeric NOT NULL,

  created_at timestamptz DEFAULT now()
);

-- Tabla: CUADRANTE (Solo Medición 1 Hoja)
CREATE TABLE cuadrante_corte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  tipo_medicion text NOT NULL CHECK (tipo_medicion = '1_hoja'),

  hab text NOT NULL,

  ancho numeric NOT NULL,
  alto numeric NOT NULL,
  alto_final numeric NOT NULL,

  ancho_estandar numeric NOT NULL,
  ancho_corte numeric NOT NULL,

  cortes integer NOT NULL,

  alto_corte numeric NOT NULL,

  created_at timestamptz DEFAULT now()
);
