/* ── AUTH MODULE ── */

export const ROLES = {
  admin: { name: 'Admin', ini: 'AD', cls: 'rb-admin' },
  gestor: { name: 'Gestor', ini: 'GE', cls: 'rb-gestor' },
  introductor: { name: 'Técnico', ini: 'TC', cls: 'rb-intro' }
};

class Auth {
  constructor() {
    this.user = JSON.parse(localStorage.getItem('USER')) || null;
  }

  login(role) {
    if (ROLES[role]) {
      this.user = { role, name: ROLES[role].name, ini: ROLES[role].ini };
      localStorage.setItem('USER', JSON.stringify(this.user));
      return true;
    }
    return false;
  }

  logout() {
    this.user = null;
    localStorage.removeItem('USER');
  }

  getUser() {
    return this.user;
  }

  getRole() {
    return this.user ? this.user.role : null;
  }

  // Permission checks
  canEditPrices() {
    return this.user && (this.user.role === 'admin' || this.user.role === 'gestor');
  }

  canManageUsers() {
    return this.user && this.user.role === 'admin';
  }

  canSeeAllObras() {
    return this.user && (this.user.role === 'admin' || this.user.role === 'gestor');
  }
  
  canEditObra(obra) {
      if (!this.user) return false;
      if (obra.estado === 'cerrada') return false;
      // Técnico can edit basic measures even if not owner (for simplicity in this demo, usually assigned)
      return true; 
  }
}

export const auth = new Auth();
