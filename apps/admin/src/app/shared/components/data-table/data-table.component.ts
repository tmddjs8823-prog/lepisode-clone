import { Component, input, output, signal, computed, ViewEncapsulation, HostListener } from '@angular/core';
import { ColumnDef } from '../../types/api.types';
import { DatePipe } from '@angular/common';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'admin-data-table',
  imports: [DatePipe, PaginationComponent],
  templateUrl: './data-table.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: [`
    admin-data-table table td,
    admin-data-table table th {
      vertical-align: middle !important;
    }
    @keyframes ctxFadeIn {
      from { opacity: 0; transform: scale(0.95) translateY(-4px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
  `],
})
export class DataTableComponent<T extends Record<string, unknown>> {
  columns = input.required<ColumnDef<T>[]>();
  data = input<T[]>([]);
  total = input<number>(0);
  page = input<number>(1);
  limit = input<number>(10);
  loading = input<boolean>(false);
  showActions = input<boolean>(true);
  showToolbar = input<boolean>(true);
  customContextMenuItems = input<{ action: string; label: string; icon: string }[]>([]);

  pageChange = output<number>();
  pageSizeChange = output<number>();
  edit = output<T>();
  delete = output<T>();
  rowClick = output<T>();
  customAction = output<{ action: string; row: T }>();

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

  /** 이미지 컬럼 존재 여부 (행 높이 조절용) */
  hasImageColumn = computed(() =>
    this.columns().some(col => col.type === 'image')
  );

  /** 현재 정렬된 컬럼의 라벨 (없을 경우 날짜/등록일 관련 컬럼을 찾아 디폴트로 반환) */
  currentSortLabel = computed(() => {
    const key = this.sortKey();
    if (key) {
      const col = this.columns().find(c => c.key === key);
      if (col) return col.label;
    }
    const defaultCol = this.columns().find(c =>
      c.label.includes('등록') || c.label.includes('작성') || c.label.includes('일자') || c.label.includes('날짜')
    ) || this.columns()[0];
    return defaultCol ? defaultCol.label : '등록일';
  });

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

  /* ── 컬럼 헤더 정렬 드롭다운 ── */
  sortDropdownKey = signal<string>('');
  sortDropdownX = signal(0);
  sortDropdownY = signal(0);

  toggleColumnSortMenu(event: MouseEvent, key: string): void {
    if (this.sortDropdownKey() === key) {
      this.sortDropdownKey.set('');
      return;
    }
    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    this.sortDropdownX.set(rect.left);
    this.sortDropdownY.set(rect.bottom + 4);
    this.sortDropdownKey.set(key);
  }

  closeColumnSortMenu(): void {
    this.sortDropdownKey.set('');
  }

  applyColumnSort(key: string, dir: 'asc' | 'desc'): void {
    this.sortKey.set(key);
    this.sortDir.set(dir);
    this.sortDropdownKey.set('');
  }

  get totalPages(): number {
    return Math.ceil(this.total() / this.limit());
  }

  getCellValue(row: T, key: string, col?: ColumnDef<T>): unknown {
    if (col?.transform) {
      return col.transform(row);
    }
    return (row as Record<string, unknown>)[key];
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }

  /* ── 우클릭 컨텍스트 메뉴 ── */
  contextMenuRow = signal<T | null>(null);
  contextMenuX = signal(0);
  contextMenuY = signal(0);

  openContextMenu(event: MouseEvent, row: T): void {
    event.preventDefault();
    event.stopPropagation();

    // 뷰포트 경계 보정 (메뉴가 화면 밖으로 넘어가지 않도록)
    const menuWidth = 160;
    const menuHeight = 100;
    let x = event.clientX;
    let y = event.clientY;
    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 8;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 8;

    this.contextMenuX.set(x);
    this.contextMenuY.set(y);
    this.contextMenuRow.set(row);
  }

  closeContextMenu(): void {
    this.contextMenuRow.set(null);
  }

  onContextEdit(): void {
    const row = this.contextMenuRow();
    if (row) {
      this.edit.emit(row);
      this.closeContextMenu();
    }
  }

  onContextDelete(): void {
    const row = this.contextMenuRow();
    if (row) {
      this.delete.emit(row);
      this.closeContextMenu();
    }
  }

  onContextCustom(action: string): void {
    const row = this.contextMenuRow();
    if (row) {
      this.customAction.emit({ action, row });
      this.closeContextMenu();
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeContextMenu();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeContextMenu();
  }
}
