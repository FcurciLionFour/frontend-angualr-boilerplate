import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApi } from '../../../core/auth/auth.api';
import { normalizeBackendError } from '../../../core/http/backend-error';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApi);

  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authApi.forgotPassword(this.form.getRawValue().email).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        const normalized = normalizeBackendError(error);

        if (normalized.statusCode === 429) {
          this.error.set(
            typeof normalized.retryAfterSeconds === 'number'
              ? `Demasiados intentos. Reintenta en ${normalized.retryAfterSeconds}s.`
              : 'Demasiados intentos. Reintenta mas tarde.'
          );
        } else {
          // Respuesta neutral por seguridad en cualquier otro error.
          this.success.set(true);
        }

        this.loading.set(false);
      },
    });
  }
}
