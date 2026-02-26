/**
 * Lógica de Negocio: Cuadrante de Corte
 * Implementación estricta basada en especificación XLS.
 */

/**
 * Procesa un registro individual del cuadrante.
 * 
 * @param {Object} input - Datos de entrada
 * @param {string} input.habitacion - Identificador de la habitación
 * @param {number} input.ancho_real - Ancho real medido
 * @param {number} input.altura_real - Altura real medida
 * @param {number} input.num_hojas - Número de hojas
 * @param {number} input.fruncido - Factor de fruncido
 * @param {number} input.descuento_altura - Descuento a aplicar a la altura
 * @returns {Object} Registro calculado del cuadrante
 */
export function procesarRegistro(input) {
  // 1️⃣ hab
  const hab = input.habitacion;

  // 2️⃣ ancho
  const ancho = input.ancho_real;

  // 3️⃣ alto
  const alto = input.altura_real;

  // 4️⃣ alto_final
  // alto_final = altura_real - descuento_altura
  const alto_final = input.altura_real - input.descuento_altura;

  // 5️⃣ ancho_estandar
  // Equivalente Excel: =INT(ancho/0.25)*0.25
  // Implementación: FLOOR(ancho_real / 0.25) * 0.25
  const ancho_estandar = Math.floor(input.ancho_real / 0.25) * 0.25;

  // 6️⃣ ancho_corte
  // ancho_corte = ancho_estandar * fruncido
  const ancho_corte = ancho_estandar * input.fruncido;

  // 7️⃣ cortes
  // cortes = num_hojas
  const cortes = input.num_hojas;

  // 8️⃣ alto_corte
  // Equivalente Excel: =ROUND(alto_final/0.03,0)*0.03
  // Implementación: ROUND(alto_final / 0.03) * 0.03
  const alto_corte = Math.round(alto_final / 0.03) * 0.03;

  return {
    hab,
    ancho,
    alto,
    alto_final,
    ancho_estandar,
    ancho_corte,
    cortes,
    alto_corte
  };
}

/**
 * Procesa un array de registros.
 * 
 * @param {Array<Object>} inputs - Array de datos de entrada
 * @returns {Array<Object>} Array de registros calculados
 */
export function procesarCuadrante(inputs) {
  return inputs.map(procesarRegistro);
}

// 🧪 Tests Unitarios
export const tests = {
  testCasoBase: () => {
    const input = {
      habitacion: "101",
      ancho_real: 1.58, // 1.58 / 0.25 = 6.32 -> floor(6) * 0.25 = 1.50
      altura_real: 2.50,
      num_hojas: 2,
      fruncido: 2.0,
      descuento_altura: 0.10 // 2.50 - 0.10 = 2.40 -> 2.40 / 0.03 = 80 -> 80 * 0.03 = 2.40
    };
    
    const expected = {
      hab: "101",
      ancho: 1.58,
      alto: 2.50,
      alto_final: 2.40,
      ancho_estandar: 1.50,
      ancho_corte: 3.00, // 1.50 * 2.0
      cortes: 2,
      alto_corte: 2.40
    };

    const result = procesarRegistro(input);
    
    const assert = (a, b, field) => {
      if (Math.abs(a - b) > 0.0001) console.error(`❌ Fallo en ${field}: Esperado ${b}, Recibido ${a}`);
      else console.log(`✅ ${field} OK`);
    };

    console.log("--- Test Caso Base ---");
    assert(result.ancho_estandar, expected.ancho_estandar, "ancho_estandar");
    assert(result.ancho_corte, expected.ancho_corte, "ancho_corte");
    assert(result.alto_corte, expected.alto_corte, "alto_corte");
    assert(result.alto_final, expected.alto_final, "alto_final");
  },
  
  testRedondeoAlto: () => {
    // Caso específico para probar el redondeo de alto al múltiplo de 0.03 más cercano
    // 2.41 / 0.03 = 80.333 -> round(80) -> 2.40
    // 2.42 / 0.03 = 80.666 -> round(81) -> 2.43
    
    const input1 = { habitacion: "T1", ancho_real: 1, altura_real: 2.41, num_hojas: 1, fruncido: 1, descuento_altura: 0 };
    const res1 = procesarRegistro(input1);
    
    const input2 = { habitacion: "T2", ancho_real: 1, altura_real: 2.42, num_hojas: 1, fruncido: 1, descuento_altura: 0 };
    const res2 = procesarRegistro(input2);

    console.log("--- Test Redondeo Alto ---");
    if (Math.abs(res1.alto_corte - 2.40) < 0.0001) console.log("✅ Redondeo Abajo OK (2.41 -> 2.40)");
    else console.error(`❌ Fallo Redondeo Abajo: 2.41 -> ${res1.alto_corte}`);

    if (Math.abs(res2.alto_corte - 2.43) < 0.0001) console.log("✅ Redondeo Arriba OK (2.42 -> 2.43)");
    else console.error(`❌ Fallo Redondeo Arriba: 2.42 -> ${res2.alto_corte}`);
  }
};
