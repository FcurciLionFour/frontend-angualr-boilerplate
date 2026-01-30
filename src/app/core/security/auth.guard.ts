import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Mientras inicializa la app, NO bloqueamos
  if (authStore.initializing()) {
    return true;
  }

  // Si hay accessToken, dejamos pasar
  if (authStore.accessToken()) {
    return true;
  }

  // Caso no autenticado
  router.navigate(['/auth/login']);
  return false;
};
