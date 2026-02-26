-- PLANIFICACIÓN SQL - ESQUEMA DE BASE DE DATOS
-- Este archivo define la estructura futura para persistir las mediciones y catálogos.

-- 1. TABLAS DE CATÁLOGO (OPCIONALES)
-- Para selectores de telas y visillos
CREATE TABLE IF NOT EXISTS fabrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL,
  name text,
  price_per_m numeric DEFAULT 0,
  width_m numeric,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sheers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL,
  name text,
  price_per_m numeric DEFAULT 0,
  width_m numeric,
  created_at timestamptz DEFAULT now()
);

-- 2. TABLA PRINCIPAL DE MEDICIONES
CREATE TABLE IF NOT EXISTS room_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL, -- Relación con la obra/presupuesto
  
  -- Identificación
  room_name text NOT NULL, -- "HABITACIÓN"
  measure2 numeric, -- "MEDIDA 2"
  
  -- Datos de Tela (Copiados del global o catálogo al crear)
  fabric_type text, -- "TIPO TELA"
  fabric_reference text, -- "REFERENCIA TELA"
  fabric_name text, -- "NOMBRE TELA"
  fabric_item text, -- "TELA" (input manual o ID catálogo)
  sheer_item text, -- "VISILLO" (input manual o ID catálogo)
  
  -- Medidas
  width_hole numeric NOT NULL, -- "ANCHO HUECO"
  height numeric NOT NULL, -- "ALTURA"
  panel_width numeric NOT NULL, -- "MED. HOJA"
  panels_qty integer NOT NULL DEFAULT 1, -- "HOJAS"
  
  -- Parámetros de Cálculo (Overrides por fila)
  fullness numeric NOT NULL, -- "FRUNCIDO"
  hem_or_header_m numeric NOT NULL DEFAULT 0, -- "BAJO/CRESTA"
  closing_m numeric NOT NULL DEFAULT 0, -- "CIERRE"
  repeat_cm numeric DEFAULT 0, -- "REPETICIÓN"
  fullness_factor numeric, -- "FACTOR FRUNCE"
  
  -- Costes Unitarios
  fabric_price_per_m numeric DEFAULT 0, -- "PRECIO €/m TELA"
  sheer_price_per_m numeric DEFAULT 0, -- "PRECIO €/m VISILLO"
  
  -- Cálculos Persistidos (Resultados)
  fabric_meters numeric NOT NULL DEFAULT 0, -- "MTS TELA"
  sheer_meters numeric DEFAULT 0, -- "MTS VISILLO" (si aplica)
  
  fabric_cost numeric NOT NULL DEFAULT 0, -- "€ TELA"
  sheer_cost numeric DEFAULT 0, -- "€ VISILLO"
  confection_cost numeric NOT NULL DEFAULT 0, -- "COSTE CONFECCIÓN"
  installation_cost numeric NOT NULL DEFAULT 0, -- "COSTE INSTALACIÓN"
  other_costs numeric DEFAULT 0, -- "OTROS COSTES"
  
  -- Descuentos
  discount_type text CHECK (discount_type IN ('percent', 'amount')),
  discount_value numeric DEFAULT 0,
  
  -- Totales y Venta
  total_cost numeric NOT NULL DEFAULT 0, -- "TOTAL" (Coste)
  margin_percent numeric NOT NULL DEFAULT 0, -- "MARGEN %"
  vat_percent numeric NOT NULL DEFAULT 21, -- "IVA %"
  sale_price numeric NOT NULL DEFAULT 0, -- "PRECIO VENTA" (Base imponible)
  final_price numeric NOT NULL DEFAULT 0, -- "PRECIO FINAL CON IVA"
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_room_measurements_project_id ON room_measurements(project_id);
CREATE INDEX IF NOT EXISTS idx_room_measurements_room_name ON room_measurements(room_name);
