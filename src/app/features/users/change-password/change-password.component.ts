import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApi } from '../../../core/auth/auth.api';
import { normalizeBackendError } from '../../../core/http/backend-error';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApi);

  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authApi.changePassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        const normalized = normalizeBackendError(error);
        this.error.set(
          normalized.code === 'AUTH_INVALID_CURRENT_PASSWORD'
            ? 'Contrasena actual incorrecta.'
            : 'No se pudo actualizar la contrasena.'
        );
        this.loading.set(false);
      },
    });
  }
}
