import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'admin-toast',
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  trackById(_: number, toast: { id: number }) {
    return toast.id;
  }
}
