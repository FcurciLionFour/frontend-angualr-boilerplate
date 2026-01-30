import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersApi, UserDto } from '../users-api/users-api';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  standalone: true,
  selector: 'app-users-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css'],
})
export class UsersList {
  private authStore = inject(AuthStore)
  canCreate = computed(() =>
    this.authStore.permissions().includes('users.write')
  );
  users = signal<UserDto[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private usersApi: UsersApi) {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.usersApi.findAll().subscribe({
      next: users => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los usuarios');
        this.loading.set(false);
      },
    });
  }
  confirmDelete(user: UserDto) {
    const confirmed = confirm(
      `¿Seguro que querés desactivar al usuario ${user.email}?`
    );

    if (!confirmed) return;

    this.usersApi.update(user.id, { isActive: false }).subscribe({
      next: () => {
        this.load(); // recargar lista
      },
      error: () => {
        alert('No se pudo eliminar el usuario');
      },
    });
  }


}
