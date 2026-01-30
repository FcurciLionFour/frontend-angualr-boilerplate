import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { AuthApi } from '../../../core/auth/auth.api';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  constructor(
    public authStore: AuthStore,
    private authApi: AuthApi,
    private router: Router
  ) {}

  logout() {
    this.authApi.logout().subscribe({
      next: () => {
        this.authStore.clearSession();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // incluso si falla el backend, limpiamos local
        this.authStore.clearSession();
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
