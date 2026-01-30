import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersApi } from '../users-api/users-api';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './user-edit.component.html',
})
export class UserEditComponent {
    private route = inject(ActivatedRoute)
    private usersApi = inject(UsersApi)
    private fb = inject(FormBuilder)
    private router = inject(Router)

    loading = signal(true);
    saving = signal(false);
    error = signal<string | null>(null);

    userId!: string;

    availableRoles = ['ADMIN', 'USER'];

    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        roles: this.fb.control<string[]>([]),
        isActive: this.fb.control<boolean>(true),
    });

    constructor(

    ) {
        this.userId = this.route.snapshot.paramMap.get('id')!;
        this.load();
    }

    load() {
        this.loading.set(true);

        this.usersApi.findById(this.userId).subscribe({
            next: user => {
                this.form.patchValue({
                    email: user.email,
                    roles: user.roles,
                    isActive: user.isActive ?? true,
                });
                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudo cargar el usuario');
                this.loading.set(false);
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

    submit() {
        if (this.form.invalid) return;

        this.saving.set(true);
        this.error.set(null);

        this.usersApi.update(this.userId, this.form.value as any).subscribe({
            next: () => {
                this.router.navigate(['/users', this.userId]);
            },
            error: () => {
                this.error.set('No se pudieron guardar los cambios');
                this.saving.set(false);
            },
        });
    }
}
