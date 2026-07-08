import { Component, input, output, signal, computed } from '@angular/core';
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

  /* ── 정렬 ── */
  sortKey = signal<string>('');
  sortDir = signal<'asc' | 'desc'>('asc');
  showSortMenu = signal(false);
  hoverAsc = signal(false);
  hoverDesc = signal(false);

  /** 정렬 대상 컬럼 (번호/ID 타입 제외) */
  sortableColumns = computed(() =>
    this.columns().filter(col => col.type !== 'number' && col.key !== 'id')
  );

  sortedData = computed(() => {
    const key = this.sortKey();
    const dir = this.sortDir();
    const list = [...this.data()];
    if (!key) return list;

    return list.sort((a, b) => {
      const va = (a as Record<string, unknown>)[key];
      const vb = (b as Record<string, unknown>)[key];

      // null/undefined → 맨 뒤로
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;

      let cmp = 0;
      if (typeof va === 'number' && typeof vb === 'number') {
        cmp = va - vb;
      } else {
        cmp = String(va).localeCompare(String(vb), 'ko');
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  toggleSortMenu(): void {
    this.showSortMenu.update(v => !v);
  }

  closeSortMenu(): void {
    this.showSortMenu.set(false);
  }

  applySort(key: string, dir: 'asc' | 'desc'): void {
    this.sortKey.set(key);
    this.sortDir.set(dir);
    this.showSortMenu.set(false);
  }

  clearSort(): void {
    this.sortKey.set('');
    this.sortDir.set('asc');
    this.showSortMenu.set(false);
  }

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
