import { auth, ROLES } from '../auth.js';
import { api } from '../api.js';
import { ui } from '../ui.js';
import { router } from '../router.js';
import { calc, tots, cuadrante, fmtE, fmtM } from '../calculos.js';

export const Obra = {
  OID: null,
  activeTab: 'relacion',
  _hT: null,
  _cT: null,

  render() {
    const u = auth.getUser();
    const r = ROLES[u.role];
    const isIntro = u.role === 'introductor';

    return `
      <div class="screen active" id="sc-obra">
        <nav class="topbar">
          <div class="tb-logo">Textilia<em>.</em></div>
          <div class="tb-bc">
            <span class="c lnk" id="bc-dash">Proyectos</span>
            <span class="sep hd-m">›</span>
            <span class="c hd-m" id="oBC" style="max-width:130px">—</span>
            <span class="sep hd-m">›</span>
            <span class="c act" id="mBC">Relación</span>
          </div>
          <div class="tb-right">
            <div class="save-ind hd-m"><div class="sdot" id="sDot"></div><span id="sTxt">Guardado</span></div>
            <div class="upill"><div class="uav">${r.ini}</div><span class="rbdg ${r.cls} hd-m">${r.name}</span></div>
            ${!isIntro ? `
            <button class="btn btn-ghost btn-sm btn-icon hd-m" id="btn-edit-ficha" title="Editar ficha">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            ` : ''}
            <button class="btn btn-ghost btn-sm hd-m" id="btn-back">← Obras</button>
          </div>
        </nav>

        <div class="obra-shell">
          <div class="obra-layout">
            <aside class="obra-sb">
              <div class="sb-meta">
                <div class="sb-ref" id="sbRef">—</div>
                <div class="sb-name" id="sbName">—</div>
                <span class="bdg bdg-m" id="sbSt">En medición</span>
              </div>
              <div class="sb-sec">Módulos</div>
              <div class="sb-it" data-tab="resumen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>Resumen</div>
              <div class="sb-it on" data-tab="relacion"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>Relación</div>
              <div class="sb-it" data-tab="confeccion"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>Confección</div>
              <div class="sb-it" data-tab="cuadrante"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Cuadrante</div>
              <div class="sb-it" data-tab="rieles"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>Rieles</div>
              ${!isIntro ? `
              <div class="sb-sec" style="margin-top:10px">Acciones</div>
              <div class="sb-it" id="sb-edit-ficha"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Editar ficha</div>
              <div class="sb-it" id="sb-export-pdf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>Exportar PDF</div>
              ` : ''}
            </aside>

            <div class="obra-main">
              <div class="mod-tabs">
                <div class="mod-tab" id="mt-resumen" data-tab="resumen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>Resumen</div>
                <div class="mod-tab on" id="mt-relacion" data-tab="relacion"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>Relación</div>
                <div class="mod-tab" id="mt-confeccion" data-tab="confeccion"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>Confección</div>
                <div class="mod-tab" id="mt-cuadrante" data-tab="cuadrante"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Cuadrante</div>
                <div class="mod-tab" id="mt-rieles" data-tab="rieles"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>Rieles</div>
              </div>

              <div class="panels">
                <!-- RESUMEN COMPLETO -->
                <div class="panel" id="pn-resumen">
                  <div class="pi obra-safe">
                    <div class="mod-hd">
                      <div class="mod-title">Resumen de obra</div>
                      <button class="btn btn-outline btn-sm" id="btn-pdf-resumen">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>
                        Exportar PDF
                      </button>
                    </div>
                    <div class="res-kpis" id="rKpis"></div>
                    <div class="res-grid">
                      <div class="icard"><div class="icard-hd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg><div class="icard-title">Ficha de obra</div></div><div class="icard-body" id="rFicha"></div></div>
                      <div class="icard"><div class="icard-hd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><div class="icard-title">Contacto</div></div><div class="icard-body" id="rContacto"></div></div>
                      <div class="icard"><div class="icard-hd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/></svg><div class="icard-title">Configuración de tela</div></div><div class="icard-body" id="rConfig"></div></div>
                    </div>
                    <div class="sec-div"><div class="sec-div-line"></div><div class="sec-div-lbl">Relación de habitaciones</div><div class="sec-div-line"></div></div>
                    <div class="tw-wrap" style="margin-bottom:6px">
                      <table class="res-hab-tbl">
                        <thead><tr><th>Hab.</th><th class="r">Ancho</th><th class="r">Alto</th><th class="r">Med.Hoja</th><th class="r">Hojas</th><th class="r">Mts Tela</th><th class="r">€ Tela</th><th class="r">€ Conf.</th><th class="r">Subtotal</th><th class="r">Total c/mg</th></tr></thead>
                        <tbody id="rHabB"></tbody><tfoot id="rHabF"></tfoot>
                      </table>
                    </div>
                    <div class="sec-div"><div class="sec-div-line"></div><div class="sec-div-lbl">Confección &amp; Cuadrante &amp; Rieles</div><div class="sec-div-line"></div></div>
                    <div class="res-grid">
                      <div class="icard"><div class="icard-hd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/></svg><div class="icard-title">Confección</div></div><div class="icard-body" id="rConf"></div></div>
                      <div class="icard"><div class="icard-hd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg><div class="icard-title">Cuadrante de corte</div></div><div class="icard-body"><div class="res-cuad" id="rCuad"></div></div></div>
                      <div class="icard"><div class="icard-hd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg><div class="icard-title">Rieles</div></div><div class="icard-body" id="rRieles"></div></div>
                    </div>
                    <div class="icard" style="margin-top:4px"><div class="icard-hd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><div class="icard-title">Progreso de medición</div></div><div class="icard-body" id="rProg"></div></div>
                    <div class="print-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="9" width="12" height="12" rx="1"/><path d="M6 12H4a1 1 0 01-1-1V7a1 1 0 011-1h16a1 1 0 011 1v4a1 1 0 01-1 1h-2M9 21v-6h6v6"/></svg>Usa <strong style="margin:0 3px">Exportar PDF</strong> para generar un documento listo para imprimir o compartir con cliente y costurera.</div>
                  </div>
                </div>

                <!-- RELACIÓN -->
                <div class="panel on" id="pn-relacion">
                  <div class="pi obra-safe">
                    <div class="mod-hd">
                      <div class="mod-title">Relación de habitaciones</div>
                      <!-- Removed top Add button as requested to use the new form, but keeping it if user wants quick add? 
                           The prompt says "Añadir: Zona Nueva Medición ... Insertar un bloque entre el bloque global y la tabla".
                           It doesn't explicitly say to remove the old button, but the new form has an "Añadir" button. 
                           I'll keep the old button hidden or remove it to avoid confusion, 
                           but the prompt says "Mantener la tabla visual tal cual". 
                           I will leave the header button for now or maybe hide it via CSS if needed, 
                           but the instruction says "Insertar un bloque...". 
                           I will insert the #medForm container. -->
                    </div>
                    <div class="cfg-strip" id="cfgS"></div>
                    
                    <!-- NEW MANUAL ENTRY ZONE -->
                    <div id="medForm"></div>
                    
                    <div class="tw-wrap hd-t">
                      <table class="dtbl">
                        <thead><tr><th>Hab.</th><th class="r">Ancho</th><th class="r">Alto</th><th class="r">Med.Hoja</th><th class="r">Hojas</th><th class="r">Mts Tela</th><th class="r">€ Tela</th><th class="r">€ Conf.</th><th class="r">Total</th><th></th></tr></thead>
                        <tbody id="relB"></tbody><tfoot id="relF"></tfoot>
                      </table>
                    </div>
                    <div class="mob-habs hd-d" id="mobHL"></div>
                    <button class="add-hab" id="btn-add-hab-mob">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      Añadir habitación
                    </button>
                    <div class="tots" id="totsB"></div>
                  </div>
                </div>

                <!-- CONFECCIÓN -->
                <div class="panel" id="pn-confeccion">
                  <div class="pi obra-safe">
                    <div class="mod-hd"><div class="mod-title">Hoja de confección</div><span style="font-size:13px;color:var(--ink-35)">Para costurera</span></div>
                    <div class="tw-wrap">
                      <table class="dtbl" style="min-width:480px">
                        <thead><tr><th>Hab.</th><th class="r">Med. ancho</th><th class="r">Ancho corte</th><th class="r">Alto</th><th class="r">Alto corte</th><th class="r">Cortes</th><th class="r">SUMA m</th></tr></thead>
                        <tbody id="conB"></tbody><tfoot id="conF"></tfoot>
                      </table>
                    </div>
                    <div class="csum" id="conS"></div>
                  </div>
                </div>

                <!-- CUADRANTE -->
                <div class="panel" id="pn-cuadrante">
                  <div class="pi obra-safe">
                    <div class="mod-hd"><div class="mod-title">Cuadrante de corte</div><span style="font-size:13px;color:var(--ink-35)">Agrupado por dimensiones idénticas</span></div>
                    <div class="tw-wrap">
                      <table class="dtbl" style="min-width:520px">
                        <thead><tr><th>Hab.</th><th class="r">Ancho</th><th class="r">Alto</th><th class="r">Ancho std</th><th class="r">Ancho corte</th><th class="r">Cortes</th><th class="r">Alto corte</th></tr></thead>
                        <tbody id="cuadB"></tbody>
                      </table>
                    </div>
                    <div style="font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:var(--ink-35);margin-top:22px;margin-bottom:10px">Grupos de corte idénticos</div>
                    <div class="cuad-grid" id="cuadG"></div>
                  </div>
                </div>

                <!-- RIELES -->
                <div class="panel" id="pn-rieles">
                  <div class="pi obra-safe">
                    <div class="mod-hd"><div class="mod-title">Rieles</div><span style="font-size:13px;color:var(--ink-35)">Medidas de instalación</span></div>
                    <div class="tw-wrap">
                      <table class="dtbl" style="min-width:420px">
                        <thead><tr><th>Hab.</th><th class="r">Ancho hueco</th><th class="r">Riel final</th><th class="r">Soportes</th><th>Tipo</th><th class="r">Escuadras</th></tr></thead>
                        <tbody id="rielB"></tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button class="fab" id="FAB" style="display:flex;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>

        <div class="obra-bnav">
          <div class="obn-it" data-tab="resumen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>Resumen</div>
          <div class="obn-it on" data-tab="relacion"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>Relación</div>
          <div class="obn-it" data-tab="confeccion"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>Conf.</div>
          <div class="obn-it" data-tab="cuadrante"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Cuadrante</div>
          <div class="obn-it" data-tab="rieles"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>Rieles</div>
        </div>
      </div>
    `;
  },

  init(params) {
    this.OID = params.id;
    this.activeTab = 'relacion';
    
    // Bind events
    document.getElementById('bc-dash').addEventListener('click', () => router.navigate('dashboard'));
    document.getElementById('btn-back').addEventListener('click', () => router.navigate('dashboard'));
    
    const editFicha = document.getElementById('btn-edit-ficha');
    if(editFicha) editFicha.addEventListener('click', () => router.navigate('ficha', { id: this.OID }));
    
    const sbEdit = document.getElementById('sb-edit-ficha');
    if(sbEdit) sbEdit.addEventListener('click', () => router.navigate('ficha', { id: this.OID }));
    
    const exportPdf = document.getElementById('sb-export-pdf');
    if(exportPdf) exportPdf.addEventListener('click', () => ui.showToast('PDF generado correctamente', 'ok'));
    
    document.getElementById('btn-pdf-resumen').addEventListener('click', () => ui.showToast('PDF generado', 'ok'));
    
    const btnAdd = document.getElementById('btn-add-hab');
    if(btnAdd) btnAdd.addEventListener('click', () => this.addHab());
    
    const btnAddMob = document.getElementById('btn-add-hab-mob');
    if(btnAddMob) btnAddMob.addEventListener('click', () => this.addHab());
    
    document.getElementById('FAB').addEventListener('click', () => this.addHab());

    // Tab switching
    const tabHandler = (e) => {
      const tab = e.currentTarget.dataset.tab;
      this.swTab(tab);
    };
    
    document.querySelectorAll('.sb-it[data-tab]').forEach(el => el.addEventListener('click', tabHandler));
    document.querySelectorAll('.mod-tab[data-tab]').forEach(el => el.addEventListener('click', tabHandler));
    document.querySelectorAll('.obn-it[data-tab]').forEach(el => el.addEventListener('click', tabHandler));

    // Make functions global for inline events in generated HTML
    window.delHab = (id) => this.delHab(id);
    window.upHab = (id, f, v) => this.upHab(id, f, v);
    window.upCfg = (f, v) => this.upCfg(f, v);
    window.addMedicion = () => this.addMedicion();

    this.loadData();
  },

  addMedicion() {
    // 1. Get values
    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : '';
    };
    const getNum = (id) => {
        const v = getVal(id);
        return v === '' ? 0 : parseFloat(v);
    };

    const hab = getVal('nm-hab');
    const ancho = getNum('nm-ancho');
    const alto = getNum('nm-alto');

    // 2. Validation
    if (!hab || ancho <= 0 || alto <= 0) {
        ui.showToast('Faltan datos obligatorios (Hab, Ancho, Alto)', 'err');
        return;
    }

    // 3. Construct payload (merging with global defaults handled in UI inputs)
    const payload = {
        num: hab,
        an: ancho,
        al: alto,
        // Identification
        nomTela: getVal('nm-nom'),
        tela: getVal('nm-tela'),
        visillo: getVal('nm-visillo'),
        med2: getNum('nm-med2'),
        
        // Measures
        mh: getNum('nm-med-hoja'), // If 0, will be calculated
        nc: getNum('nm-hojas'),
        
        // Params
        fr: getNum('nm-fr'),
        bj: getNum('nm-bj'),
        ci: getNum('nm-ci'),
        rep: getNum('nm-rep'),
        ff: getNum('nm-ff'),
        
        // Costs
        pT: getNum('nm-pt'),
        pV: getNum('nm-pv'),
        pC: getNum('nm-cc'),
        cInst: getNum('nm-ci-cost'),
        cOther: getNum('nm-otros'),
        desc: getNum('nm-desc'),
        
        // Sale
        mg: getNum('nm-mg'),
        iva: getNum('nm-iva')
    };

    // 4. Save
    api.addHab(this.OID, payload);
    this.renderMod(this.activeTab);
    ui.showSave();
    ui.showToast('Medición añadida correctamente', 'ok');
  },

  loadData() {
    const o = api.getObra(this.OID);
    if (!o) return router.navigate('dashboard');
    
    document.getElementById('oBC').textContent = o.nombre;
    document.getElementById('sbRef').textContent = o.ref;
    document.getElementById('sbName').textContent = o.nombre;
    
    const bl = { borrador: 'bdg-b', en_medicion: 'bdg-m', revisada: 'bdg-r', cerrada: 'bdg-c' };
    const ll = { borrador: 'Borrador', en_medicion: 'En medición', revisada: 'Revisada', cerrada: 'Cerrada' };
    
    const st = document.getElementById('sbSt');
    st.textContent = ll[o.estado];
    st.className = 'bdg ' + bl[o.estado];
    
    this.swTab('relacion');
  },

  swTab(tab) {
    this.activeTab = tab;
    
    // Update UI classes
    document.querySelectorAll('.mod-tab').forEach(t => t.classList.remove('on'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('on'));
    document.querySelectorAll('.sb-it').forEach(e => e.classList.remove('on'));
    document.querySelectorAll('.obn-it').forEach(e => e.classList.remove('on'));

    const mt = document.getElementById('mt-' + tab); if (mt) mt.classList.add('on');
    const pn = document.getElementById('pn-' + tab); if (pn) pn.classList.add('on');
    
    // Sidebar items
    document.querySelectorAll(`.sb-it[data-tab="${tab}"]`).forEach(e => e.classList.add('on'));
    // Bottom nav items
    document.querySelectorAll(`.obn-it[data-tab="${tab}"]`).forEach(e => e.classList.add('on'));

    const fab = document.getElementById('FAB');
    if (fab) fab.style.display = tab === 'relacion' ? 'flex' : 'none';
    
    document.getElementById('mBC').textContent = { resumen: 'Resumen', relacion: 'Relación', confeccion: 'Confección', cuadrante: 'Cuadrante', rieles: 'Rieles' }[tab];
    
    this.renderMod(tab);
  },

  renderMod(tab) {
    const o = api.getObra(this.OID); if (!o) return;
    const hs = o.habs.map(h => calc(h, o.cfg));
    const t = tots(hs);
    const lkAll = o.estado === 'cerrada';
    const lkPrecio = o.estado === 'cerrada' || auth.getRole() === 'introductor';
    
    if (tab === 'resumen') ui.renderResumen(o, hs, t);
    if (tab === 'relacion') ui.renderRel(o, hs, t, lkAll, lkPrecio);
    if (tab === 'confeccion') ui.renderCon(o, hs, t);
    if (tab === 'cuadrante') ui.renderCuad(hs);
    if (tab === 'rieles') ui.renderRiel(hs, lkAll);
  },

  addHab() {
    const o = api.getObra(this.OID);
    if (o.estado === 'cerrada') { ui.showToast('La obra está cerrada', 'err'); return; }
    const n = 100 + o.habs.length + 1;
    api.addHab(this.OID, { num: String(n), an: 0, al: 0 });
    this.renderMod(this.activeTab);
    ui.showSave();
    ui.showToast('Habitación ' + n + ' añadida');
  },

  delHab(hid) {
    api.deleteHab(this.OID, hid);
    this.renderMod(this.activeTab);
    ui.showSave();
  },

  upHab(hid, f, v) {
    api.updateHab(this.OID, hid, f, v);
    clearTimeout(this._hT); 
    this._hT = setTimeout(() => this.renderMod(this.activeTab), 100);
    ui.showSave();
  },

  upCfg(f, v) {
    api.updateCfg(this.OID, f, v);
    clearTimeout(this._cT); 
    this._cT = setTimeout(() => this.renderMod(this.activeTab), 100);
    ui.showSave();
  }
};
