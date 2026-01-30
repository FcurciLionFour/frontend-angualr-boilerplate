import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

export const selfOrAdminGuard: CanActivateFn = route => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const routeId = route.paramMap.get('id');
  const user = authStore.user();
  const roles = authStore.roles();

  if (!user) {
    router.navigate(['/dashboard']);
    return false;
  }

  const isAdmin = roles.includes('ADMIN');
  const isSelf = user.id === routeId;

  if (isAdmin || isSelf) {
    return true;
  }

  router.navigate(['/forbidden']);
  return false;
};
