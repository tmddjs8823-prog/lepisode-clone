import { Component, input, output } from '@angular/core';

@Component({
  selector: 'admin-page-header',
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  title = input.required<string>();
  createLabel = input<string>('등록');
  showCreate = input<boolean>(true);
  showExport = input<boolean>(false);

  create = output<void>();
  exportExcel = output<void>();
}
