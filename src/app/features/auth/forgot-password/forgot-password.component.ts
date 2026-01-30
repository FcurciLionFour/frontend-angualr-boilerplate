import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthApi } from '../../../core/auth/auth.api';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder)
    private authApi = inject(AuthApi)
    loading = signal(false);
    success = signal(false);

    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
    });

    submit() {
        if (this.form.invalid) return;

        this.loading.set(true);

        this.authApi.forgotPassword(this.form.value.email!).subscribe({
            next: () => {
                this.success.set(true);
                this.loading.set(false);
            },
            error: () => {
                // respuesta neutra igual
                this.success.set(true);
                this.loading.set(false);
            },
        });
    }
}
