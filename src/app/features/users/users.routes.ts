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
    path: 'new',
    canActivate: [permissionGuard(['users.write'])],
    loadComponent: () =>
      import('./create-user/user-create.component')
        .then(m => m.UserCreateComponent),
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard(['users.write'])],
    loadComponent: () =>
      import('./user-edit/user-edit.component')
        .then(m => m.UserEditComponent),
  },
  {
    path: ':id',
    canActivate: [selfOrAdminGuard],
    loadComponent: () =>
      import('./user-detail/user-detail')
        .then(m => m.UserDetail),
  },


];
