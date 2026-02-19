import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../core/auth/auth.store';
import { SessionService } from '../../../core/auth/session.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  constructor(
    public authStore: AuthStore,
    private readonly sessionService: SessionService
  ) {}

  logout() {
    this.sessionService.logout().subscribe();
  }
}
