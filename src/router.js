import { Login } from './views/Login.js';
import { Dashboard } from './views/Dashboard.js';
import { Ficha } from './views/Ficha.js';
import { Obra } from './views/Obra.js';

const routes = {
  'login': Login,
  'dashboard': Dashboard,
  'ficha': Ficha,
  'obra': Obra
};

export const router = {
  navigate(viewName, params = {}) {
    const view = routes[viewName];
    if (view) {
      const app = document.getElementById('app');
      app.innerHTML = view.render();
      if (view.init) {
        view.init(params);
      }
    } else {
      console.error('View not found:', viewName);
    }
  }
};
