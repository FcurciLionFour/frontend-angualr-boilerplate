import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersApi } from '../users-api/users-api';
import { ToastService } from '../../../shared/ui/toast/toast.service';
@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './user-create.component.html',
})
export class UserCreateComponent {

    toast = inject(ToastService)
    private fb = inject(FormBuilder)
    private usersApi = inject(UsersApi)
    private router = inject(Router)

    loading = signal(false);
    error = signal<string | null>(null);

    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        roles: this.fb.control<string[]>(['USER']),
    });

    availableRoles = ['ADMIN', 'USER'];





    submit() {
        if (this.form.invalid) return;

        this.loading.set(true);
        this.error.set(null);

        this.usersApi.create(this.form.value as any).subscribe({
            next: () => {
                this.toast.success('Usuario creado');

                this.router.navigate(['/users']);
            },
            error: () => {
                this.loading.set(false);
                this.toast.error('No se pudo crear el usuario');
                this.error.set('No se pudo crear el usuario');
            },
        });
    }
    toggleRole(role: string, checked: boolean) {
        const roles = this.form.value.roles ?? [];

        this.form.controls.roles.setValue(
            checked
                ? [...roles, role]
                : roles.filter(r => r !== role)
        );
    }

}
