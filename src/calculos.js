// calculos.js
// Módulo de lógica matemática pura. Replica exactamente el XLS.

/**
 * Calcula el cuadrante de corte para un hueco específico.
 * @param {Object} hueco - Datos de la habitación.
 * @param {Object} config - Configuración de la obra (descuentos, fruncido).
 * @returns {Object} Datos procesados para el cuadrante.
 */
export function calcularCuadranteCorte(hueco, config) {
    // 1. Leer ancho_real y altura_real
    const ancho_real = parseFloat(hueco.ancho_real) || 0;
    const altura_real = parseFloat(hueco.altura_real) || 0;
    const num_hojas = parseInt(hueco.num_hojas) || 1;
    
    const descuento_altura = parseFloat(config.descuento_altura) || 0;
    const fruncido = parseFloat(config.fruncido) || 2;

    // 2. Calcular altura_final
    // altura_final = altura_real - descuento_altura
    const altura_final = altura_real - descuento_altura;

    // 3. Normalizar ancho -> ancho_estandar
    // Equivalente: =INT(ancho_real/0.25)*0.25 (Siempre hacia abajo)
    const ancho_estandar = Math.floor(ancho_real / 0.25) * 0.25;

    // 4. Aplicar fruncido -> ancho_corte
    // ancho_corte = ancho_estandar * fruncido
    const ancho_corte = ancho_estandar * fruncido;

    // 5. Normalizar altura -> altura_corte
    // Equivalente: =ROUND(altura_final/0.03,0)*0.03 (Múltiplo más cercano)
    const altura_corte = Math.round(altura_final / 0.03) * 0.03;

    // 6. Copiar num_hojas -> num_cortes
    const num_cortes = num_hojas;

    // Devolver objeto con precisión decimal interna, expuesto a 3 o 4 decimales
    return {
        habitacion: hueco.habitacion || '',
        ancho_real: Number(ancho_real.toFixed(4)),
        altura_real: Number(altura_real.toFixed(4)),
        altura_final: Number(altura_final.toFixed(4)),
        ancho_estandar: Number(ancho_estandar.toFixed(4)),
        ancho_corte: Number(ancho_corte.toFixed(4)),
        altura_corte: Number(altura_corte.toFixed(4)),
        num_cortes: num_cortes
    };
}

/**
 * Agrupa los cortes idénticos para el resumen del cuadrante.
 * @param {Array} huecosCalculados - Array de objetos devueltos por calcularCuadranteCorte.
 * @returns {Array} Array de grupos.
 */
export function agruparCuadrante(huecosCalculados) {
    const grupos = {};
    
    for (const h of huecosCalculados) {
        // La clave de agrupación es el ancho_estandar y la altura_corte
        const key = `${h.ancho_estandar.toFixed(2)}x${h.altura_corte.toFixed(2)}`;
        
        if (!grupos[key]) {
            grupos[key] = {
                ancho: h.ancho_estandar,
                altura: h.altura_corte,
                habitaciones: [],
                total_cortes: 0
            };
        }
        grupos[key].habitaciones.push(h.habitacion);
        grupos[key].total_cortes += h.num_cortes;
    }
    
    // Devolver como array ordenado por ancho (de mayor a menor)
    return Object.values(grupos).sort((a, b) => b.ancho - a.ancho);
}

/* ── HELPERS ORIGINALES (Mantenidos para compatibilidad con otras partes de la app) ── */
export const R = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

export function calc(h, c) {
  const a = +h.an, al = +h.al, nH = +c.nH, fr = +c.fr;
  const mh = R((a / nH) * fr, 3), mt = R(mh * nH, 3);
  const ct = R(mt * c.pT, 2), cc = R(mt * c.pC, 2);
  const ph = R(ct + cc + (+c.pI), 2), be = R(ph * (c.mg / 100), 2), th = R(ph + be, 2);
  const acCon = R(mh + (+c.ci), 3), alCon = R(al - (+c.dA), 3);
  const aEst = R(Math.ceil(mh / 0.25) * 0.25, 2), alCu = R(Math.ceil(al / 0.03) * 0.03, 2);
  return { ...h, mh, mt, ct, cc, ph, be, th, acCon, alCon, nc: nH, sm: R(mh * nH, 3), aEst, alCu, rf: R(a - 0.01, 3), sop: R(a * 2, 2) };
}

export function tots(hs) {
  const s = k => R(hs.reduce((a, h) => a + (h[k] || 0), 0), 2);
  return { mt: s('mt'), ct: s('ct'), cc: s('cc'), ph: s('ph'), be: s('be'), th: s('th'), sm: s('sm') };
}

export function cuadrante(hs) {
  const g = {};
  for (const h of hs) {
    const k = `${h.aEst}x${h.alCu}`;
    if (!g[k]) g[k] = { a: h.aEst, al: h.alCu, hs: [], c: 0 };
    g[k].hs.push(h.num);
    g[k].c += h.nc;
  }
  return Object.values(g).sort((a, b) => b.a - a.a);
}

export const fmtE = v => v > 0 ? `${v.toFixed(2)}€` : '—';
export const fmtM = v => v > 0 ? `${v}m` : '—';
