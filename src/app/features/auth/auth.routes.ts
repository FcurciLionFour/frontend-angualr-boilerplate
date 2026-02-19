import { Routes } from '@angular/router';
import { publicGuard } from '../../core/security/public.guard';

export const authRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'register',
    canMatch: [publicGuard],
    loadComponent: () =>
      import('./register/register.component')
        .then(m => m.RegisterComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login')
        .then(m => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    canMatch: [publicGuard],
    loadComponent: () =>
      import('./forgot-password/forgot-password.component')
        .then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    canMatch: [publicGuard],
    loadComponent: () =>
      import('./reset-password/reset-password.component')
        .then(m => m.ResetPasswordComponent),
  },
];
