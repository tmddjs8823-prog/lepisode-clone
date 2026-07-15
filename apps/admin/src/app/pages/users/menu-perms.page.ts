import { Component, signal, inject, computed, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, switchMap } from 'rxjs';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

const API = 'http://localhost:3000/api/v1/users';

export interface MenuPermItem {
  id: number;
  menuKey: string;
  menuName: string;
  parentKey: string | null;
  routeUrl: string | null;
  apiUrl: string | null;
  pageType: string | null;
  sortOrder: number;
}

@Component({
  selector: 'admin-menu-perms-page',
  imports: [FormsModule, ConfirmDialogComponent, PageHeaderComponent],
  templateUrl: './menu-perms.page.html',
})
export class MenuPermsPage implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  data = signal<MenuPermItem[]>([]);
  loading = signal(false);

  searchQuery = signal('');

  /** 부모 메뉴 목록 (parentKey 가 null 이거나, 부모가 존재하지 않는 항목) */
  parentMenus = computed(() => {
    const all = this.filteredData();
    const allKeys = new Set(this.data().map(m => m.menuKey));
    return all.filter(m => !m.parentKey || !allKeys.has(m.parentKey));
  });

  /** 부모 메뉴 키로 자식 메뉴 찾기 */
  childMenus(parentKey: string): MenuPermItem[] {
    return this.data().filter(m => m.parentKey === parentKey);
  }

  expandedIds = signal<Set<number>>(new Set());

  filteredData = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.data();
    return this.data().filter(m =>
      m.menuName.toLowerCase().includes(q) ||
      m.menuKey.toLowerCase().includes(q) ||
      (m.parentKey ?? '').toLowerCase().includes(q)
    );
  });

  /* ── 메뉴 등록 팝업 ── */
  showForm = signal(false);
  saving = signal(false);
  fMenuKey = signal('');
  fMenuName = signal('');
  fParentKey = signal('');

  /* ── 하위메뉴 등록 팝업 ── */
  showSubMenuForm = signal(false);
  subMenuTarget = signal<MenuPermItem | null>(null);
  subSaving = signal(false);
  sfMenuKey = signal('');
  sfMenuName = signal('');

  /* ── 메뉴 수정 팝업 ── */
  showEditMenu = signal(false);
  editMenuTarget = signal<MenuPermItem | null>(null);
  editSaving = signal(false);
  efMenuKey = signal('');
  efMenuName = signal('');
  efParentKey = signal('');
  showPermForm = signal(false);
  permTarget = signal<MenuPermItem | null>(null);
  permSaving = signal(false);
  pfLevel = signal<number>(0);
  pfRoleId = signal<number | null>(null);
  pfRead = signal(true);
  pfCreate = signal(false);
  pfUpdate = signal(false);
  pfDelete = signal(false);
  roleOptions = signal<{ id: number; name: string; permissions: { id: number; level: number; name: string; description: string | null }[] }[]>([]);
  levelOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  /** 메뉴명/메뉴키 → 권한 배열 맵 (computed signal) */
  permMap = computed(() => {
    const map = new Map<string, { permId: number; roleId: number; level: number; roleName: string; permName: string }[]>();
    const addToMap = (key: string, entry: { permId: number; roleId: number; level: number; roleName: string; permName: string }) => {
      if (!map.has(key)) map.set(key, []);
      const arr = map.get(key)!;
      if (!arr.some(e => e.permId === entry.permId)) arr.push(entry);
    };
    for (const role of this.roleOptions()) {
      for (const perm of (role.permissions ?? [])) {
        const entry = { permId: perm.id, roleId: role.id, level: perm.level, roleName: role.name, permName: perm.name };
        if (perm.name) {
          addToMap(perm.name, entry);
          // 메뉴명_조회 같은 패턴 → 메뉴명으로도 매핑
          const suffixes = ['_조회', '_등록', '_수정', '_삭제'];
          for (const suffix of suffixes) {
            if (perm.name.endsWith(suffix)) {
              addToMap(perm.name.replace(suffix, ''), entry);
              break;
            }
          }
        }
        if (perm.description?.endsWith(' 메뉴 권한')) {
          addToMap(perm.description.replace(' 메뉴 권한', ''), entry);
        }
        // 메뉴 조회/등록/수정/삭제 권한 패턴
        const descMatch = perm.description?.match(/^(.+)\s메뉴\s(조회|등록|수정|삭제)\s권한$/);
        if (descMatch) {
          addToMap(descMatch[1], entry);
        }
      }
    }
    return map;
  });

  /** 메뉴에 연결된 권한 조회 */
  getMenuPerms(menuName: string, menuKey: string): { permId: number; roleId: number; level: number; roleName: string; permName: string }[] {
    const m = this.permMap();
    // 중복 제거하여 name 또는 key로 매칭
    const byName = m.get(menuName) ?? [];
    const byKey = m.get(menuKey) ?? [];
    const seen = new Set<number>();
    const result: { permId: number; roleId: number; level: number; roleName: string; permName: string }[] = [];
    for (const p of [...byName, ...byKey]) {
      if (!seen.has(p.permId)) {
        seen.add(p.permId);
        result.push(p);
      }
    }
    return result;
  }

  /** 역할별 권한 그룹 (4개 타입 항상 표시, active 여부 포함) */
  getGroupedPerms(menuName: string, menuKey: string): { roleId: number; roleName: string; level: number; types: { type: string; active: boolean; permId: number | null }[] }[] {
    const all = this.getMenuPerms(menuName, menuKey);
    const map = new Map<number, { roleId: number; roleName: string; level: number; activeTypes: Map<string, number> }>();
    const allTypes = ['조회', '등록', '수정', '삭제'];
    for (const p of all) {
      let group = map.get(p.roleId);
      if (!group) {
        group = { roleId: p.roleId, roleName: p.roleName, level: p.level, activeTypes: new Map() };
        map.set(p.roleId, group);
      }
      for (const suffix of ['_조회', '_등록', '_수정', '_삭제']) {
        if (p.permName.endsWith(suffix)) {
          group.activeTypes.set(suffix.replace('_', ''), p.permId);
          break;
        }
      }
    }
    return [...map.values()]
      .filter(g => g.activeTypes.size > 0)
      .map(g => ({
        roleId: g.roleId,
        roleName: g.roleName,
        level: g.level,
        types: allTypes.map(t => ({ type: t, active: g.activeTypes.has(t), permId: g.activeTypes.get(t) ?? null })),
      }));
  }

  /** types 배열에서 첫 번째 활성 permId 반환 */
  getFirstActivePermId(types: { active: boolean; permId: number | null }[]): number {
    return types.find(t => t.active && t.permId !== null)?.permId ?? 0;
  }

  showEditMenuPerm = signal(false);
  editMenuPermId = signal(0);
  editMenuPermRoleId = signal(0);
  editMenuPermSaving = signal(false);
  empLevel = signal<number>(0);
  empName = signal('');
  empDescription = signal('');
  empMenuKey = signal('');
  // 수정 폼 체크박스
  empRead = signal(false);
  empCreate = signal(false);
  empUpdate = signal(false);
  empDelete = signal(false);

  openEditMenuPerm(mp: { permId: number; roleId: number; level: number; roleName: string; permName?: string }, menuName: string): void {
    this.editMenuPermId.set(mp.permId);
    this.editMenuPermRoleId.set(mp.roleId);
    this.empLevel.set(mp.level);
    this.empName.set(menuName);
    this.empDescription.set('');
    // 메뉴키 찾기
    const menuItem = this.data().find(m => m.menuName === menuName);
    this.empMenuKey.set(menuItem?.menuKey ?? menuName);
    // 현재 활성 타입 체크
    const grouped = this.getGroupedPerms(menuName, menuItem?.menuKey ?? '');
    const group = grouped.find(g => g.roleId === mp.roleId);
    this.empRead.set(group?.types.find(t => t.type === '조회')?.active ?? false);
    this.empCreate.set(group?.types.find(t => t.type === '등록')?.active ?? false);
    this.empUpdate.set(group?.types.find(t => t.type === '수정')?.active ?? false);
    this.empDelete.set(group?.types.find(t => t.type === '삭제')?.active ?? false);
    this.showEditMenuPerm.set(true);
  }
  closeEditMenuPerm(): void { this.showEditMenuPerm.set(false); }
  saveEditMenuPerm(): void {
    this.editMenuPermSaving.set(true);
    const roleId = this.editMenuPermRoleId();
    const menuName = this.empName();
    const menuKey = this.empMenuKey();
    const level = this.empLevel();

    // 현재 활성 권한 조회
    const grouped = this.getGroupedPerms(menuName, menuKey);
    const group = grouped.find(g => g.roleId === roleId);
    const existingTypes = group?.types ?? [];

    const wantedTypes: { type: string; checked: boolean }[] = [
      { type: '조회', checked: this.empRead() },
      { type: '등록', checked: this.empCreate() },
      { type: '수정', checked: this.empUpdate() },
      { type: '삭제', checked: this.empDelete() },
    ];

    if (wantedTypes.every(w => !w.checked)) {
      this.toast.warning('권한을 하나 이상 선택하세요.');
      this.editMenuPermSaving.set(false);
      return;
    }

    const toCreate: string[] = [];
    const toDelete: number[] = [];
    const toUpdate: { permId: number; type: string }[] = [];

    for (const w of wantedTypes) {
      const existing = existingTypes.find(e => e.type === w.type);
      if (w.checked && !existing?.active) {
        toCreate.push(w.type);
      } else if (!w.checked && existing?.active && existing.permId) {
        toDelete.push(existing.permId);
      } else if (w.checked && existing?.active && existing.permId) {
        toUpdate.push({ permId: existing.permId, type: w.type });
      }
    }

    const ops: import('rxjs').Observable<unknown>[] = [];
    for (const type of toCreate) {
      ops.push(this.http.post(`${API}/roles/${roleId}/permissions`, {
        level,
        name: `${menuName}_${type}`,
        description: `${menuKey} 메뉴 ${type} 권한`,
      }));
    }
    for (const permId of toDelete) {
      ops.push(this.http.delete(`${API}/roles/${roleId}/permissions/${permId}`));
    }
    for (const u of toUpdate) {
      ops.push(this.http.put(`${API}/roles/${roleId}/permissions/${u.permId}`, {
        level,
        name: `${menuName}_${u.type}`,
        description: `${menuKey} 메뉴 ${u.type} 권한`,
      }));
    }

    if (ops.length === 0) {
      this.toast.info('변경사항이 없습니다.');
      this.editMenuPermSaving.set(false);
      this.closeEditMenuPerm();
      return;
    }

    forkJoin(ops).pipe(
      switchMap(() => this.http.get<{ id: number; name: string; permissions: { id: number; level: number; name: string; description: string | null }[] }[]>(`${API}/roles/list`)),
    ).subscribe({
      next: (list) => {
        this.roleOptions.set([...list]);
        this.cdr.detectChanges();
        this.toast.success('권한이 수정되었습니다.');
        this.editMenuPermSaving.set(false);
        this.closeEditMenuPerm();
      },
      error: () => {
        this.toast.error('권한 수정에 실패했습니다.');
        this.editMenuPermSaving.set(false);
      },
    });
  }

  /** 수정 폼 내 삭제 버튼 */
  deleteEditMenuPerm(): void {
    if (!confirm('이 역할의 모든 권한을 삭제하시겠습니까?')) return;
    const roleId = this.editMenuPermRoleId();
    const menuName = this.empName();
    const menuKey = this.empMenuKey();
    const grouped = this.getGroupedPerms(menuName, menuKey);
    const group = grouped.find(g => g.roleId === roleId);
    const activePermIds = (group?.types ?? []).flatMap(t => t.permId !== null ? [t.permId] : []);
    if (activePermIds.length === 0) return;
    forkJoin(
      activePermIds.map(permId => this.http.delete(`${API}/roles/${roleId}/permissions/${permId}`))
    ).pipe(
      switchMap(() => this.http.get<{ id: number; name: string; permissions: { id: number; level: number; name: string; description: string | null }[] }[]>(`${API}/roles/list`)),
    ).subscribe({
      next: (list) => {
        this.roleOptions.set([...list]);
        this.cdr.detectChanges();
        this.toast.success('권한이 삭제되었습니다.');
        this.closeEditMenuPerm();
      },
      error: () => this.toast.error('권한 삭제에 실패했습니다.'),
    });
  }

  /** 메뉴 권한 배지 삭제 */
  deleteMenuPerm(mp: { permId: number; roleId: number }): void {
    if (!confirm('이 권한을 삭제하시겠습니까?')) return;
    this.http.delete(`${API}/roles/${mp.roleId}/permissions/${mp.permId}`).pipe(
      switchMap(() => this.http.get<{ id: number; name: string; permissions: { id: number; level: number; name: string; description: string | null }[] }[]>(`${API}/roles/list`)),
    ).subscribe({
      next: (list) => {
        this.roleOptions.set([...list]);
        this.cdr.detectChanges();
        this.toast.success('권한이 삭제되었습니다.');
      },
      error: (err) => {
        const msg = err?.error?.message || '권한 삭제에 실패했습니다.';
        this.toast.error(msg);
      },
    });
  }

  /** 그룹 내 모든 권한 삭제 */
  deleteGroupPerms(group: { roleId: number; types: { permId: number | null }[] }): void {
    if (!confirm('이 역할의 모든 권한을 삭제하시겠습니까?')) return;
    const activePermIds = group.types.flatMap(t => t.permId !== null ? [t.permId] : []);
    if (activePermIds.length === 0) return;
    forkJoin(
      activePermIds.map(permId => this.http.delete(`${API}/roles/${group.roleId}/permissions/${permId}`))
    ).pipe(
      switchMap(() => this.http.get<{ id: number; name: string; permissions: { id: number; level: number; name: string; description: string | null }[] }[]>(`${API}/roles/list`)),
    ).subscribe({
      next: (list) => {
        this.roleOptions.set([...list]);
        this.cdr.detectChanges();
        this.toast.success('권한이 삭제되었습니다.');
      },
      error: () => this.toast.error('권한 삭제에 실패했습니다.'),
    });
  }

  /* ── 삭제 ── */
  deleteTarget = signal<MenuPermItem | null>(null);
  deleting = signal(false);

  ngOnInit(): void {
    this.loadData();
    this.loadRoles();
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.toast.success('복사되었습니다.');
    });
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
    this.http.get<MenuPermItem[]>(`${API}/menus/list`).subscribe({
      next: (list) => {
        this.data.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('메뉴 권한 목록을 불러오지 못했습니다.');
        this.loading.set(false);
      },
    });
  }

  /* ── 역할 목록 로드 (권한 포함) ── */
  loadRoles(): void {
    this.http.get<{ id: number; name: string; permissions: { id: number; level: number; name: string; description: string | null }[] }[]>(`${API}/roles/list`).subscribe({
      next: (list) => {
        this.roleOptions.set(list);
      },
      error: () => { this.toast.error('역할 목록을 불러오지 못했습니다.'); },
    });
  }

  /* ── 메뉴 등록 ── */
  openForm(): void {
    this.fMenuKey.set('');
    this.fMenuName.set('');
    this.fParentKey.set('');
    this.showForm.set(true);
  }
  closeForm(): void { this.showForm.set(false); }
  save(): void {
    if (!this.fMenuName().trim()) { this.toast.warning('메뉴명을 입력하세요.'); return; }
    this.saving.set(true);
    const payload: Record<string, unknown> = {
      menuKey: this.fMenuKey().trim() || crypto.randomUUID(),
      menuName: this.fMenuName().trim(),
    };
    if (this.fParentKey().trim()) {
      payload['parentKey'] = this.fParentKey().trim();
    }
    this.http.post(`${API}/menus`, payload).subscribe({
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

  /* ── 하위메뉴 등록 ── */
  sfRouteUrl = signal('');
  sfApiUrl = signal('');
  sfPageType = signal('');
  pageTypeOptions = ['조회', '등록', '수정'];

  openSubMenuForm(parent: MenuPermItem): void {
    this.subMenuTarget.set(parent);
    this.sfMenuKey.set('');
    this.sfMenuName.set('');
    this.sfRouteUrl.set('');
    this.sfApiUrl.set('');
    this.sfPageType.set('');
    this.showSubMenuForm.set(true);
  }
  closeSubMenuForm(): void { this.showSubMenuForm.set(false); }
  saveSubMenu(): void {
    if (!this.sfMenuName().trim()) { this.toast.warning('메뉴명을 입력하세요.'); return; }
    const target = this.subMenuTarget();
    if (!target) return;
    this.subSaving.set(true);
    // menuKey 자동 생성: UUID
    const autoKey = this.sfMenuKey().trim() || crypto.randomUUID();
    const payload: { menuKey: string; menuName: string; parentKey: string; routeUrl?: string; apiUrl?: string; pageType?: string } = {
      menuKey: autoKey,
      menuName: this.sfMenuName().trim(),
      parentKey: target.menuKey,
    };
    if (this.sfRouteUrl().trim()) payload.routeUrl = this.sfRouteUrl().trim();
    if (this.sfApiUrl().trim()) payload.apiUrl = this.sfApiUrl().trim();
    if (this.sfPageType()) payload.pageType = this.sfPageType();
    this.http.post(`${API}/menus`, payload).subscribe({
      next: () => {
        this.toast.success('하위메뉴가 등록되었습니다.');
        this.subSaving.set(false);
        this.closeSubMenuForm();
        this.loadData();
        // 자동으로 부모 아코디언 펼치기
        this.expandedIds.update(set => { const n = new Set(set); n.add(target.id); return n; });
      },
      error: (err) => {
        const msg = err?.error?.message || '등록에 실패했습니다.';
        this.toast.error(msg);
        this.subSaving.set(false);
      },
    });
  }

  /* ── 메뉴 수정 ── */
  openEditMenu(item: MenuPermItem): void {
    this.editMenuTarget.set(item);
    this.efMenuKey.set(item.menuKey);
    this.efMenuName.set(item.menuName);
    this.efParentKey.set(item.parentKey ?? '');
    this.showEditMenu.set(true);
  }
  closeEditMenu(): void { this.showEditMenu.set(false); }
  saveEditMenu(): void {
    if (!this.efMenuKey().trim()) { this.toast.warning('메뉴 키를 입력하세요.'); return; }
    if (!this.efMenuName().trim()) { this.toast.warning('메뉴명을 입력하세요.'); return; }
    const target = this.editMenuTarget();
    if (!target) return;
    this.editSaving.set(true);
    // 백엔드에 PUT /menus/:id API가 없으므로 안내 메시지 표시
    // NOTE: 향후 PUT /menus/:id API 추가 시 교체 필요
    this.toast.warning('메뉴 수정 API가 아직 구현되지 않았습니다.');
    this.editSaving.set(false);
    this.closeEditMenu();
  }

  /* ── 권한 추가 ── */
  openPermForm(item: MenuPermItem): void {
    this.permTarget.set(item);
    this.pfLevel.set(0);
    this.pfRoleId.set(null);
    this.pfRead.set(true);
    this.pfCreate.set(false);
    this.pfUpdate.set(false);
    this.pfDelete.set(false);
    this.showPermForm.set(true);
  }
  closePermForm(): void { this.showPermForm.set(false); }
  savePermForm(): void {
    const roleId = this.pfRoleId();
    if (!roleId) { this.toast.warning('역할을 선택하세요.'); return; }
    const target = this.permTarget();
    if (!target) return;

    const types: string[] = [];
    if (this.pfRead()) types.push('조회');
    if (this.pfCreate()) types.push('등록');
    if (this.pfUpdate()) types.push('수정');
    if (this.pfDelete()) types.push('삭제');
    if (types.length === 0) { this.toast.warning('권한을 하나 이상 선택하세요.'); return; }

    this.permSaving.set(true);
    let completed = 0;
    let hasError = false;
    for (const type of types) {
      const payload = {
        level: this.pfLevel(),
        name: `${target.menuName}_${type}`,
        description: `${target.menuKey} 메뉴 ${type} 권한`,
      };
      this.http.post(`${API}/roles/${roleId}/permissions`, payload).subscribe({
        next: () => {
          completed++;
          if (completed === types.length) {
            this.toast.success('권한이 설정되었습니다.');
            this.permSaving.set(false);
            this.closePermForm();
            this.http.get<{ id: number; name: string; permissions: { id: number; level: number; name: string; description: string | null }[] }[]>(`${API}/roles/list`).subscribe({
              next: (list) => this.roleOptions.set(list),
            });
          }
        },
        error: () => {
          if (!hasError) { this.toast.error('권한 설정에 실패했습니다.'); hasError = true; }
          completed++;
          if (completed === types.length) this.permSaving.set(false);
        },
      });
    }
  }

  /* ── 메뉴 삭제 ── */
  onDelete(item: MenuPermItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.http.delete(`${API}/menus/${t.id}`).subscribe({
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
    a.download = `menu-permissions_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('JSON 파일이 다운로드되었습니다.');
  }

  /* ── JSON 가져오기 ── */
  importJson(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string) as MenuPermItem[];
          if (!Array.isArray(parsed)) throw new Error('invalid');
          this.data.set(parsed);
          this.toast.success(`${parsed.length}개 메뉴 권한이 가져와졌습니다.`);
        } catch {
          this.toast.error('JSON 파일 형식이 올바르지 않습니다.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }
}
