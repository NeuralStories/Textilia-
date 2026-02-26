/* ── DATA ABSTRACTION LAYER (MOCK DB) ── */

const INITIAL_OBRAS = [
  {id:'o1',ref:'REF-2025-001',nombre:'Hotel Costa Serena',dir:'Av. del Mar 12, Marbella',fecha:'2025-10-02',estado:'en_medicion',
   c1n:'Juan García',c1t:'603 456 789',c1e:'juan@serena.com',c1emp:'',c2n:'',c2t:'',c2e:'',
   obs:'Instalación visillos planta 1 y 2. Acceso puerta trasera.',
   cfg:{nH:1,fr:2,bj:0.25,dA:0,ci:0.06,pC:0,pT:0,pI:0,mg:0,tip:'VISILLO',nom:'VETAMIN FR C/100 (BITEX)'},
   habs:[{id:'h1',num:'101',an:1.30,al:2.77},{id:'h2',num:'102',an:1.90,al:2.75},
         {id:'h3',num:'103',an:1.45,al:2.76},{id:'h4',num:'104',an:1.57,al:2.80},
         {id:'h5',num:'105',an:1.65,al:2.76},{id:'h6',num:'106',an:1.73,al:2.75}]},
  {id:'o2',ref:'REF-2025-002',nombre:'Residencia Villa Mar',dir:'C/ Palmeras 5, Torremolinos',fecha:'2025-09-15',estado:'revisada',
   c1n:'María Sánchez',c1t:'612 345 678',c1e:'',c1emp:'',c2n:'',c2t:'',c2e:'',
   obs:'Blackout en todos los dormitorios. Cliente prioritario.',
   cfg:{nH:2,fr:2,bj:0.25,dA:0,ci:0.06,pC:8,pT:12,pI:50,mg:20,tip:'BLACKOUT',nom:'NIGHT BLOCK PRO'},
   habs:[{id:'h7',num:'201',an:2.30,al:2.77},{id:'h8',num:'202',an:2.90,al:2.75},{id:'h9',num:'203',an:2.45,al:2.76}]},
  {id:'o3',ref:'REF-2025-003',nombre:'Apartamentos Brisa',dir:'Paseo Marítimo 33, Estepona',fecha:'2025-11-01',estado:'borrador',
   c1n:'Pedro Ruiz',c1t:'698 111 222',c1e:'',c1emp:'',c2n:'',c2t:'',c2e:'',obs:'',
   cfg:{nH:1,fr:2,bj:0.25,dA:0,ci:0.06,pC:0,pT:0,pI:0,mg:0,tip:'VISILLO',nom:''},habs:[]},
  {id:'o4',ref:'REF-2024-047',nombre:'Hotel Sol y Playa',dir:'Av. Andalucía 88, Fuengirola',fecha:'2024-08-20',estado:'cerrada',
   c1n:'Ana Morales',c1t:'655 000 111',c1e:'',c1emp:'',c2n:'',c2t:'',c2e:'',obs:'Obra completada.',
   cfg:{nH:1,fr:2,bj:0.25,dA:0,ci:0.06,pC:7,pT:11,pI:30,mg:18,tip:'VISILLO',nom:'CRYSTAL LIGHT'},
   habs:[{id:'h10',num:'101',an:1.50,al:2.75},{id:'h11',num:'102',an:1.80,al:2.75}]},
  {id:'o5',ref:'REF-2025-004',nombre:'Chalet Sierra Verde',dir:'Urb. La Cañada 7, Ronda',fecha:'2025-10-20',estado:'en_medicion',
   c1n:'Carlos Vega',c1t:'670 333 444',c1e:'',c1emp:'',c2n:'',c2t:'',c2e:'',obs:'',
   cfg:{nH:1,fr:2,bj:0.25,dA:0,ci:0.06,pC:9,pT:14,pI:0,mg:15,tip:'LINO',nom:'NATURAL LINEN BLEND'},
   habs:[{id:'h12',num:'Salón',an:3.20,al:2.90},{id:'h13',num:'Dorm1',an:1.80,al:2.80}]},
];

class Api {
  constructor() {
    if (!localStorage.getItem('OBRAS')) {
      localStorage.setItem('OBRAS', JSON.stringify(INITIAL_OBRAS));
    }
  }

  getObras() {
    return JSON.parse(localStorage.getItem('OBRAS') || '[]');
  }

  getObra(id) {
    const obras = this.getObras();
    return obras.find(o => o.id === id);
  }

  saveObra(obraData) {
    const obras = this.getObras();
    if (obraData.id) {
      const idx = obras.findIndex(o => o.id === obraData.id);
      if (idx !== -1) {
        obras[idx] = { ...obras[idx], ...obraData };
      }
    } else {
      obraData.id = 'o' + Date.now();
      obras.push(obraData);
    }
    localStorage.setItem('OBRAS', JSON.stringify(obras));
    return obraData;
  }

  addHab(obraId, habData) {
    const obras = this.getObras();
    const obra = obras.find(o => o.id === obraId);
    if (obra) {
      if (!habData.id) habData.id = 'h' + Date.now();
      obra.habs.push(habData);
      localStorage.setItem('OBRAS', JSON.stringify(obras));
      return habData;
    }
    return null;
  }

  updateHab(obraId, habId, field, value) {
    const obras = this.getObras();
    const obra = obras.find(o => o.id === obraId);
    if (obra) {
      const hab = obra.habs.find(h => h.id === habId);
      if (hab) {
        hab[field] = value;
        localStorage.setItem('OBRAS', JSON.stringify(obras));
        return hab;
      }
    }
    return null;
  }

  deleteHab(obraId, habId) {
    const obras = this.getObras();
    const obra = obras.find(o => o.id === obraId);
    if (obra) {
      obra.habs = obra.habs.filter(h => h.id !== habId);
      localStorage.setItem('OBRAS', JSON.stringify(obras));
      return true;
    }
    return false;
  }

  updateCfg(obraId, field, value) {
    const obras = this.getObras();
    const obra = obras.find(o => o.id === obraId);
    if (obra) {
      obra.cfg[field] = value;
      localStorage.setItem('OBRAS', JSON.stringify(obras));
      return true;
    }
    return false;
  }
}

export const api = new Api();
