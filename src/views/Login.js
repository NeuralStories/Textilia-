import { auth, ROLES } from '../auth.js';
import { router } from '../router.js';
import { ui } from '../ui.js';

export const Login = {
  render() {
    return `
      <div class="screen active" id="sc-login">
        <div class="l-card">
          <div class="l-brand">Textilia<em>.</em></div>
          <p class="l-sub">Sistema de gestión de obras textiles</p>
          <div class="l-box">
            <div class="l-tabs">
              <button class="l-tab on" id="btn-login-tab">Entrar</button>
              <button class="l-tab" id="btn-reg-tab">Registro</button>
            </div>
            <div id="lf-login">
              <div class="l-fld"><label class="l-lbl">Email</label><input class="l-inp" type="email" value="admin@textilia.com"></div>
              <div class="l-fld"><label class="l-lbl">Contraseña</label><input class="l-inp" type="password" value="demo1234"></div>
              <div class="l-fld">
                <label class="l-lbl">Acceder como</label>
                <select class="l-inp l-sel" id="lRole">
                  <option value="admin">Admin — Acceso total</option>
                  <option value="gestor">Gestor — Gestión de obras</option>
                  <option value="introductor">Técnico — Solo medición</option>
                </select>
              </div>
              <button class="l-btn" id="btn-login">Entrar al sistema →</button>
            </div>
            <div id="lf-reg" style="display:none">
              <div class="l-fld"><label class="l-lbl">Empresa</label><input class="l-inp" placeholder="Cortinas Studio SL"></div>
              <div class="l-fld"><label class="l-lbl">Nombre</label><input class="l-inp" placeholder="Ana García"></div>
              <div class="l-fld"><label class="l-lbl">Email</label><input class="l-inp" type="email" placeholder="ana@empresa.com"></div>
              <div class="l-fld"><label class="l-lbl">Contraseña</label><input class="l-inp" type="password" placeholder="Mínimo 8 caracteres"></div>
              <button class="l-btn" id="btn-reg">Crear cuenta →</button>
            </div>
          </div>
          <p class="l-demo">Demo: <a id="lnk-demo">entrar directamente</a></p>
        </div>
      </div>
    `;
  },

  init() {
    // Bind events
    document.getElementById('btn-login-tab').addEventListener('click', (e) => this.switchTab('login', e.target));
    document.getElementById('btn-reg-tab').addEventListener('click', (e) => this.switchTab('reg', e.target));
    document.getElementById('btn-login').addEventListener('click', () => this.doLogin());
    document.getElementById('btn-reg').addEventListener('click', () => this.doReg());
    document.getElementById('lnk-demo').addEventListener('click', () => this.doLogin());
  },

  switchTab(t, el) {
    document.querySelectorAll('.l-tab').forEach(e => e.classList.remove('on'));
    el.classList.add('on');
    document.getElementById('lf-login').style.display = t === 'login' ? '' : 'none';
    document.getElementById('lf-reg').style.display = t === 'reg' ? '' : 'none';
  },

  doLogin() {
    const role = document.getElementById('lRole').value;
    if (auth.login(role)) {
      ui.showToast('Bienvenido, ' + ROLES[role].name);
      router.navigate('dashboard');
    }
  },

  doReg() {
    ui.showToast('Cuenta creada', 'ok');
    setTimeout(() => this.doLogin(), 500);
  }
};
