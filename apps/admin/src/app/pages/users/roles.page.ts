import { Component, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

export interface PermissionItem {
  id: number;
  name: string;
  description: string;
  level: number;
}

export interface RoleItem {
  id: number;
  name: string;
  description: string;
  permissions: PermissionItem[];
}

@Component({
  selector: 'admin-roles-page',
  imports: [FormsModule, ConfirmDialogComponent],
  templateUrl: './roles.page.html',
})
export class RolesPage {
  private toast = inject(ToastService);

  data = signal<RoleItem[]>([]);

  searchQuery = signal('');
  expandedIds = signal<Set<number>>(new Set());

  filteredData = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.data();
    return this.data().filter(r => r.name.includes(q) || r.description.includes(q));
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
  permLevel = signal<number | null>(null);
  permName = signal('');
  permDesc = signal('');
  permSaving = signal(false);

  readonly levels = Array.from({ length: 11 }, (_, i) => i);

  /* ── 삭제 ── */
  deleteTarget = signal<RoleItem | null>(null);
  deleting = signal(false);

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
    setTimeout(() => {
      const newRole: RoleItem = {
        id: Date.now(),
        name: this.fName().trim(),
        description: this.fDescription().trim(),
        permissions: [],
      };
      this.data.update(list => [...list, newRole]);
      this.toast.success('등록되었습니다.');
      this.saving.set(false);
      this.closeForm();
    }, 500);
  }

  /* ── 역할 수정 (팝업) ── */
  openEditRole(role: RoleItem): void {
    this.editRoleTarget.set(role);
    this.editRoleName.set(role.name);
    this.editRoleDesc.set(role.description);
    this.showEditRole.set(true);
  }

  closeEditRole(): void { this.showEditRole.set(false); }

  saveEditRole(): void {
    if (!this.editRoleName().trim()) { this.toast.warning('역할명을 입력하세요.'); return; }
    const target = this.editRoleTarget();
    if (!target) return;
    this.editRoleSaving.set(true);
    setTimeout(() => {
      this.data.update(roles => roles.map(r =>
        r.id === target.id
          ? { ...r, name: this.editRoleName().trim(), description: this.editRoleDesc().trim() }
          : r
      ));
      this.toast.success('역할이 수정되었습니다.');
      this.editRoleSaving.set(false);
      this.closeEditRole();
    }, 500);
  }

  /* ── 권한 등록 팝업 ── */
  openPermForm(role: RoleItem): void {
    this.permTarget.set(role);
    this.permLevel.set(null);
    this.permName.set('');
    this.permDesc.set('');
    this.showPermForm.set(true);
  }

  closePermForm(): void { this.showPermForm.set(false); }

  savePermForm(): void {
    if (this.permLevel() === null) { this.toast.warning('레벨을 선택하세요.'); return; }
    if (!this.permName().trim()) { this.toast.warning('권한명을 입력하세요.'); return; }
    const target = this.permTarget();
    if (!target) return;
    this.permSaving.set(true);
    setTimeout(() => {
      const newPerm = {
        id: Date.now(),
        name: this.permName().trim(),
        description: this.permDesc().trim(),
        level: this.permLevel()!,
      };
      this.data.update(roles => roles.map(r =>
        r.id === target.id ? { ...r, permissions: [...r.permissions, newPerm] } : r
      ));
      // 아코디언 자동 펼치기
      this.expandedIds.update(set => { const next = new Set(set); next.add(target.id); return next; });
      this.toast.success('권한이 등록되었습니다.');
      this.permSaving.set(false);
      this.closePermForm();
    }, 500);
  }

  /* ── 권한 인라인 수정 (직접 변경으로 재렌더링 방지) ── */
  updatePermLevel(roleId: number, permId: number, level: number): void {
    const role = this.data().find(r => r.id === roleId);
    const perm = role?.permissions.find(p => p.id === permId);
    if (perm) perm.level = level;
  }
  updatePermName(roleId: number, permId: number, name: string): void {
    const role = this.data().find(r => r.id === roleId);
    const perm = role?.permissions.find(p => p.id === permId);
    if (perm) perm.name = name;
  }
  updatePermDesc(roleId: number, permId: number, description: string): void {
    const role = this.data().find(r => r.id === roleId);
    const perm = role?.permissions.find(p => p.id === permId);
    if (perm) perm.description = description;
  }

  /* ── 권한 삭제 ── */
  removePerm(roleId: number, permId: number): void {
    this.data.update(roles => roles.map(r =>
      r.id === roleId ? { ...r, permissions: r.permissions.filter(p => p.id !== permId) } : r
    ));
    this.toast.success('권한이 삭제되었습니다.');
  }

  /* ── 역할 삭제 ── */
  onDelete(item: RoleItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    setTimeout(() => {
      this.data.update(list => list.filter(r => r.id !== t.id));
      this.toast.success('삭제되었습니다.');
      this.deleteTarget.set(null);
      this.deleting.set(false);
    }, 500);
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
