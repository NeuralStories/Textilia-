-- FASE 1: MODELO SQL

CREATE TABLE IF NOT EXISTS room_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habitacion text,
  ancho_hueco numeric,
  altura numeric,
  medida_hoja numeric,
  numero_hojas numeric,
  fruncido numeric,
  bajo_cresta numeric,
  cierre numeric,
  precio_confeccion numeric,
  precio_tela numeric,
  precio_instalacion numeric,
  numero_horas numeric,
  margen numeric,

  -- CAMPOS CALCULADOS Y PERSISTIDOS
  mts_tela numeric,
  coste_tela numeric,
  coste_confeccion numeric,
  precio_hueco numeric,
  beneficio numeric,
  total_hueco numeric,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
