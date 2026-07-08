import { Injectable, signal } from '@angular/core';
import { ToastMessage } from '../types/api.types';

let _nextId = 0;
const DURATION_MS = 3500;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(message: string): void {
    this._push({ type: 'success', message });
  }

  error(message: string): void {
    this._push({ type: 'error', message });
  }

  info(message: string): void {
    this._push({ type: 'info', message });
  }

  warning(message: string): void {
    this._push({ type: 'warning', message });
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private _push(partial: Omit<ToastMessage, 'id'>): void {
    const id = ++_nextId;
    this._toasts.update((list) => [...list, { id, ...partial }]);
    setTimeout(() => this.dismiss(id), DURATION_MS);
  }
}
