import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../../../core/auth/session.service';
import { normalizeBackendError } from '../../../core/http/backend-error';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly sessionService = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) {
      this.error.set('Completa email y contrasena.');
      return;
    }

    const { email, password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) {
      this.error.set('Las contrasenas no coinciden.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.sessionService.register(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Cuenta creada correctamente.');
        void this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(this.mapRegisterError(error));
      },
    });
  }

  private mapRegisterError(error: HttpErrorResponse): string {
    const normalized = normalizeBackendError(error);

    if (normalized.code === 'USER_ALREADY_EXISTS') {
      return 'Este email ya existe.';
    }

    if (normalized.statusCode === 429) {
      return typeof normalized.retryAfterSeconds === 'number'
        ? `Demasiados intentos. Reintenta en ${normalized.retryAfterSeconds}s.`
        : 'Demasiados intentos. Reintenta mas tarde.';
    }

    return 'No se pudo crear la cuenta.';
  }
}
