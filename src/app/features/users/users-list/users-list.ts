import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersApi, UserDto } from '../users-api/users-api';

@Component({
  standalone: true,
  selector: 'app-users-list',
  imports: [CommonModule],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css'],
})
export class UsersList {
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

}
