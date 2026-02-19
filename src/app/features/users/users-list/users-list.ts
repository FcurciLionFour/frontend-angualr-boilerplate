import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { UserDto, UsersApi } from '../users-api/users-api';

@Component({
  standalone: true,
  selector: 'app-users-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css'],
})
export class UsersList {
  private readonly authStore = inject(AuthStore);

  readonly canCreate = computed(() =>
    this.authStore.permissions().includes('users.write')
  );
  readonly users = signal<UserDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor(private readonly usersApi: UsersApi) {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.usersApi.findAll().subscribe({
      next: (users) => {
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
      `Seguro que queres desactivar al usuario ${user.email}?`
    );

    if (!confirmed) {
      return;
    }

    this.usersApi.remove(user.id).subscribe({
      next: () => {
        this.load();
      },
      error: () => {
        alert('No se pudo eliminar el usuario');
      },
    });
  }

  isUserInactive(user: UserDto): boolean {
    return user.isActive === false;
  }
}
