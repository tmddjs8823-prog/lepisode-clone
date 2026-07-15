import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ColumnDef } from '../../shared/types/api.types';

const API = 'http://localhost:3000/api/v1/cody';

export interface CodyNotificationItem {
  id: number;
  status: string;
  companyName: string;
  content: string;
  createdAt: string;
}

@Component({
  selector: 'admin-cody-notifications-page',
  imports: [FormsModule, DataTableComponent, PageHeaderComponent],
  templateUrl: './cody-notifications.page.html',
})
export class CodyNotificationsPage implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  data = signal<CodyNotificationItem[]>([]);
  searchTerm = signal('');
  total = signal(0);
  page = signal(1);
  limit = signal(10);
  loading = signal(false);

  /** 알림톡 전역 활성/비활성 상태 */
  notificationEnabled = signal(true);

  /** 상태 변경 다이얼로그 */
  showStatusDialog = signal(false);
  statusChanging = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id', label: '순번', align: 'center', width: '4.5rem', type: 'number' },
    {
      key: 'status', label: '상태', align: 'center', width: '5.5rem', type: 'badge',
      badgeMap: {
        PENDING: { label: '대기', class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
        SENT:    { label: '발송', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        FAILED:  { label: '실패', class: 'bg-red-500/10 text-red-400 border border-red-500/20' },
        READ:    { label: '읽음', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
      },
    },
    { key: 'companyName', label: '기업명', align: 'center', width: '10rem' },
    { key: 'content', label: '내용', align: 'center' },
    { key: 'createdAt', label: '등록일자', align: 'center', width: '7.5rem', type: 'date' },
  ];

  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.data();
    return this.data().filter(item =>
      Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
    );
  });
  ngOnInit(): void {
    this.loadData();
  }

  onSearch(): void { /* searchTerm is bound via ngModel */ }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: '순번' },
      { key: 'status', header: '상태' },
      { key: 'companyName', header: '기업명' },
      { key: 'content', header: '내용' },
      { key: 'createdAt', header: '등록일자' },
    ], '알림');
  }

  loadData(): void {
    this.loading.set(true);
    this.http.get<{ data: CodyNotificationItem[]; total: number }>(`${API}/notifications?page=${this.page()}&limit=${this.limit()}`).subscribe({
      next: (res) => {
        this.data.set(res.data);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('알림 목록을 불러오지 못했습니다.');
        this.loading.set(false);
      },
    });
  }

  onPageChange(p: number): void { this.page.set(p); this.loadData(); }

  /** 알림톡 상태 변경 다이얼로그 열기 */
  openStatusDialog(): void {
    this.showStatusDialog.set(true);
  }

  /** 비활성화 처리 */
  confirmDeactivate(): void {
    this.statusChanging.set(true);
    setTimeout(() => {
      this.notificationEnabled.set(!this.notificationEnabled());
      const label = this.notificationEnabled() ? '활성' : '비활성';
      this.toast.success(`알림톡이 ${label} 상태로 변경되었습니다.`);
      this.statusChanging.set(false);
      this.showStatusDialog.set(false);
    }, 500);
  }

  cancelStatusDialog(): void {
    this.showStatusDialog.set(false);
  }
}
