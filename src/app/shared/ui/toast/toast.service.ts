// toast.service.ts
import { Injectable, signal } from '@angular/core';
import { Toast } from './toast.types';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private id = 0;

  show(message: string, type: Toast['type'] = 'info') {
    const toast: Toast = { id: ++this.id, message, type };
    this._toasts.update(t => [...t, toast]);

    setTimeout(() => this.remove(toast.id), 3000);
  }

  success(msg: string) {
    this.show(msg, 'success');
  }

  error(msg: string) {
    this.show(msg, 'error');
  }

  private remove(id: number) {
    this._toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
