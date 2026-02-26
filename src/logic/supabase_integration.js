import { createClient } from '@supabase/supabase-js';

// Configuración (asumida existente)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Ejemplo de Inserción en Supabase
 * Procesa cálculos en cliente (o servidor intermedio) usando la lógica espejo
 * o llama a una RPC si se prefiere, pero aquí mostramos la inserción directa
 * de los datos calculados para persistencia.
 * 
 * NOTA: Para garantizar la integridad, idealmente se llamaría a una RPC de base de datos
 * que use las funciones 'calcular_relacion' y 'calcular_cuadrante' definidas en SQL.
 * 
 * Aquí simulamos el flujo de aplicación que prepara los datos y los guarda.
 */
export async function guardarCalculos(obraId, huecosInput, cabeceraInput) {
  
  try {
    // 1. Preparar datos para RELACIÓN
    // Se asume que 'huecosInput' tiene la estructura requerida por calcular_relacion
    const relacionPayload = huecosInput.map(hueco => {
      // Calcular en JS o llamar a RPC. 
      // Si usamos la RPC definida en SQL 'procesar_array_huecos', sería:
      // const { data } = await supabase.rpc('procesar_array_huecos', { huecos: ..., cabecera: ... })
      
      // Aquí mostramos cómo se estructuraría el objeto final para inserción directa
      // asumiendo que el cálculo ya se realizó (o se realiza aquí replicando la lógica).
      
      // REPLICACIÓN LÓGICA EXACTA (JS) para demostración de inserción
      const ancho_hueco = hueco.ancho_hueco;
      const fruncido = hueco.fruncido;
      const num_hojas = hueco.num_hojas;
      const precio_tela = hueco.precio_tela;
      const precio_confeccion = hueco.precio_confeccion;
      const precio_instalacion = hueco.precio_instalacion;
      const margen = hueco.margen;

      const medida_de_hoja = ancho_hueco * fruncido;
      const mts_de_tela = medida_de_hoja * num_hojas;
      const coste_tela = mts_de_tela * precio_tela;
      const coste_confeccion = mts_de_tela * precio_confeccion;
      const precio_hueco = precio_instalacion + coste_tela + coste_confeccion;
      const beneficio = precio_hueco * margen;
      const total_hueco = precio_hueco + beneficio;

      return {
        obra_id: obraId,
        tela: cabeceraInput.tela,
        visillo: cabeceraInput.visillo,
        medida: cabeceraInput.medida,
        nombre_tela: cabeceraInput.nombre_tela,
        habitacion: hueco.habitacion,
        ancho_hueco,
        altura: hueco.altura,
        precio_confeccion,
        precio_tela,
        precio_instalacion,
        fruncido,
        bajo_y_cresta: hueco.bajo_y_cresta,
        num_hojas,
        medida_de_hoja,
        mts_de_tela,
        coste_tela,
        coste_confeccion,
        precio_hueco,
        margen,
        beneficio,
        total_hueco
      };
    });

    // 2. Preparar datos para CUADRANTE
    const cuadrantePayload = [];
    
    for (const hueco of huecosInput) {
      // Validación de Tipo
      if (hueco.tipo_medicion !== '1_hoja') {
        console.warn(`Omitiendo hueco ${hueco.habitacion}: Tipo ${hueco.tipo_medicion} no soportado en cuadrante.`);
        continue; // O lanzar error según requerimiento
      }

      // Lógica Exacta Cuadrante (JS Mirror)
      const alto_final = hueco.altura - hueco.descuento_altura;
      // FLOOR(ancho / 0.25) * 0.25
      const ancho_estandar = Math.floor(hueco.ancho_hueco / 0.25) * 0.25;
      const ancho_corte = ancho_estandar * hueco.fruncido;
      // ROUND(alto / 0.03) * 0.03
      const alto_corte = Math.round(alto_final / 0.03) * 0.03;
      const cortes = hueco.num_hojas;

      cuadrantePayload.push({
        tipo_medicion: '1_hoja',
        hab: hueco.habitacion,
        ancho: hueco.ancho_hueco,
        alto: hueco.altura,
        alto_final,
        ancho_estandar,
        ancho_corte,
        cortes,
        alto_corte
      });
    }

    // 3. Inserción Transaccional (Simulada con Promise.all o secuencial)
    
    // Insertar Relación
    const { error: errRel } = await supabase
      .from('relacion_huecos')
      .insert(relacionPayload);
    
    if (errRel) throw new Error(`Error insertando relación: ${errRel.message}`);

    // Insertar Cuadrante
    if (cuadrantePayload.length > 0) {
      const { error: errCuad } = await supabase
        .from('cuadrante_corte')
        .insert(cuadrantePayload);
        
      if (errCuad) throw new Error(`Error insertando cuadrante: ${errCuad.message}`);
    }

    return { success: true };

  } catch (error) {
    console.error("Fallo en proceso de guardado:", error);
    return { success: false, error: error.message };
  }
}
