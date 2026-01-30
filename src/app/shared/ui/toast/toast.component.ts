// toast.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
    standalone: true,
    selector: 'app-toast',
    imports: [CommonModule],
    template: `
    <div class="fixed top-4 right-4 space-y-2 z-50">
      <div
        *ngFor="let toast of toastService.toasts()"
        class="px-4 py-2 rounded-md text-sm text-white shadow"
        [ngClass]="{
          'bg-green-600': toast.type === 'success',
          'bg-red-600': toast.type === 'error',
          'bg-slate-700': toast.type === 'info'
        }"
      >
        {{ toast.message }}
      </div>
    </div>
  `,
})
export class ToastComponent {
    constructor(public toastService: ToastService) { }
}
