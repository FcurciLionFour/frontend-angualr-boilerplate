import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../../core/auth/auth.store';
import { SessionService } from '../../../core/auth/session.service';
import { MENU_ITEMS } from '../../../core/layout/menu.config';

@Component({
  standalone: true,
  selector: 'app-private-layout',
  templateUrl: './private-layout.component.html',
  imports: [CommonModule, RouterOutlet, RouterLink],
})
export class PrivateLayoutComponent {
  visibleMenu = computed(() => {
    const permissions = this.authStore.permissions();
    return MENU_ITEMS.filter(
      (item) => !item.permission || permissions.includes(item.permission)
    );
  });

  constructor(
    public authStore: AuthStore,
    private readonly sessionService: SessionService
  ) {}

  logout() {
    this.sessionService.logout().subscribe();
  }
}
