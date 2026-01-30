import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/security/permission.guard';
import { selfOrAdminGuard } from '../../core/security/self-or-admin.guard';

export const usersRoutes: Routes = [
  {
    path: '',
    canActivate: [permissionGuard(['users.read'])],
    loadComponent: () =>
      import('./users-list/users-list')
        .then(m => m.UsersList),
  },
  {
    path: ':id',
    canActivate: [selfOrAdminGuard],
    loadComponent: () =>
      import('./user-detail/user-detail')
        .then(m => m.UserDetail),
  },
];
