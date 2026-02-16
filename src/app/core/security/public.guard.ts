import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

export const publicGuard: CanMatchFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.initializing()) {
    return true;
  }

  if (authStore.isAuthenticated()) {
    return router.parseUrl('/dashboard');
  }

  return true;
};
