import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthApi } from "../../../core/auth/auth.api";

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
    private fb = inject(FormBuilder)
    private authApi = inject(AuthApi)
    loading = signal(false);
    success = signal(false);
    error = signal<string | null>(null);

    form = this.fb.group({
        currentPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
    });


    submit() {
        if (this.form.invalid) return;

        this.loading.set(true);
        this.error.set(null);

        this.authApi.changePassword(this.form.value as any).subscribe({
            next: () => {
                this.success.set(true);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Contraseña incorrecta');
                this.loading.set(false);
            },
        });
    }
}
