import { Component, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionService } from '../../../core/auth/session.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { normalizeBackendError } from '../../../core/http/backend-error';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly sessionService = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  cooldownSeconds = signal(0);
  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    if (this.cooldownSeconds() > 0) {
      return;
    }

    if (this.form.invalid) {
      this.error.set('Completa email y contrasena.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.getRawValue();

    this.sessionService.login(email, password).subscribe({
      next: () => {
        this.stopCooldown();
        this.loading.set(false);
        this.toast.success('Sesion iniciada correctamente.');
        void this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const message = this.mapLoginError(error);
        this.error.set(message);
      },
    });
  }

  ngOnDestroy(): void {
    this.stopCooldown();
  }

  private mapLoginError(error: HttpErrorResponse): string {
    const normalized = normalizeBackendError(error);

    if (normalized.code === 'AUTH_INVALID_CREDENTIALS') {
      this.stopCooldown();
      return 'Credenciales invalidas.';
    }

    if (normalized.code === 'AUTH_LOGIN_LOCKED') {
      if (typeof normalized.retryAfterSeconds === 'number') {
        this.startCooldown(normalized.retryAfterSeconds);
        return `Cuenta bloqueada temporalmente. Reintenta en ${normalized.retryAfterSeconds}s.`;
      }

      return 'Cuenta bloqueada temporalmente.';
    }

    if (normalized.statusCode === 429) {
      if (typeof normalized.retryAfterSeconds === 'number') {
        this.startCooldown(normalized.retryAfterSeconds);
      }
      return 'Demasiados intentos. Intenta nuevamente en unos segundos.';
    }

    this.stopCooldown();
    return 'No se pudo iniciar sesion.';
  }

  private startCooldown(seconds: number) {
    const initialValue = Math.max(1, Math.ceil(seconds));
    this.cooldownSeconds.set(initialValue);
    this.stopTimerOnly();
    this.cooldownTimer = setInterval(() => {
      const current = this.cooldownSeconds();
      if (current <= 1) {
        this.stopCooldown();
        return;
      }

      this.cooldownSeconds.set(current - 1);
    }, 1000);
  }

  private stopCooldown() {
    this.stopTimerOnly();
    this.cooldownSeconds.set(0);
  }

  private stopTimerOnly() {
    if (!this.cooldownTimer) {
      return;
    }

    clearInterval(this.cooldownTimer);
    this.cooldownTimer = null;
  }
}
