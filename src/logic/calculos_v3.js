/**
 * FASE 2: LÓGICA DE CÁLCULO
 * Implementación estricta de fórmulas.
 */

export function calcularFila(input) {
  // Extraer inputs (asegurando tipos numéricos)
  const medida_hoja = parseFloat(input.medida_hoja) || 0;
  const numero_hojas = parseFloat(input.numero_hojas) || 0;
  const precio_tela = parseFloat(input.precio_tela) || 0;
  const precio_confeccion = parseFloat(input.precio_confeccion) || 0;
  const precio_instalacion = parseFloat(input.precio_instalacion) || 0;
  const margen = parseFloat(input.margen) || 0;

  // 1. mts_tela
  const mts_tela = medida_hoja * numero_hojas;

  // 2. coste_tela
  const coste_tela = mts_tela * precio_tela;

  // 3. coste_confeccion
  const coste_confeccion = mts_tela * precio_confeccion;

  // 4. precio_hueco
  const precio_hueco = coste_tela + coste_confeccion + precio_instalacion;

  // 5. beneficio
  const beneficio = precio_hueco * (margen / 100);

  // 6. total_hueco
  const total_hueco = precio_hueco + beneficio;

  return {
    ...input,
    mts_tela,
    coste_tela,
    coste_confeccion,
    precio_hueco,
    beneficio,
    total_hueco
  };
}
