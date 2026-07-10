import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'admin-page-header',
  imports: [FormsModule],
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  breadcrumb = input<string>('');
  createLabel = input<string>('등록');
  showCreate = input<boolean>(true);
  showExport = input<boolean>(true);

  create = output<void>();
  exportExcel = output<void>();
}
