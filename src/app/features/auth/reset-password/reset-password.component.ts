import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthApi } from '../../../core/auth/auth.api';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
    private fb = inject(FormBuilder)
    private authApi = inject(AuthApi)
    private route = inject(ActivatedRoute)
    loading = signal(false);
    success = signal(false);
    error = signal<string | null>(null);

    token = this.route.snapshot.queryParamMap.get('token');

    form = this.fb.group({
        password: ['', Validators.required],
    });

    constructor(
        private router: Router
    ) { }

    submit() {
        if (!this.token || this.form.invalid) {
            this.error.set('Token inválido');
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        this.authApi.resetPassword(this.token, this.form.value.password!).subscribe({
            next: () => {
                this.success.set(true);
                this.loading.set(false);

                setTimeout(() => {
                    this.router.navigate(['/auth/login']);
                }, 1500);
            },
            error: () => {
                this.error.set('El link es inválido o expiró');
                this.loading.set(false);
            },
        });
    }
}
