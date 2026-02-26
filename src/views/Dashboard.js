import { auth, ROLES } from '../auth.js';
import { api } from '../api.js';
import { ui } from '../ui.js';
import { router } from '../router.js';
import { calc, tots } from '../calculos.js';

export const Dashboard = {
  filt: 'all',

  render() {
    const u = auth.getUser();
    const r = ROLES[u.role];
    const isIntro = u.role === 'introductor';
    
    return `
      <div class="screen active" id="sc-dash">
        <nav class="topbar">
          <div class="tb-logo">Textilia<em>.</em></div>
          <div class="tb-bc hd-m"><span class="c act">Proyectos</span></div>
          <div class="tb-right">
            <div class="upill">
              <div class="uav">${r.ini}</div>
              <span class="uname hd-m">${r.name}</span>
              <span class="rbdg ${r.cls} hd-m">${r.name}</span>
            </div>
            ${!isIntro ? `<button class="btn btn-rust btn-sm hd-m" id="btn-new-top">+ Nueva obra</button>` : ''}
            <button class="btn btn-ghost btn-sm btn-icon hd-m" id="btn-logout-top">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </button>
          </div>
        </nav>
        <div class="dash-body mob-safe">
          <div class="dash-hero">
            <div>
              <div class="dash-h">Mis <em>proyectos</em></div>
              <div style="font-size:13px;color:var(--ink-35);margin-top:2px">Gestión integral de obras textiles</div>
            </div>
            ${!isIntro ? `<button class="btn btn-rust hd-m" id="btn-new-hero">+ Nueva obra</button>` : ''}
          </div>
          ${!isIntro ? `
          <div class="stats">
            <div class="stat"><div class="st-l">Total obras</div><div class="st-v" id="sT">0</div><div class="st-s">en sistema</div></div>
            <div class="stat"><div class="st-l">En curso</div><div class="st-v" id="sA">0</div><div class="st-s">activas</div></div>
            <div class="stat"><div class="st-l">Metros tela</div><div class="st-v" id="sM">0</div><div class="st-s">obras abiertas</div></div>
            <div class="stat"><div class="st-l">Cerradas</div><div class="st-v" id="sC">0</div><div class="st-s">este año</div></div>
          </div>
          ` : ''}
          <div class="filters">
            <div class="sw">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input class="sinp" placeholder="Buscar obra, referencia, contacto..." id="SI">
            </div>
            <button class="fchip on" data-f="all">Todas</button>
            <button class="fchip" data-f="borrador">Borrador</button>
            <button class="fchip" data-f="en_medicion">En medición</button>
            <button class="fchip" data-f="revisada">Revisada</button>
            <button class="fchip" data-f="cerrada">Cerrada</button>
          </div>
          <div class="kanban" id="KB"></div>
        </div>
        <div class="bnav hd-d">
          <div class="bn-it on">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Proyectos
          </div>
          ${!isIntro ? `
          <div class="bn-it add-btn" id="btn-new-bnav">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>Nueva
          </div>
          ` : ''}
          <div class="bn-it" id="btn-logout-bnav">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>Salir
          </div>
        </div>
      </div>
    `;
  },

  init() {
    this.renderContent();
    
    // Bind events
    const newBtns = ['btn-new-top', 'btn-new-hero', 'btn-new-bnav'];
    newBtns.forEach(id => {
      const el = document.getElementById(id);
      if(el) el.addEventListener('click', () => router.navigate('ficha'));
    });

    const logoutBtns = ['btn-logout-top', 'btn-logout-bnav'];
    logoutBtns.forEach(id => {
      const el = document.getElementById(id);
      if(el) el.addEventListener('click', () => {
        auth.logout();
        router.navigate('login');
      });
    });

    document.getElementById('SI').addEventListener('input', () => this.renderContent());
    
    document.querySelectorAll('.fchip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filt = e.target.dataset.f;
        document.querySelectorAll('.fchip').forEach(b => b.classList.remove('on'));
        e.target.classList.add('on');
        this.renderContent();
      });
    });
    
    // Make openObra available for inline onclicks in generated HTML
    window.openObra = (id) => router.navigate('obra', { id });
    window.goNewObra = () => router.navigate('ficha');
  },

  renderContent() {
    const OBRAS = api.getObras();
    const cols = [
      { k: 'borrador', l: 'Borrador', dc: 'kd-b', pb: 'pb-b' },
      { k: 'en_medicion', l: 'En medición', dc: 'kd-m', pb: 'pb-m' },
      { k: 'revisada', l: 'Revisada', dc: 'kd-r', pb: 'pb-r' },
      { k: 'cerrada', l: 'Cerrada', dc: 'kd-c', pb: 'pb-c' },
    ];
    
    const q = (document.getElementById('SI')?.value || '').toLowerCase();
    const fl = OBRAS.filter(o => {
      const mf = this.filt === 'all' || o.estado === this.filt;
      const ms = !q || o.nombre.toLowerCase().includes(q) || o.ref.toLowerCase().includes(q) || o.c1n.toLowerCase().includes(q);
      return mf && ms;
    });

    document.getElementById('KB').innerHTML = cols.map(col => {
      const co = fl.filter(o => o.estado === col.k);
      return `<div class="kn-col">
        <div class="kn-hd"><div class="kn-dot ${col.dc}"></div><div class="kn-title">${col.l}</div><div class="kn-cnt">${co.length}</div></div>
        <div class="kn-cards">
          ${co.map(o => this.pCard(o, col.pb)).join('')}
          ${col.k !== 'cerrada' && col.k !== 'revisada' && auth.getRole() !== 'introductor' ? `<div class="add-card" onclick="goNewObra()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nueva</div>` : ''}
        </div>
      </div>`;
    }).join('');

    if (auth.getRole() !== 'introductor') {
        const open = OBRAS.filter(o => o.estado !== 'cerrada');
        const metro = open.reduce((acc, o) => acc + tots(o.habs.map(h => calc(h, o.cfg))).mt, 0);
        document.getElementById('sT').textContent = OBRAS.length;
        document.getElementById('sA').textContent = OBRAS.filter(o => o.estado === 'en_medicion').length;
        document.getElementById('sM').textContent = Math.round(metro);
        document.getElementById('sC').textContent = OBRAS.filter(o => o.estado === 'cerrada').length;
    }
  },

  pCard(o, pb) {
    const hs = o.habs.map(h => calc(h, o.cfg)), t = tots(hs);
    const bl = { borrador: 'bdg-b', en_medicion: 'bdg-m', revisada: 'bdg-r', cerrada: 'bdg-c' };
    const ll = { borrador: 'Borrador', en_medicion: 'En medición', revisada: 'Revisada', cerrada: 'Cerrada' };
    return `<div class="pcard" onclick="openObra('${o.id}')">
      <div class="pc-bar ${pb}"></div>
      <div class="pc-body">
        <div class="pc-ref">${o.ref}</div>
        <div class="pc-name">${o.nombre}</div>
        <div class="pc-addr">${o.dir || '—'}</div>
        ${o.c1n ? `<div class="pc-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${o.c1n}</div>` : ''}
        <div class="pc-sep"></div>
        <div class="pc-foot">
          <span class="bdg ${bl[o.estado]}">${ll[o.estado]}</span>
          <span style="font-size:11.5px;color:var(--pap-4)">${o.habs.length} hab.</span>
          ${t.mt > 0 ? `<span class="pc-m">${t.mt}m</span>` : ''}
        </div>
      </div>
    </div>`;
  }
};
