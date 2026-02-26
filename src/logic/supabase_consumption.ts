import { createClient } from '@supabase/supabase-js';

// Configuración Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos TypeScript (Simplificados para el ejemplo)
interface ConfigGlobal {
  tipo_tela: string;
  referencia_tela: string;
  medida_rollo: number;
  num_hojas_global: 1;
  fruncido_global: number;
  bajo_cresta_global: number;
  cierre_global: number;
  precio_confeccion_global: number;
  precio_tela_global: number;
  precio_instalacion_global: number;
  margen_global: number;
}

interface HuecoInput {
  habitacion: string;
  ancho_hueco: number;
  altura: number;
  // Overrides opcionales
  precio_confeccion?: number;
  precio_tela?: number;
  margen?: number;
  // ... otros overrides
}

interface PayloadMedicion {
  tipo_medicion: '1_hoja';
  obra_id: string;
  configuracion_global: ConfigGlobal;
  huecos: HuecoInput[];
}

/**
 * Ejemplo de Consumo: Procesar Medición Completa
 * Orquesta el flujo completo llamando a la función RPC de base de datos.
 */
export async function procesarMedicionCompleta(payload: PayloadMedicion) {
  try {
    // 1. Validación Previa (Cliente)
    if (payload.tipo_medicion !== '1_hoja') {
      throw new Error("Tipo de medición no soportado en cliente.");
    }

    // 2. Llamada a RPC (Transacción Atómica en BD)
    const { data, error } = await supabase
      .rpc('procesar_medicion', { p_payload: payload });

    if (error) {
      console.error("Error RPC:", error);
      throw error;
    }

    console.log("Procesamiento exitoso:", data);
    return data;

  } catch (err) {
    console.error("Fallo en proceso:", err);
    return { success: false, error: err };
  }
}

// Ejemplo de uso
/*
const payloadEjemplo: PayloadMedicion = {
  tipo_medicion: '1_hoja',
  obra_id: 'uuid-obra-existente',
  configuracion_global: {
    tipo_tela: 'Visillo',
    referencia_tela: 'REF-001',
    medida_rollo: 2.80,
    num_hojas_global: 1,
    fruncido_global: 2.0,
    bajo_cresta_global: 0.15,
    cierre_global: 0.0,
    precio_confeccion_global: 12.50,
    precio_tela_global: 15.50,
    precio_instalacion_global: 25.00,
    margen_global: 0.30
  },
  huecos: [
    { habitacion: 'Salón', ancho_hueco: 1.37, altura: 2.45, precio_tela: 18.00, margen: 0.35 },
    { habitacion: 'Dormitorio', ancho_hueco: 1.50, altura: 2.50 }
  ]
};

procesarMedicionCompleta(payloadEjemplo);
*/
