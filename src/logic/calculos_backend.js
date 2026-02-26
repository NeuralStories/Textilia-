/**
 * Lógica Backend: Relación y Cuadrante
 * Implementación estricta basada en especificación XLS.
 */

// 2️⃣ Función pura RELACIÓN
export function calcularRelacion(input) {
  // Inputs obligatorios
  const {
    ancho_hueco,
    fruncido,
    num_hojas,
    precio_tela,
    precio_confeccion,
    precio_instalacion,
    margen
  } = input;

  // Lógica exacta
  const medida_de_hoja = ancho_hueco * fruncido;
  const mts_de_tela = medida_de_hoja * num_hojas;
  
  const coste_tela = mts_de_tela * precio_tela;
  const coste_confeccion = mts_de_tela * precio_confeccion;
  
  const precio_hueco = precio_instalacion + coste_tela + coste_confeccion;
  const beneficio = precio_hueco * margen;
  const total_hueco = precio_hueco + beneficio;

  return {
    ...input, // Preserva campos de cabecera y otros inputs (habitacion, altura, bajo_y_cresta, etc.)
    medida_de_hoja,
    mts_de_tela,
    coste_tela,
    coste_confeccion,
    precio_hueco,
    beneficio,
    total_hueco
  };
}

// 3️⃣ Función pura CUADRANTE
export function calcularCuadrante(input) {
  if (input.tipo_medicion !== '1_hoja') {
    throw new Error(`Tipo de medición no soportado: ${input.tipo_medicion}. Solo se permite '1_hoja'.`);
  }

  const {
    habitacion,
    ancho_hueco,
    altura,
    num_hojas,
    fruncido,
    descuento_altura
  } = input;

  // Lógica exacta
  // 1. Calcular alto_final
  const alto_final = altura - descuento_altura;

  // 2. Normalizar ancho
  const ancho_estandar = Math.floor(ancho_hueco / 0.25) * 0.25;

  // 3. Aplicar fruncido
  const ancho_corte = ancho_estandar * fruncido;

  // 4. Normalizar altura (alto_corte)
  const alto_corte = Math.round(alto_final / 0.03) * 0.03;

  // 5. Copiar num_hojas
  const cortes = num_hojas;

  return {
    tipo_medicion: '1_hoja',
    hab: habitacion,
    ancho: ancho_hueco,
    alto: altura,
    alto_final,
    ancho_estandar,
    ancho_corte,
    cortes,
    alto_corte
  };
}

// 4️⃣ Función para procesar arrays
export function procesarLoteRelacion(inputs) {
  return inputs.map(calcularRelacion);
}

export function procesarLoteCuadrante(inputs) {
  return inputs.map(calcularCuadrante);
}

// 5️⃣ Ejemplo inserción Supabase
export async function insertarDatos(supabase, obraId, datosRelacion, datosCuadrante) {
  // Procesar datos
  const relacionCalculada = procesarLoteRelacion(datosRelacion);
  const cuadranteCalculado = procesarLoteCuadrante(datosCuadrante);

  // Preparar payloads para SQL (snake_case match)
  const payloadRelacion = relacionCalculada.map(d => ({
    obra_id: obraId,
    tela: d.tela,
    visillo: d.visillo,
    medida: d.medida,
    nombre_tela: d.nombre_tela,
    habitacion: d.habitacion,
    ancho_hueco: d.ancho_hueco,
    altura: d.altura,
    precio_confeccion: d.precio_confeccion,
    precio_tela: d.precio_tela,
    precio_instalacion: d.precio_instalacion,
    fruncido: d.fruncido,
    bajo_y_cresta: d.bajo_y_cresta,
    medida_de_hoja: d.medida_de_hoja,
    num_hojas: d.num_hojas,
    mts_de_tela: d.mts_de_tela,
    coste_tela: d.coste_tela,
    coste_confeccion: d.coste_confeccion,
    precio_hueco: d.precio_hueco,
    margen: d.margen,
    beneficio: d.beneficio,
    total_hueco: d.total_hueco
  }));

  const payloadCuadrante = cuadranteCalculado.map(d => ({
    tipo_medicion: d.tipo_medicion,
    hab: d.hab,
    ancho: d.ancho,
    alto: d.alto,
    alto_final: d.alto_final,
    ancho_estandar: d.ancho_estandar,
    ancho_corte: d.ancho_corte,
    cortes: d.cortes,
    alto_corte: d.alto_corte
  }));

  // Inserción
  const { error: errRel } = await supabase.from('relacion_huecos').insert(payloadRelacion);
  if (errRel) throw errRel;

  const { error: errCuad } = await supabase.from('cuadrante_corte').insert(payloadCuadrante);
  if (errCuad) throw errCuad;

  return { success: true };
}

// 6️⃣ Tests unitarios
export const testsBackend = {
  testRelacion: () => {
    const input = {
      habitacion: "101",
      ancho_hueco: 2.0,
      altura: 2.5,
      precio_tela: 10,
      precio_confeccion: 5,
      precio_instalacion: 20,
      fruncido: 2.0,
      num_hojas: 2,
      margen: 0.3 // 30%
    };
    
    const res = calcularRelacion(input);
    
    // medida_de_hoja = 2.0 * 2.0 = 4.0
    // mts_de_tela = 4.0 * 2 = 8.0
    // coste_tela = 8.0 * 10 = 80.0
    // coste_confeccion = 8.0 * 5 = 40.0
    // precio_hueco = 20 + 80 + 40 = 140.0
    // beneficio = 140.0 * 0.3 = 42.0
    // total_hueco = 140.0 + 42.0 = 182.0

    const assert = (val, exp, label) => {
      if (Math.abs(val - exp) > 0.0001) console.error(`❌ Relación ${label}: ${val} != ${exp}`);
      else console.log(`✅ Relación ${label} OK`);
    };

    console.log("--- Test Relación ---");
    assert(res.medida_de_hoja, 4.0, "medida_de_hoja");
    assert(res.mts_de_tela, 8.0, "mts_de_tela");
    assert(res.coste_tela, 80.0, "coste_tela");
    assert(res.coste_confeccion, 40.0, "coste_confeccion");
    assert(res.precio_hueco, 140.0, "precio_hueco");
    assert(res.beneficio, 42.0, "beneficio");
    assert(res.total_hueco, 182.0, "total_hueco");
  },

  testCuadrante: () => {
    const input = {
      tipo_medicion: "1_hoja",
      habitacion: "102",
      ancho_hueco: 1.58, // 1.58 / 0.25 = 6.32 -> 6 * 0.25 = 1.50
      altura: 2.50,
      descuento_altura: 0.10, // 2.40 -> 2.40 / 0.03 = 80 -> 2.40
      fruncido: 2.0,
      num_hojas: 1
    };

    const res = calcularCuadrante(input);

    const assert = (val, exp, label) => {
      if (Math.abs(val - exp) > 0.0001) console.error(`❌ Cuadrante ${label}: ${val} != ${exp}`);
      else console.log(`✅ Cuadrante ${label} OK`);
    };

    console.log("--- Test Cuadrante ---");
    assert(res.alto_final, 2.40, "alto_final");
    assert(res.ancho_estandar, 1.50, "ancho_estandar");
    assert(res.ancho_corte, 3.00, "ancho_corte"); // 1.50 * 2.0
    assert(res.alto_corte, 2.40, "alto_corte");
    assert(res.cortes, 1, "cortes");
  },

  testErrorTipo: () => {
    try {
      calcularCuadrante({ tipo_medicion: "2_hojas" });
      console.error("❌ Fallo Error Tipo: No lanzó error");
    } catch (e) {
      console.log("✅ Error Tipo OK: " + e.message);
    }
  }
};
