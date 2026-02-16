import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApi } from '../../../core/auth/auth.api';
import { normalizeBackendError } from '../../../core/http/backend-error';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);
  token = this.route.snapshot.queryParamMap.get('token');

  form = this.fb.nonNullable.group({
    password: ['', Validators.required],
  });

  submit() {
    if (!this.token || this.form.invalid) {
      this.error.set('Token invalido.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authApi
      .resetPassword(this.token, this.form.getRawValue().password)
      .subscribe({
        next: () => {
          this.success.set(true);
          this.loading.set(false);
          setTimeout(() => void this.router.navigate(['/auth/login']), 1500);
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(this.mapResetError(error));
          this.loading.set(false);
        },
      });
  }

  private mapResetError(error: HttpErrorResponse): string {
    const normalized = normalizeBackendError(error);

    if (normalized.code === 'AUTH_INVALID_OR_EXPIRED_RESET_TOKEN') {
      return 'El link es invalido o expiro.';
    }

    if (normalized.statusCode === 429) {
      return typeof normalized.retryAfterSeconds === 'number'
        ? `Demasiados intentos. Reintenta en ${normalized.retryAfterSeconds}s.`
        : 'Demasiados intentos. Reintenta mas tarde.';
    }

    return 'No se pudo actualizar la contrasena.';
  }
}
