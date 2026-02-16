import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.initializing()) {
    return true;
  }

  if (authStore.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/auth/login');
};
