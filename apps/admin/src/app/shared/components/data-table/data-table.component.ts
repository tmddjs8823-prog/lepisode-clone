import { Component, input, output } from '@angular/core';
import { ColumnDef } from '../../types/api.types';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'admin-data-table',
  imports: [DatePipe],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent<T extends Record<string, unknown>> {
  columns = input.required<ColumnDef<T>[]>();
  data = input<T[]>([]);
  total = input<number>(0);
  page = input<number>(1);
  limit = input<number>(10);
  loading = input<boolean>(false);
  showActions = input<boolean>(true);

  pageChange = output<number>();
  edit = output<T>();
  delete = output<T>();

  get totalPages(): number {
    return Math.ceil(this.total() / this.limit());
  }

  getCellValue(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }

  getPages(): number[] {
    const total = this.totalPages;
    const current = this.page();
    const delta = 2;
    const pages: number[] = [];

    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      pages.push(i);
    }
    return pages;
  }
}
