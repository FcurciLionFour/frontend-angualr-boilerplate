import { Routes } from '@angular/router';
import { authGuard } from './core/security/auth.guard';
import { PublicLayoutComponent } from './shared/ui/layouts/public-layout.component';
import { PrivateLayoutComponent } from './shared/ui/layouts/private-layout.component';
import { publicGuard } from './core/security/public.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: PublicLayoutComponent,
    canMatch: [publicGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/auth/auth.routes')
            .then(m => m.authRoutes),
      },
    ],
  },
  {
    path: '',
    component: PrivateLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes')
            .then(m => m.dashboardRoutes),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes')
            .then(m => m.usersRoutes),
      },
    ],
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/pages/forbidden/forbidden')
        .then(m => m.Forbidden),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
  },
];
