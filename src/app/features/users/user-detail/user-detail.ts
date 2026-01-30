import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserDto, UsersApi } from '../users-api/users-api';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-detail.html',
})
export class UserDetail {
  user = signal<UserDto | null>(null);
  loading = signal(true);
  authStore = inject(AuthStore)
  constructor(
    private route: ActivatedRoute,
    private usersApi: UsersApi
  ) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  load(id: string) {
    this.loading.set(true);

    this.usersApi.findById(id).subscribe({
      next: user => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
