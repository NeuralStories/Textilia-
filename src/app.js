import { router } from './router.js';
import { auth } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  if (auth.getUser()) {
    router.navigate('dashboard');
  } else {
    router.navigate('login');
  }
});
