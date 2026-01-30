import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-public-layout',
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-100">
      <router-outlet />
    </div>
  `,
  imports: [RouterOutlet],
})
export class PublicLayoutComponent {}
