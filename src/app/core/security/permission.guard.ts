import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

export function permissionGuard(
  requiredPermissions: string[]
): CanActivateFn {
  return (route: ActivatedRouteSnapshot) => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    const userPermissions = authStore.permissions();

    const hasPermission = requiredPermissions.every(p =>
      userPermissions.includes(p)
    );

    if (hasPermission) {
      return true;
    }

    router.navigate(['/forbidden']);
    return false;
  };
}
