/* ── UI HELPERS ── */
import { calc, tots, cuadrante, fmtE, fmtM, fmtCM } from './calculos.js';

let _sT; // Timer for save indicator

export const ui = {
  showToast(msg, type = 'info') {
    const c = document.getElementById('TW');
    const el = document.createElement('div');
    el.className = 'toast ' + (type === 'ok' ? 'ok' : type === 'err' ? 'err' : '');
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => {
      el.style.transition = '.3s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-8px)';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  },

  showSave() {
    const d = document.getElementById('sDot'), t = document.getElementById('sTxt');
    if (d) d.classList.add('saving');
    if (t) t.textContent = 'Guardando...';
    clearTimeout(_sT);
    _sT = setTimeout(() => {
      if (d) d.classList.remove('saving');
      if (t) t.textContent = 'Guardado';
    }, 900);
  },

  /* ── MODULE RENDERERS (Shared logic used by Obra view) ── */
  renderResumen(o, hs, t) {
    const c = o.cfg;
    const ll = { borrador: 'Borrador', en_medicion: 'En medición', revisada: 'Revisada', cerrada: 'Cerrada' };
    const pct = hs.length > 0 ? Math.min(100, Math.round((hs.filter(h => h.an > 0 && h.al > 0).length / hs.length) * 100)) : 0;

    document.getElementById('rKpis').innerHTML = `
      <div class="kpi"><div class="kpi-l">Habitaciones</div><div class="kpi-v">${hs.length}</div><div class="kpi-s">medidas registradas</div></div>
      <div class="kpi"><div class="kpi-l">Metros de tela</div><div class="kpi-v ac">${t.mt}m</div><div class="kpi-s">total a cortar</div></div>
      <div class="kpi"><div class="kpi-l">Coste estimado</div><div class="kpi-v">${fmtE(t.ph)}</div><div class="kpi-s">sin margen</div></div>
      <div class="kpi"><div class="kpi-l">Total con margen</div><div class="kpi-v">${fmtE(t.th)}</div><div class="kpi-s">margen ${c.mg}%</div></div>`;

    document.getElementById('rFicha').innerHTML = `
      <div class="irow"><div class="irow-l">Referencia</div><div class="irow-v mono">${o.ref}</div></div>
      <div class="irow"><div class="irow-l">Nombre</div><div class="irow-v">${o.nombre}</div></div>
      <div class="irow"><div class="irow-l">Dirección</div><div class="irow-v">${o.dir || '—'}</div></div>
      <div class="irow"><div class="irow-l">Fecha</div><div class="irow-v">${o.fecha || '—'}</div></div>
      <div class="irow"><div class="irow-l">Estado</div><div class="irow-v"><span class="state-badge sb-${o.estado}"><span class="state-dot"></span>${ll[o.estado]}</span></div></div>
      ${o.obs ? `<div class="irow"><div class="irow-l">Observaciones</div><div class="irow-v" style="font-size:12.5px;color:var(--ink-35)">${o.obs}</div></div>` : ''}`;

    document.getElementById('rContacto').innerHTML = `
      ${o.c1n ? `<div class="irow"><div class="irow-l">Nombre</div><div class="irow-v">${o.c1n}</div></div>` : ''}
      ${o.c1emp ? `<div class="irow"><div class="irow-l">Empresa</div><div class="irow-v">${o.c1emp}</div></div>` : ''}
      ${o.c1t ? `<div class="irow"><div class="irow-l">Teléfono</div><div class="irow-v mono">${o.c1t}</div></div>` : ''}
      ${o.c1e ? `<div class="irow"><div class="irow-l">Email</div><div class="irow-v" style="font-size:12.5px">${o.c1e}</div></div>` : ''}
      ${!o.c1n && !o.c1t ? '<div style="font-size:13px;color:var(--pap-4);padding:6px 0">Sin contacto registrado</div>' : ''}`;

    document.getElementById('rConfig').innerHTML = `
      <div class="irow"><div class="irow-l">Tipo de tela</div><div class="irow-v mono">${c.tip}</div></div>
      ${c.nom ? `<div class="irow"><div class="irow-l">Referencia tela</div><div class="irow-v" style="font-size:12.5px">${c.nom}</div></div>` : ''}
      <div class="irow"><div class="irow-l">N.º hojas</div><div class="irow-v mono">${c.nH}</div></div>
      <div class="irow"><div class="irow-l">Fruncido</div><div class="irow-v mono">${c.fr}×</div></div>
      <div class="irow"><div class="irow-l">P. Tela</div><div class="irow-v mono">${fmtE(c.pT)}/m</div></div>
      <div class="irow"><div class="irow-l">P. Confección</div><div class="irow-v mono">${fmtE(c.pC)}/m</div></div>`;

    document.getElementById('rHabB').innerHTML = hs.map(h => `
      <tr>
        <td class="h">${h.num}</td>
        <td class="n">${h.an}m</td><td class="n">${h.al}m</td>
        <td class="n">${h.mh}m</td><td class="n">${h.nc}</td>
        <td class="n ac">${h.mt}m</td>
        <td class="n">${fmtE(h.ct)}</td><td class="n">${fmtE(h.cc)}</td>
        <td class="n">${fmtE(h.ph)}</td><td class="n ac">${fmtE(h.th)}</td>
      </tr>`).join('');
    document.getElementById('rHabF').innerHTML = `
      <tr class="ft">
        <td class="h">TOTAL</td><td colspan="4"></td>
        <td class="n">${fmtM(t.mt)}</td>
        <td class="n">${fmtE(t.ct)}</td><td class="n">${fmtE(t.cc)}</td>
        <td class="n">${fmtE(t.ph)}</td><td class="n">${fmtE(t.th)}</td>
      </tr>`;

    document.getElementById('rConf').innerHTML = `
      <div class="irow"><div class="irow-l">Total metros</div><div class="irow-v mono">${t.sm}m</div></div>
      <div class="irow"><div class="irow-l">Tela</div><div class="irow-v" style="font-size:12.5px">${c.nom || c.tip}</div></div>
      <div style="margin-top:12px">
        ${hs.map(h => `<div class="irow"><div class="irow-l">${h.num}</div><div class="irow-v" style="font-size:12px;color:var(--ink-35)">Ancho corte <strong style="color:var(--ink);font-family:var(--mono)">${h.acCon}m</strong> · Alto corte <strong style="color:var(--ink);font-family:var(--mono)">${h.alCon}m</strong> · ${h.nc} corte${h.nc > 1 ? 's' : ''}</div></div>`).join('')}
      </div>`;

    const cg = cuadrante(hs);
    document.getElementById('rCuad').innerHTML = cg.length ? cg.map(g => `
      <div class="res-cuad-c">
        <div class="rcc-d">${g.a}<span class="rcc-x">×</span>${g.al}</div>
        <div class="rcc-h">Hab: ${g.hs.join(', ')}</div>
        <div class="rcc-b">${g.c} corte${g.c > 1 ? 's' : ''}</div>
      </div>`).join('') : '<div style="font-size:13px;color:var(--pap-4);padding:4px 0">Sin datos</div>';

    document.getElementById('rRieles').innerHTML = hs.length ? hs.map(h => `
      <div class="res-riel-row">
        <div class="rr-num">${h.num}</div>
        <span class="rr-chip rr-an">Hueco ${h.an}m</span>
        <span class="rr-chip rr-rf">Riel ${h.rf}m</span>
        <span class="rr-chip rr-sop">${h.sop} soportes</span>
      </div>`).join('') : '<div style="font-size:13px;color:var(--pap-4);padding:4px 0">Sin habitaciones</div>';

    const med = hs.filter(h => h.an > 0 && h.al > 0).length;
    document.getElementById('rProg').innerHTML = `
      <div class="prog-wrap">
        <div class="prog-label"><span class="prog-txt">Habitaciones medidas</span><span class="prog-pct">${med} / ${hs.length}</span></div>
        <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        ${hs.map(h => {
      const ok = h.an > 0 && h.al > 0;
      return `<div style="display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;background:${ok ? 'var(--sage-bg)' : 'var(--pap-2)'};font-size:12px;font-weight:700;color:${ok ? 'var(--sage)' : 'var(--pap-4)'}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">${ok ? '<polyline points="20 6 9 17 4 12"/>' : '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'}</svg>
            ${h.num}
          </div>`;
    }).join('')}
      </div>`;
  },

  renderRel(o, hs, t, lkAll, lkPrecio) {
    const c = o.cfg;
    const isTec = !lkPrecio && o.estado !== 'cerrada';

    document.getElementById('cfgS').innerHTML = isTec
      ? `<div><div class="ci-l">Tipo tela</div>
          <select class="ci-i tl" style="height:32px;font-size:12px" ${lkAll ? 'disabled' : ''} onchange="upCfg('tip',this.value)">
            ${['VISILLO', 'BLACKOUT', 'LINO', 'OTRO'].map(t => `<option${c.tip === t ? ' selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div><div class="ci-l">Referencia tela</div><input class="ci-i tl" value="${c.nom}" placeholder="VETAMIN FR..." ${lkAll ? 'disabled' : ''} onchange="upCfg('nom',this.value)"></div>
        <div><div class="ci-l">N.º hojas (global)</div>
          <div style="display:flex;gap:3px;background:var(--pap-3);border-radius:6px;padding:2px">
            <div onclick="${lkAll ? '' : 'upCfg(\'nH\',1)'}" style="flex:1;text-align:center;padding:5px 4px;border-radius:4px;font-size:11.5px;font-weight:800;cursor:${lkAll ? 'not-allowed' : 'pointer'};background:${c.nH === 1 ? 'var(--white)' : 'transparent'};color:${c.nH === 1 ? 'var(--rust)' : 'var(--pap-4)'}">1 Hoja</div>
            <div onclick="${lkAll ? '' : 'upCfg(\'nH\',2)'}" style="flex:1;text-align:center;padding:5px 4px;border-radius:4px;font-size:11.5px;font-weight:800;cursor:${lkAll ? 'not-allowed' : 'pointer'};background:${c.nH === 2 ? 'var(--white)' : 'transparent'};color:${c.nH === 2 ? 'var(--rust)' : 'var(--pap-4)'}">2 Hojas</div>
          </div>
        </div>
        <div><div class="ci-l">Fruncido</div><input class="ci-i" type="number" step="0.1" min="1" max="4" value="${c.fr}" ${lkAll ? 'disabled' : ''} onchange="upCfg('fr',+this.value)"></div>
        <div><div class="ci-l">Bajo/cresta (m)</div><input class="ci-i" type="number" step="0.01" value="${c.bj}" ${lkAll ? 'disabled' : ''} onchange="upCfg('bj',+this.value)"></div>
        <div><div class="ci-l">Cierre (m)</div><input class="ci-i" type="number" step="0.01" value="${c.ci}" ${lkAll ? 'disabled' : ''} onchange="upCfg('ci',+this.value)"></div>`
      : `<div><div class="ci-l">Tipo tela</div><input class="ci-i tl" value="${c.tip}" ${lkAll ? 'disabled' : ''} onchange="upCfg('tip',this.value)"></div>
        <div><div class="ci-l">N.º hojas</div><input class="ci-i" type="number" value="${c.nH}" min="1" max="2" ${lkAll ? 'disabled' : ''} onchange="upCfg('nH',+this.value)"></div>
        <div><div class="ci-l">Fruncido</div><input class="ci-i" type="number" step="0.1" value="${c.fr}" ${lkAll ? 'disabled' : ''} onchange="upCfg('fr',+this.value)"></div>
        <div><div class="ci-l">P.Conf €/m</div><input class="ci-i" type="number" step="0.01" value="${c.pC}" ${lkAll ? 'disabled' : ''} onchange="upCfg('pC',+this.value)"></div>
        <div><div class="ci-l">P.Tela €/m</div><input class="ci-i" type="number" step="0.01" value="${c.pT}" ${lkAll ? 'disabled' : ''} onchange="upCfg('pT',+this.value)"></div>
        <div><div class="ci-l">Margen %</div><input class="ci-i" type="number" step="1" value="${c.mg}" ${lkAll ? 'disabled' : ''} onchange="upCfg('mg',+this.value)"></div>`;

    if (!lkAll) { this.renderMedForm(o); } else { document.getElementById('medForm').innerHTML = ''; }

    document.getElementById('relB').innerHTML = hs.map(h => {
      const beneficio = h.bn !== undefined ? h.bn : ((h.th || 0) - ((h.ct || 0) + (h.cc || 0)));

      return `
      <tr>
        <td class="n">${h.num}</td>
        <td><input class="c-i r" type="number" step="0.01" value="${h.an}" ${lkAll ? 'disabled' : ''} onchange="upHab('${h.id}','an',+this.value)"></td>
        <td><input class="c-i r" type="number" step="0.01" value="${h.al}" ${lkAll ? 'disabled' : ''} onchange="upHab('${h.id}','al',+this.value)"></td>
        <td><input class="c-i r" type="number" step="0.01" value="${h.pC}" ${lkAll ? 'disabled' : ''} onchange="upHab('${h.id}','pC',+this.value)"></td>
        <td><input class="c-i r" type="number" step="0.01" value="${h.pT}" ${lkAll ? 'disabled' : ''} onchange="upHab('${h.id}','pT',+this.value)"></td>
        <td><input class="c-i r" type="number" step="0.01" value="${h.pi}" ${lkAll ? 'disabled' : ''} onchange="upHab('${h.id}','pi',+this.value)"></td>
        <td><input class="c-i r" type="number" step="0.1" value="${h.fr}" ${lkAll ? 'disabled' : ''} onchange="upHab('${h.id}','fr',+this.value)"></td>
        <td><input class="c-i r" type="number" step="0.01" value="${h.bj}" ${lkAll ? 'disabled' : ''} onchange="upHab('${h.id}','bj',+this.value)"></td>
        <td class="n">${fmtM(h.mh)}</td>
        <td><input class="c-i r" type="number" step="1" value="${h.nc}" ${lkAll ? 'disabled' : ''} onchange="upHab('${h.id}','nc',+this.value)"></td>
        <td class="n">${fmtM(h.mt)}</td>
        <td class="n">${fmtE(h.ct)}</td>
        <td class="n">${fmtE(h.cc)}</td>
        <td class="n" style="font-weight:bold;">${fmtE(h.th)}</td>
        <td><input class="c-i r" type="number" step="1" value="${h.mg}" ${lkAll ? 'disabled' : ''} onchange="upHab('${h.id}','mg',+this.value)"></td>
        <td class="n" style="color:var(--sage);">${fmtE(beneficio)}</td>
        <td>${!lkAll ? `<button class="del-btn" onclick="delHab('${h.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>` : ''}</td>
      </tr>`;
    }).join('');

    const totalCoste = (t.ct || 0) + (t.cc || 0);
    const totalBeneficio = (t.th || 0) - totalCoste;

    document.getElementById('relF').innerHTML = `
      <tr class="ft">
        <td class="n">TOTAL</td>
        <td colspan="9"></td>
        <td class="n">${fmtM(t.mt)}</td>
        <td class="n">${fmtE(t.ct)}</td>
        <td class="n">${fmtE(t.cc)}</td>
        <td class="n" style="font-weight:bold;">${fmtE(t.th)}</td>
        <td></td>
        <td class="n" style="color:var(--sage);">${fmtE(totalBeneficio)}</td>
        <td></td>
      </tr>`;

    document.getElementById('mobHL').innerHTML = hs.map(h => {
      const nH = h.nc;
      return `
      <div class="mhc" id="mhc-${h.id}">
        <div class="mhc-hd">
          <div style="display:flex;flex-direction:column;gap:2px">
            <div class="mhc-num">Hab. <strong>${h.num}</strong></div>
            <div class="mhc-hojas">${nH} hoja${nH > 1 ? 's' : ''} · fruncido ${h.fr}× · ${h.mh}m/hoja</div>
          </div>
          <div style="margin-left:auto;text-align:right">
            <div class="mhc-mts">${h.mt}m</div>
            <div style="font-size:10.5px;color:var(--pap-4);margin-top:1px">${c.tip}</div>
          </div>
        </div>
        <div class="mhc-inps">
          <div class="mhc-cell"><div class="mhc-lbl">Ancho hueco</div><div class="mhc-wrap"><input class="mhc-field" type="number" step="0.01" value="${h.an}" ${lkAll ? 'disabled' : ''} onchange="upHab('${h.id}','an',+this.value)"><span class="mhc-unit">m</span></div></div>
          <div class="mhc-cell"><div class="mhc-lbl">Alto</div><div class="mhc-wrap"><input class="mhc-field" type="number" step="0.01" value="${h.al}" ${lkAll ? 'disabled' : ''} onchange="upHab('${h.id}','al',+this.value)"><span class="mhc-unit">m</span></div></div>
        </div>
        <div class="mhc-calcs">
          <div class="mhc-calc"><div class="mhc-cl">Med. hoja</div><div class="mhc-cv ac">${h.mh > 0 ? h.mh + 'm' : '—'}</div></div>
          <div class="mhc-calc"><div class="mhc-cl">Mts tela</div><div class="mhc-cv">${h.mt > 0 ? h.mt + 'm' : '—'}</div></div>
          <div class="mhc-calc"><div class="mhc-cl">Total</div><div class="mhc-cv">${fmtE(h.th)}</div></div>
        </div>
        ${!lkAll ? `<div class="mhc-foot"><button class="btn btn-danger btn-sm" onclick="delHab('${h.id}')">Eliminar hab.</button></div>` : ''}
      </div>`;
    }).join('');

    document.getElementById('totsB').innerHTML = `
      <div><div class="t-l">Habitaciones</div><div class="t-v">${hs.length}</div></div>
      <div><div class="t-l">Metros tela</div><div class="t-v ac">${t.mt}m</div></div>
      <div><div class="t-l">Coste total</div><div class="t-v">${fmtE(t.ph)}</div></div>
      <div><div class="t-l">Con margen</div><div class="t-v">${fmtE(t.th)}</div></div>`;
  },

  renderCon(o, hs, t) {
    const c = o.cfg;
    const chunkSize = 6;
    const chunks = [];
    for (let i = 0; i < hs.length; i += chunkSize) { chunks.push(hs.slice(i, i + chunkSize)); }
    if (chunks.length === 0) chunks.push([]);

    const html = chunks.map((chunk, i) => {
      const chunkTotal = chunk.reduce((acc, h) => acc + h.sm, 0);
      const rows = chunk.map(h => {
        let widthStr = h.nc === 1 ? `${h.acCon}` : `${h.acCon} + ${h.acCon}`;
        const corteStr = `${h.nc} &nbsp;|&nbsp; ${c.tip} &nbsp;|&nbsp; ${h.acCon} &nbsp;|&nbsp; = &nbsp;|&nbsp; ${h.sm}`;
        return `<tr><td style="text-align:center; font-weight:700;">${h.num}</td><td style="text-align:center; padding:0;"><div class="medida-wrap"><div class="medida-ancho">${widthStr}</div><div class="medida-line"></div><div class="medida-alto">${h.alCon}</div></div></td><td style="text-align:center">${corteStr}</td><td style="text-align:right; font-weight:700; padding-right:15px;">${h.sm} m</td></tr>`;
      }).join('');

      return `<div class="print-page"><div class="print-header"><div>OBRA: <span style="font-weight:700;">${o.nombre.toUpperCase()}</span></div><div>FECHA: <span style="font-weight:700;">${new Date().toLocaleDateString()}</span></div></div><div class="print-box"><table class="print-table"><thead><tr><th width="10%">N° HAB</th><th width="20%">MEDIDAS</th><th width="55%">CORTE</th><th width="15%">SUMA m</th></tr></thead><tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:#999;padding:20px;">Sin habitaciones registradas</td></tr>'}</tbody></table><div class="print-subtotal">TOTAL BLOQUE: <span style="font-weight:700;">${chunkTotal.toFixed(2)} m</span></div><div class="print-footer"><div class="pf-grid"><div class="pf-row"><span class="pf-label">Cliente:</span> <span class="pf-val">${o.c1n || ''}</span>${!o.c1n ? '<span class="pf-line"></span>' : ''}</div><div class="pf-row"><span class="pf-label">Fecha:</span> <span class="pf-line"></span></div><div class="pf-row"><span class="pf-label">Costurera:</span> <span class="pf-line"></span></div><div class="pf-row"><span class="pf-label">Confección:</span> <span class="pf-line"></span></div><div class="pf-row"><span class="pf-label">Garfios:</span> <span class="pf-line"></span></div><div class="pf-row"><span class="pf-label">Tela:</span> <span class="pf-val">${c.nom || c.tip} / ${t.sm}m Total</span></div></div></div></div></div>`;
    }).join('');

    const panel = document.getElementById('pn-confeccion');
    panel.innerHTML = `<div class="pi obra-safe"><div class="mod-hd no-print"><div class="mod-title">Hoja de confección</div><span style="font-size:13px;color:var(--ink-35)">Vista de taller</span><button class="btn btn-outline btn-sm" onclick="window.print()" style="margin-left:auto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg> Imprimir / PDF</button></div><div class="print-container">${html}</div></div>`;
  },

  renderMedForm(o) {
    const c = o.cfg || {};
    const nextNum = 100 + o.habs.length + 1;
    document.getElementById('medForm').innerHTML = `
      <div style="background:var(--white);border:1px solid var(--pap-3);border-radius:var(--r12);padding:16px;margin-bottom:14px;box-shadow:var(--s-xs)">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:var(--rust);margin-bottom:12px;display:flex;align-items:center;gap:6px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Nueva medici&#243;n
        </div>
        <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:10px;row-gap:14px">
          <div><div class="ci-l">HABITACION</div><input class="ci-i tl" id="nm-hab" value="${nextNum}"></div>
          <div><div class="ci-l">ANCHO HUECO</div><input class="ci-i" type="number" id="nm-ancho" step="0.01"></div>
          <div><div class="ci-l">ALTURA</div><input class="ci-i" type="number" id="nm-alto" step="0.01"></div>
          <div><div class="ci-l">P. CONF.</div><input class="ci-i" type="number" id="nm-pconf" value="${c.pC || 0}" step="0.01"></div>
          <div><div class="ci-l">P. TELA</div><input class="ci-i" type="number" id="nm-ptela" value="${c.pT || 0}" step="0.01"></div>
          <div><div class="ci-l">P. INST.</div><input class="ci-i" type="number" id="nm-pinst" value="${c.pi || 0}" step="0.01"></div>
          <div><div class="ci-l">FRUNCIDO</div><input class="ci-i" type="number" id="nm-fr" value="${c.fr || 0}" step="0.1"></div>
          <div><div class="ci-l">BAJO/CRESTA</div><input class="ci-i" type="number" id="nm-bj" value="${c.bj || 0}" step="0.01"></div>
          <div><div class="ci-l">MED. HOJA</div><input class="ci-i" type="number" id="nm-med-hoja" step="0.01"></div>
          <div><div class="ci-l">N&#186; HOJAS</div><input class="ci-i" type="number" id="nm-hojas" value="${c.nH || 1}"></div>
          <div><div class="ci-l">MTS TELA</div><input class="ci-i" type="number" id="nm-mtstela" step="0.01"></div>
          <div><div class="ci-l">COSTE TELA</div><input class="ci-i" type="number" id="nm-costetela" step="0.01"></div>
          <div><div class="ci-l">COSTE CONF.</div><input class="ci-i" type="number" id="nm-costeconf" step="0.01"></div>
          <div><div class="ci-l">P. HUECO</div><input class="ci-i" type="number" id="nm-phueco" step="0.01"></div>
          <div><div class="ci-l">MARGEN</div><input class="ci-i" type="number" id="nm-margen" value="${c.mg || 0}"></div>
          <div><div class="ci-l">BENEFICIO</div><input class="ci-i" type="number" id="nm-beneficio" step="0.01"></div>
        </div>
      </div>`;
  },

  renderCuad(hs) {
    document.getElementById('cuadB').innerHTML = hs.map(h => `<tr><td class="h">${h.num}</td><td class="n">${h.an}</td><td class="n">${h.al}</td><td class="n">${h.aEst}</td><td class="n ac">${h.aEst}</td><td class="n">${h.nc}</td><td class="n ac">${h.alCu}</td></tr>`).join('');
    document.getElementById('cuadG').innerHTML = cuadrante(hs).map(g => `<div class="cuad-card"><div class="cuad-d">${g.a}<span class="cuad-x">×</span>${g.al}</div><div class="cuad-h">Hab: ${g.hs.join(', ')}</div><div class="cuad-b">${g.c} corte${g.c > 1 ? 's' : ''}</div></div>`).join('');
  },

  renderRiel(hs, lk) {
    document.getElementById('rielB').innerHTML = hs.map(h => `<tr><td class="h">${h.num}</td><td class="n">${h.an}m</td><td class="n ac">${h.rf}m</td><td class="n">${h.sop}</td><td><select class="c-i" style="width:105px;text-align:left;font-family:var(--sans)" ${lk ? 'disabled' : ''}><option value="">—</option><option>T (Techo)</option><option>F (Fachada)</option></select></td><td><input class="c-i" type="number" placeholder="0" min="0" style="width:55px" ${lk ? 'disabled' : ''}></td></tr>`).join('');
  }
};
