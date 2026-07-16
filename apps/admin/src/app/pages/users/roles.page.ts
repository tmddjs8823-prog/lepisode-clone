import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

const API = 'http://localhost:3000/api/v1/users';

export interface RolePermissionItem {
  id: number;
  roleId: number;
  level: number;
  name: string;
  description: string | null;
}

export interface RoleItem {
  id: number;
  name: string;
  description: string | null;
  permissions: RolePermissionItem[];
  createdAt: string;
}

@Component({
  selector: 'admin-roles-page',
  imports: [FormsModule, ConfirmDialogComponent, PageHeaderComponent],
  templateUrl: './roles.page.html',
})
export class RolesPage implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  data = signal<RoleItem[]>([]);
  loading = signal(false);

  searchQuery = signal('');
  expandedIds = signal<Set<number>>(new Set());

  filteredData = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.data();
    return this.data().filter(r =>
      r.name.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q)
    );
  });

  /* ── 역할 등록 드로어 ── */
  showForm = signal(false);
  editingItem = signal<RoleItem | null>(null);
  saving = signal(false);
  formTitle = computed(() => this.editingItem() ? '역할 수정' : '역할 등록');
  fName = signal('');
  fDescription = signal('');

  /* ── 역할 수정 팝업 ── */
  showEditRole = signal(false);
  editRoleTarget = signal<RoleItem | null>(null);
  editRoleName = signal('');
  editRoleDesc = signal('');
  editRoleSaving = signal(false);

  /* ── 권한 등록 팝업 ── */
  showPermForm = signal(false);
  permTarget = signal<RoleItem | null>(null);
  permSaving = signal(false);
  pfLevel = signal<string>('');
  pfName = signal('');
  pfDescription = signal('');
  pfMenuId = signal<number | null>(null);
  menuOptions = signal<{ id: number; menuKey: string; menuName: string }[]>([]);
  levelOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  /* ── 삭제 ── */
  deleteTarget = signal<RoleItem | null>(null);
  deleting = signal(false);

  ngOnInit(): void {
    this.loadData();
    this.loadMenus();
  }

  toggleExpand(id: number): void {
    this.expandedIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  isExpanded(id: number): boolean {
    return this.expandedIds().has(id);
  }

  /* ── 데이터 로드 ── */
  loadData(): void {
    this.loading.set(true);
    this.http.get<RoleItem[]>(`${API}/roles/list`).subscribe({
      next: (list) => {
        this.data.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('역할 목록을 불러오지 못했습니다.');
        this.loading.set(false);
      },
    });
  }

  /* ── 메뉴 목록 로드 ── */
  loadMenus(): void {
    this.http.get<{ id: number; menuKey: string; menuName: string }[]>(`${API}/menus/list`).subscribe({
      next: (list) => this.menuOptions.set(list),
      error: () => { /* 조용히 무시 */ },
    });
  }

  /* ── 역할 등록 (상단) ── */
  openForm(): void {
    this.editingItem.set(null);
    this.fName.set('');
    this.fDescription.set('');
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  save(): void {
    if (!this.fName().trim()) { this.toast.warning('역할명을 입력하세요.'); return; }
    this.saving.set(true);
    const payload = {
      name: this.fName().trim(),
      description: this.fDescription().trim() || undefined,
    };
    this.http.post(`${API}/roles`, payload).subscribe({
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

  /* ── 역할 수정 (팝업) ── */
  openEditRole(role: RoleItem): void {
    this.editRoleTarget.set(role);
    this.editRoleName.set(role.name);
    this.editRoleDesc.set(role.description ?? '');
    this.showEditRole.set(true);
  }

  closeEditRole(): void { this.showEditRole.set(false); }

  saveEditRole(): void {
    if (!this.editRoleName().trim()) { this.toast.warning('역할명을 입력하세요.'); return; }
    const target = this.editRoleTarget();
    if (!target) return;
    this.editRoleSaving.set(true);
    const payload = {
      name: this.editRoleName().trim(),
      description: this.editRoleDesc().trim() || undefined,
    };
    this.http.put(`${API}/roles/${target.id}`, payload).subscribe({
      next: () => {
        this.toast.success('역할이 수정되었습니다.');
        this.editRoleSaving.set(false);
        this.closeEditRole();
        this.loadData();
      },
      error: () => {
        this.toast.error('역할 수정에 실패했습니다.');
        this.editRoleSaving.set(false);
      },
    });
  }

  /* ── 권한 등록 ── */
  openPermForm(role: RoleItem): void {
    this.permTarget.set(role);
    this.pfLevel.set('');
    this.pfName.set('');
    this.pfDescription.set('');
    this.pfMenuId.set(null);
    this.showPermForm.set(true);
  }
  closePermForm(): void { this.showPermForm.set(false); }
  savePermForm(): void {
    if (!this.pfName().trim()) { this.toast.warning('권한명을 입력하세요.'); return; }
    if (!this.pfLevel()) { this.toast.warning('레벨을 선택하세요.'); return; }
    const target = this.permTarget();
    if (!target) return;
    this.permSaving.set(true);
    const payload = {
      level: Number(this.pfLevel()),
      name: this.pfName().trim(),
      description: this.pfDescription().trim() || undefined,
    };
    this.http.post(`${API}/roles/${target.id}/permissions`, payload).subscribe({
      next: () => {
        this.toast.success('권한이 등록되었습니다.');
        this.permSaving.set(false);
        this.closePermForm();
        this.loadData();
        // 아코디언 자동 펼치기
        this.expandedIds.update(set => { const n = new Set(set); n.add(target.id); return n; });
      },
      error: () => {
        this.toast.error('권한 등록에 실패했습니다.');
        this.permSaving.set(false);
      },
    });
  }

  /* ── 권한 삭제 ── */
  deletePermission(roleId: number, permId: number): void {
    this.http.delete(`${API}/roles/${roleId}/permissions/${permId}`).subscribe({
      next: () => {
        this.toast.success('권한이 삭제되었습니다.');
        this.loadData();
      },
      error: () => {
        this.toast.error('권한 삭제에 실패했습니다.');
      },
    });
  }

  /* ── 권한 수정 팝업 ── */
  showEditPerm = signal(false);
  editPermTarget = signal<RolePermissionItem | null>(null);
  editPermRoleId = signal(0);
  editPermSaving = signal(false);
  epLevel = signal<number>(0);
  epName = signal('');
  epDescription = signal('');

  openEditPerm(roleId: number, perm: RolePermissionItem): void {
    this.editPermRoleId.set(roleId);
    this.editPermTarget.set(perm);
    this.epLevel.set(perm.level);
    this.epName.set(perm.name);
    this.epDescription.set(perm.description ?? '');
    this.showEditPerm.set(true);
  }
  closeEditPerm(): void { this.showEditPerm.set(false); }
  saveEditPerm(): void {
    if (!this.epName().trim()) { this.toast.warning('권한명을 입력하세요.'); return; }
    const target = this.editPermTarget();
    if (!target) return;
    this.editPermSaving.set(true);
    const payload = {
      level: this.epLevel(),
      name: this.epName().trim(),
      description: this.epDescription().trim() || undefined,
    };
    this.http.put(`${API}/roles/${this.editPermRoleId()}/permissions/${target.id}`, payload).subscribe({
      next: () => {
        this.toast.success('권한이 수정되었습니다.');
        this.editPermSaving.set(false);
        this.closeEditPerm();
        // 아코디언 자동 펼치기 유지
        const roleId = this.editPermRoleId();
        this.expandedIds.update(set => { const n = new Set(set); n.add(roleId); return n; });
        this.loadData();
      },
      error: () => {
        this.toast.error('권한 수정에 실패했습니다.');
        this.editPermSaving.set(false);
      },
    });
  }

  /* ── 역할 삭제 ── */
  onDelete(item: RoleItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.http.delete(`${API}/roles/${t.id}`).subscribe({
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

  /* ── JSON 내보내기 ── */
  exportJson(): void {
    const json = JSON.stringify(this.data(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roles_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('JSON 파일이 다운로드되었습니다.');
  }
}
