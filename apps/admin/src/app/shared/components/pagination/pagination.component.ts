import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'admin-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  /* ── Inputs ── */
  totalItems = input.required<number>();
  currentPage = input<number>(1);
  pageSize = input<number>(10);
  pageSizeOptions = input<number[]>([5, 10, 15, 20, 50, 100, 500]);
  maxVisiblePages = input<number>(3);

  /* ── Outputs ── */
  pageChange = output<number>();
  pageSizeChange = output<number>();

  /* ── Computed ── */
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const max = this.maxVisiblePages();

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(max / 2);
    let start = Math.max(1, current - half);
    const end = Math.min(total, start + max - 1);

    if (end - start + 1 < max) {
      start = Math.max(1, end - max + 1);
    }

    const pages: number[] = [];

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push(-1); // ellipsis
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total) {
      if (end < total - 1) pages.push(-1); // ellipsis
      pages.push(total);
    }

    return pages;
  });

  /* ── Methods ── */
  goTo(page: number): void {
    const p = Math.max(1, Math.min(page, this.totalPages()));
    if (p !== this.currentPage()) {
      this.pageChange.emit(p);
    }
  }

  onPageSizeChange(event: Event): void {
    const size = +(event.target as HTMLSelectElement).value;
    this.pageSizeChange.emit(size);
  }
}
