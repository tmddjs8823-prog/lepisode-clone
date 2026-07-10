import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

const API = 'http://localhost:3000/api/v1/users';

export interface AdminUserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: '최고관리자',
  ADMIN: '관리자',
  EDITOR: '편집자',
};

@Component({
  selector: 'admin-admins-page',
  imports: [FormsModule, PageHeaderComponent, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './admins.page.html',
})
export class AdminsPage implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  data = signal<AdminUserItem[]>([]);
  searchTerm = signal('');
  total = signal(0);
  page = signal(1);
  limit = signal(10);
  loading = signal(false);

  readonly roleOptions = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id', label: '순번', align: 'center', width: '4.5rem', type: 'number' },
    { key: 'name', label: '이름', align: 'left' },
    {
      key: 'role', label: '역할', align: 'center', width: '7rem', type: 'badge',
      badgeMap: {
        SUPER_ADMIN: { label: '최고관리자', class: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
        ADMIN:       { label: '관리자',     class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
        EDITOR:      { label: '편집자',     class: 'bg-slate-700/50 text-slate-400 border border-slate-600/30' },
      },
    },
    {
      key: 'isActive', label: '권한', align: 'center', width: '5rem', type: 'badge',
      badgeMap: {
        true:  { label: '활성', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
        false: { label: '비활성', class: 'bg-red-500/10 text-red-400 border border-red-500/20' },
      },
    },
    { key: 'createdAt', label: '등록일자', align: 'center', width: '7.5rem', type: 'date' },
  ];

  /* ── 폼 ── */
  showForm = signal(false);
  editingItem = signal<AdminUserItem | null>(null);
  saving = signal(false);
  formTitle = computed(() => this.editingItem() ? '사용자 수정' : '사용자 등록');

  fName = signal('');
  fEmail = signal('');
  fPassword = signal('');
  fRole = signal('ADMIN');
  fIsActive = signal(true);

  /* ── 삭제 ── */
  deleteTarget = signal<AdminUserItem | null>(null);
  deleting = signal(false);

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

  onSearch(term?: string): void { this.searchTerm.set(term || ''); }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: '순번' },
      { key: 'name', header: '이름' },
      { key: 'role', header: '역할' },
      { key: 'isActive', header: '권한' },
      { key: 'createdAt', header: '등록일자' },
    ], '사용자목록');
  }

  loadData(): void {
    this.loading.set(true);
    this.http.get<AdminUserItem[]>(API).subscribe({
      next: (list) => {
        this.data.set(list);
        this.total.set(list.length);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('사용자 목록을 불러오지 못했습니다.');
        this.loading.set(false);
      },
    });
  }

  onPageChange(p: number): void { this.page.set(p); }

  openForm(item?: AdminUserItem): void {
    if (item) {
      this.editingItem.set(item);
      this.fName.set(item.name);
      this.fEmail.set(item.email);
      this.fPassword.set('');
      this.fRole.set(item.role);
      this.fIsActive.set(item.isActive);
    } else {
      this.editingItem.set(null);
      this.fName.set('');
      this.fEmail.set('');
      this.fPassword.set('');
      this.fRole.set('ADMIN');
      this.fIsActive.set(true);
    }
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  save(): void {
    if (!this.fName().trim()) { this.toast.warning('이름을 입력하세요.'); return; }
    if (!this.fEmail().trim()) { this.toast.warning('이메일을 입력하세요.'); return; }

    this.saving.set(true);
    const editing = this.editingItem();

    if (editing) {
      const payload: Record<string, unknown> = {
        name: this.fName().trim(),
        role: this.fRole(),
        isActive: this.fIsActive(),
      };
      this.http.put(`${API}/${editing.id}`, payload).subscribe({
        next: () => {
          this.toast.success('수정되었습니다.');
          this.saving.set(false);
          this.closeForm();
          this.loadData();
        },
        error: () => {
          this.toast.error('수정에 실패했습니다.');
          this.saving.set(false);
        },
      });
    } else {
      if (!this.fPassword().trim()) { this.toast.warning('비밀번호를 입력하세요.'); this.saving.set(false); return; }
      const payload = {
        email: this.fEmail().trim(),
        password: this.fPassword(),
        name: this.fName().trim(),
        role: this.fRole(),
      };
      this.http.post(API, payload).subscribe({
        next: () => {
          this.toast.success('등록되었습니다.');
          this.saving.set(false);
          this.closeForm();
          this.loadData();
        },
        error: (err) => {
          const msg = err?.error?.message || '등록에 실패했습니다.';
          this.toast.error(msg);
          this.saving.set(false);
        },
      });
    }
  }

  getRoleLabel(role: string): string {
    return ROLE_LABEL[role] ?? role;
  }

  /* ── 삭제 ── */
  onDelete(item: AdminUserItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.http.delete(`${API}/${t.id}`).subscribe({
      next: () => {
        this.toast.success('삭제되었습니다.');
        this.deleteTarget.set(null);
        this.deleting.set(false);
        this.loadData();
      },
      error: () => {
        this.toast.error('삭제에 실패했습니다.');
        this.deleting.set(false);
      },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
