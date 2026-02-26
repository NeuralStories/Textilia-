import { auth, ROLES } from '../auth.js';
import { api } from '../api.js';
import { ui } from '../ui.js';
import { router } from '../router.js';

export const Ficha = {
  OID: null,
  NH: 1,

  render() {
    const u = auth.getUser();
    const r = ROLES[u.role];
    
    return `
      <div class="screen active" id="sc-ficha">
        <nav class="topbar">
          <div class="tb-logo">Textilia<em>.</em></div>
          <div class="tb-bc">
            <span class="c lnk" id="bc-dash">Proyectos</span>
            <span class="sep">›</span>
            <span class="c act" id="fichaBC">Nueva obra</span>
          </div>
          <div class="tb-right">
            <div class="upill"><div class="uav">${r.ini}</div><span class="rbdg ${r.cls} hd-m">${r.name}</span></div>
            <button class="btn btn-ghost btn-sm" id="btn-back">← Volver</button>
          </div>
        </nav>
        <div class="fb mob-safe">
          <div class="fey" id="fichaStep">Paso 1 de 2 — Nueva obra</div>
          <div class="fh1">Ficha de la obra</div>
          <div class="fsub">Datos generales antes de introducir medidas</div>

          <div class="fsec">
            <div class="fsh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg><div class="fst">Identificación</div></div>
            <div class="fsb">
              <div class="g3">
                <div class="fld"><label class="lbl">Referencia <span class="req">*</span></label><input class="fi fref" id="fRef"></div>
                <div class="fld"><label class="lbl">Nombre <span class="req">*</span></label><input class="fi" id="fNom" placeholder="Hotel Costa Serena"></div>
                <div class="fld"><label class="lbl">Fecha <span class="req">*</span></label><input class="fi" type="date" id="fFec"></div>
              </div>
              <div class="g2">
                <div class="fld"><label class="lbl">Dirección</label><input class="fi" id="fDir" placeholder="C/ Mayor 12, Madrid"></div>
                <div class="fld"><label class="lbl">Observaciones</label><textarea class="ft" id="fObs" placeholder="Instalación visillos planta 1 y 2. Acceso puerta trasera..." rows="2"></textarea></div>
              </div>
            </div>
          </div>

          <div class="fsec">
            <div class="fsh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><div class="fst">Contacto principal</div></div>
            <div class="fsb">
              <div class="g4">
                <div class="fld"><label class="lbl">Nombre <span class="req">*</span></label><input class="fi" id="fC1n" placeholder="Juan García"></div>
                <div class="fld"><label class="lbl">Empresa</label><input class="fi" id="fC1e" placeholder="Constructora SA"></div>
                <div class="fld"><label class="lbl">Teléfono <span class="req">*</span></label><input class="fi" id="fC1t" type="tel" placeholder="603 456 789"></div>
                <div class="fld"><label class="lbl">Email</label><input class="fi" id="fC1m" type="email" placeholder="juan@empresa.com"></div>
              </div>
            </div>
          </div>

          <div class="fsec">
            <div class="fsh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg><div class="fst">Contacto secundario <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--pap-4)">(opcional)</span></div></div>
            <div class="fsb">
              <div class="g4">
                <div class="fld"><label class="lbl">Nombre</label><input class="fi" id="fC2n"></div>
                <div class="fld"><label class="lbl">Empresa</label><input class="fi" id="fC2e"></div>
                <div class="fld"><label class="lbl">Teléfono</label><input class="fi" id="fC2t" type="tel"></div>
                <div class="fld"><label class="lbl">Email</label><input class="fi" id="fC2m" type="email"></div>
              </div>
            </div>
          </div>

          <div class="fsec">
            <div class="fsh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/></svg><div class="fst">Configuración de materiales</div></div>
            <div class="fsb">
              <div id="fBlocked" class="blocked" style="display:none">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Solo el Gestor o Admin puede modificar precios y configuración de materiales.
              </div>
              <div id="fCfg">
                <div class="g4" style="margin-bottom:14px">
                  <div class="fld"><label class="lbl">Tipo de tela</label><select class="fs" id="fTip"><option>VISILLO</option><option>BLACKOUT</option><option>LINO</option><option>OTRO</option></select></div>
                  <div class="fld sp2"><label class="lbl">Nombre de la tela</label><input class="fi" id="fNomT" placeholder="VETAMIN FR C/100 (BITEX)"></div>
                  <div class="fld"><label class="lbl">N.º de hojas</label><div class="tgl" id="nHTgl"><div class="tgl-o on" id="nh-1">1 Hoja</div><div class="tgl-o" id="nh-2">2 Hojas</div></div></div>
                </div>
                <div class="g4" style="margin-bottom:14px">
                  <div class="fld"><label class="lbl">Fruncido</label><input class="fi" id="fFr" type="number" step="0.1" min="1" max="4"></div>
                  <div class="fld"><label class="lbl">Bajo y cresta (m)</label><input class="fi" id="fBj" type="number" step="0.01" min="0"></div>
                  <div class="fld"><label class="lbl">Descuento alto (m)</label><input class="fi" id="fDA" type="number" step="0.01" min="0"></div>
                  <div class="fld"><label class="lbl">Añadido cierre (m)</label><input class="fi" id="fCi" type="number" step="0.01" min="0"></div>
                </div>
                <div class="g4">
                  <div class="fld"><label class="lbl">P. Confección (€/m)</label><input class="fi" id="fPC" type="number" step="0.01" min="0"></div>
                  <div class="fld"><label class="lbl">P. Tela (€/m)</label><input class="fi" id="fPT" type="number" step="0.01" min="0"></div>
                  <div class="fld"><label class="lbl">P. Instalación (€)</label><input class="fi" id="fPI" type="number" step="0.01" min="0"></div>
                  <div class="fld"><label class="lbl">Margen (%)</label><input class="fi" id="fMg" type="number" step="1" min="0" max="100"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="ffoot">
            <button class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button class="btn btn-rust btn-lg" id="btn-save">
              Guardar y continuar
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  init(params) {
    this.OID = params && params.id ? params.id : null;
    
    // Bind events
    document.getElementById('bc-dash').addEventListener('click', () => router.navigate('dashboard'));
    document.getElementById('btn-back').addEventListener('click', () => router.navigate('dashboard'));
    document.getElementById('btn-cancel').addEventListener('click', () => router.navigate('dashboard'));
    document.getElementById('btn-save').addEventListener('click', () => this.saveObra());
    
    document.getElementById('nh-1').addEventListener('click', () => this.setNH(1));
    document.getElementById('nh-2').addEventListener('click', () => this.setNH(2));

    this.loadData();
  },

  loadData() {
    if (this.OID) {
      const o = api.getObra(this.OID);
      if (!o) return router.navigate('dashboard');
      
      document.getElementById('fichaBC').textContent = 'Editar ficha';
      document.getElementById('fichaStep').textContent = 'Editar ficha de obra';
      
      document.getElementById('fRef').value = o.ref;
      document.getElementById('fNom').value = o.nombre;
      document.getElementById('fDir').value = o.dir || '';
      document.getElementById('fFec').value = o.fecha;
      document.getElementById('fObs').value = o.obs || '';
      document.getElementById('fC1n').value = o.c1n || '';
      document.getElementById('fC1e').value = o.c1emp || '';
      document.getElementById('fC1t').value = o.c1t || '';
      document.getElementById('fC1m').value = o.c1e || '';
      
      const c = o.cfg;
      document.getElementById('fTip').value = c.tip;
      document.getElementById('fNomT').value = c.nom;
      document.getElementById('fFr').value = c.fr;
      document.getElementById('fBj').value = c.bj;
      document.getElementById('fDA').value = c.dA;
      document.getElementById('fCi').value = c.ci;
      document.getElementById('fPC').value = c.pC;
      document.getElementById('fPT').value = c.pT;
      document.getElementById('fPI').value = c.pI;
      document.getElementById('fMg').value = c.mg;
      
      this.setNH(c.nH);
    } else {
      document.getElementById('fichaBC').textContent = 'Nueva obra';
      document.getElementById('fichaStep').textContent = 'Paso 1 de 2 — Nueva obra';
      document.getElementById('fFec').value = new Date().toISOString().split('T')[0];
      
      const OBRAS = api.getObras();
      const n = String(OBRAS.length + 1).padStart(3, '0');
      document.getElementById('fRef').value = `REF-${new Date().getFullYear()}-${n}`;
      
      [['fFr', 2], ['fBj', 0.25], ['fDA', 0], ['fCi', 0.06], ['fPC', 0], ['fPT', 0], ['fPI', 0], ['fMg', 0]].forEach(([id, v]) => document.getElementById(id).value = v);
      this.setNH(1);
    }
    
    this.applyRoleFicha();
  },

  applyRoleFicha() {
    const can = auth.canEditPrices();
    document.getElementById('fCfg').style.display = can ? '' : 'none';
    document.getElementById('fBlocked').style.display = can ? 'none' : '';
  },

  setNH(n) {
    this.NH = n;
    document.getElementById('nh-1').classList.toggle('on', n === 1);
    document.getElementById('nh-2').classList.toggle('on', n === 2);
  },

  saveObra() {
    const nom = document.getElementById('fNom').value.trim();
    if (!nom) { ui.showToast('El nombre es obligatorio', 'err'); return; }
    
    const cfg = {
      nH: this.NH,
      fr: +document.getElementById('fFr').value,
      bj: +document.getElementById('fBj').value,
      dA: +document.getElementById('fDA').value,
      ci: +document.getElementById('fCi').value,
      pC: +document.getElementById('fPC').value,
      pT: +document.getElementById('fPT').value,
      pI: +document.getElementById('fPI').value,
      mg: +document.getElementById('fMg').value,
      tip: document.getElementById('fTip').value,
      nom: document.getElementById('fNomT').value
    };
    
    const data = {
      nombre: nom,
      ref: document.getElementById('fRef').value,
      dir: document.getElementById('fDir').value,
      fecha: document.getElementById('fFec').value,
      obs: document.getElementById('fObs').value,
      c1n: document.getElementById('fC1n').value,
      c1t: document.getElementById('fC1t').value,
      c1e: document.getElementById('fC1m').value,
      c1emp: document.getElementById('fC1e').value,
      c2n: document.getElementById('fC2n').value,
      c2t: document.getElementById('fC2t').value,
      c2e: document.getElementById('fC2m').value,
      cfg
    };

    if (this.OID) {
      data.id = this.OID;
      api.saveObra(data);
      ui.showToast('Ficha actualizada', 'ok');
      router.navigate('obra', { id: this.OID });
    } else {
      data.estado = 'en_medicion';
      data.habs = [];
      const newObra = api.saveObra(data);
      ui.showToast('Obra creada', 'ok');
      router.navigate('obra', { id: newObra.id });
    }
  }
};
