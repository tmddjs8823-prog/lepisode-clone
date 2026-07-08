import { Component, input, output } from '@angular/core';

@Component({
  selector: 'admin-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  message = input<string>('정말 삭제하시겠습니까?');
  subMessage = input<string>('이 작업은 되돌릴 수 없습니다.');
  confirmLabel = input<string>('삭제');
  cancelLabel = input<string>('취소');
  loading = input<boolean>(false);

  confirmed = output<void>();
  cancelled = output<void>();
}
