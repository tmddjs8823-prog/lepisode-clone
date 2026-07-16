import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

const API = 'http://localhost:3000/api/v1/users';

interface RolePermission {
  id: number;
  roleId: number;
  level: number;
  name: string;
  description: string | null;
}

interface RoleApiItem {
  id: number;
  name: string;
  description: string | null;
  permissions: RolePermission[];
}

export interface AdminUserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  permission: string | null;
  isActive: boolean;
  createdAt: string;
}

/* 뱃지 색상 팔레트 (역할별로 순환 할당) */
const BADGE_PALETTE = [
  'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  'bg-slate-700/50 text-slate-400 border border-slate-600/30',
];

@Component({
  selector: 'admin-admins-page',
  imports: [FormsModule, PageHeaderComponent, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './admins.page.html',
})
export class AdminsPage implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private authService = inject(AuthService);
  private excel = inject(ExcelExportService);

  data = signal<AdminUserItem[]>([]);
  searchTerm = signal('');
  total = signal(0);
  page = signal(1);
  limit = signal(10);
  loading = signal(false);

  /* ── 역할 목록 (역할 관리 페이지 API에서 동적 로드) ── */
  roleList = signal<RoleApiItem[]>([]);

  /** 역할 컬럼용 동적 배지맵 */
  roleBadgeMap = computed(() => {
    const map: Record<string, { label: string; class: string }> = {};
    this.roleList().forEach((r, i) => {
      map[r.name] = { label: r.name, class: BADGE_PALETTE[i % BADGE_PALETTE.length] };
    });
    return map;
  });

  columns = computed<ColumnDef<Record<string, unknown>>[]>(() => [
    { key: 'id', label: '순번', align: 'center', width: '8%', type: 'number' },
    { key: 'name', label: '이름', align: 'center', width: '30%' },
    { key: 'role', label: '역할', align: 'center', width: '25%' },
    { key: 'permission', label: '권한', align: 'center', width: '15%' },
    { key: 'createdAt', label: '등록일자', align: 'center', width: '22%', type: 'date' },
  ]);

  /* ── 폼 ── */
  showForm = signal(false);
  editingItem = signal<AdminUserItem | null>(null);
  saving = signal(false);
  formTitle = computed(() => this.editingItem() ? '사용자 수정' : '사용자 등록');

  fName = signal('');
  fEmail = signal('');
  fPassword = signal('');
  fRole = signal('');
  fPermission = signal('');
  fIsActive = signal(true);

  /** 전체 역할에서 중복 제거된 권한 목록 */
  allPermissions = computed(() => {
    const map = new Map<string, RolePermission>();
    for (const role of this.roleList()) {
      for (const p of role.permissions ?? []) {
        if (!map.has(p.name)) map.set(p.name, p);
      }
    }
    return [...map.values()];
  });

  /** 선택된 권한을 가진 역할만 필터 */
  filteredRoles = computed(() => {
    const perm = this.fPermission();
    if (!perm) return [];
    return this.roleList().filter(r =>
      (r.permissions ?? []).some(p => p.name === perm)
    );
  });

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
    this.loadRoles();
    this.loadData();
  }

  /** 역할 관리 페이지와 동일한 API에서 역할 목록을 로드 */
  loadRoles(): void {
    this.http.get<RoleApiItem[]>(`${API}/roles/list`).subscribe({
      next: (list) => this.roleList.set(list),
      error: () => { /* 조용히 무시 */ },
    });
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
      this.fPermission.set(item.permission ?? '');
      this.fIsActive.set(item.isActive);
    } else {
      this.editingItem.set(null);
      this.fName.set('');
      this.fEmail.set('');
      this.fPassword.set('');
      this.fRole.set(this.roleList().length > 0 ? this.roleList()[0].name : '');
      this.fPermission.set('');
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
        permission: this.fPermission() || null,
        isActive: this.fIsActive(),
      };
      this.http.put(`${API}/${editing.id}`, payload).subscribe({
        next: () => {
          this.toast.success('수정되었습니다.');
          this.saving.set(false);
          this.closeForm();
          this.loadData();
          // 현재 로그인 사용자 프로필 갱신 (상단 토글 반영)
          this.authService.loadProfile().subscribe();
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
        permission: this.fPermission() || undefined,
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
    const found = this.roleList().find(r => r.name === role);
    return found ? found.name : role;
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
