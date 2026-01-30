import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

export const publicGuard: CanMatchFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // mientras inicializa, no bloqueamos
  if (authStore.initializing()) {
    return true;
  }

  // si ya está logueado → fuera del login
  if (authStore.accessToken()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
