/* ── CALC ENGINE ── */
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
