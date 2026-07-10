import { Component, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

export type PageType = '조회' | '등록' | '수정';

export interface SubMenuItem {
  id: number;
  menuName: string;
  path: string;
  apiUrl: string;
  pageType: PageType;
}

export interface MenuPermission {
  id: number;
  level: number;
  roleName: string;
}

export interface MenuPermItem {
  id: number;
  menuName: string;
  path: string;
  apiUrl: string;
  pageType: PageType;
  subMenus: SubMenuItem[];
  permissions: MenuPermission[];
}

@Component({
  selector: 'admin-menu-perms-page',
  imports: [FormsModule, ConfirmDialogComponent],
  templateUrl: './menu-perms.page.html',
})
export class MenuPermsPage {
  private toast = inject(ToastService);

  /* 역할 목록 (역할 및 권한 관리 탭과 연동) */
  readonly roleOptions = signal<string[]>([]);

  data = signal<MenuPermItem[]>([]);

  searchQuery = signal('');
  expandedIds = signal<Set<number>>(new Set());

  filteredData = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.data();
    return this.data().filter(m => m.menuName.includes(q) || m.path.includes(q));
  });

  /* ── 메뉴 등록 (상단 버튼) ── */
  showForm = signal(false);
  saving = signal(false);
  fMenuName = signal('');
  fPath = signal('');
  fApiUrl = signal('');
  fPageType = signal<PageType>('조회');

  readonly pageTypes: PageType[] = ['조회', '등록', '수정'];
  readonly levels = Array.from({ length: 11 }, (_, i) => i);

  /* ── 하위메뉴 등록 팝업 ── */
  showSubMenuForm = signal(false);
  subMenuTarget = signal<MenuPermItem | null>(null);
  subSaving = signal(false);
  sfMenuName = signal('');
  sfPath = signal('');
  sfApiUrl = signal('');
  sfPageType = signal<PageType>('조회');

  /* ── 메뉴 수정 팝업 ── */
  showEditMenu = signal(false);
  editMenuTarget = signal<MenuPermItem | null>(null);
  editSaving = signal(false);
  efMenuName = signal('');
  efPath = signal('');
  efApiUrl = signal('');
  efPageType = signal<PageType>('조회');

  /* ── 권한 추가 팝업 ── */
  showPermForm = signal(false);
  permTarget = signal<MenuPermItem | null>(null);
  permSaving = signal(false);
  pfLevel = signal<number | null>(null);
  pfRole = signal('');

  /* ── 삭제 ── */
  deleteTarget = signal<MenuPermItem | null>(null);
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

  /* ── 상단 메뉴 등록 ── */
  openForm(): void {
    this.fMenuName.set(''); this.fPath.set(''); this.fApiUrl.set(''); this.fPageType.set('조회');
    this.showForm.set(true);
  }
  closeForm(): void { this.showForm.set(false); }
  save(): void {
    if (!this.fMenuName().trim()) { this.toast.warning('메뉴명을 입력하세요.'); return; }
    if (!this.fPath().trim()) { this.toast.warning('경로를 입력하세요.'); return; }
    this.saving.set(true);
    setTimeout(() => {
      this.data.update(list => [...list, {
        id: Date.now(), menuName: this.fMenuName().trim(), path: this.fPath().trim(),
        apiUrl: this.fApiUrl().trim(), pageType: this.fPageType(), subMenus: [], permissions: [],
      }]);
      this.toast.success('등록되었습니다.');
      this.saving.set(false);
      this.closeForm();
    }, 500);
  }

  /* ── 하위메뉴 등록 ── */
  openSubMenuForm(item: MenuPermItem): void {
    this.subMenuTarget.set(item);
    this.sfMenuName.set(''); this.sfPath.set(''); this.sfApiUrl.set(''); this.sfPageType.set('조회');
    this.showSubMenuForm.set(true);
  }
  closeSubMenuForm(): void { this.showSubMenuForm.set(false); }
  saveSubMenu(): void {
    if (!this.sfMenuName().trim()) { this.toast.warning('메뉴명을 입력하세요.'); return; }
    if (!this.sfPath().trim()) { this.toast.warning('경로를 입력하세요.'); return; }
    const target = this.subMenuTarget();
    if (!target) return;
    this.subSaving.set(true);
    setTimeout(() => {
      const newSub: SubMenuItem = {
        id: Date.now(), menuName: this.sfMenuName().trim(), path: this.sfPath().trim(),
        apiUrl: this.sfApiUrl().trim(), pageType: this.sfPageType(),
      };
      this.data.update(list => list.map(m =>
        m.id === target.id ? { ...m, subMenus: [...m.subMenus, newSub] } : m
      ));
      this.expandedIds.update(set => { const n = new Set(set); n.add(target.id); return n; });
      this.toast.success('하위메뉴가 등록되었습니다.');
      this.subSaving.set(false);
      this.closeSubMenuForm();
    }, 500);
  }

  /* ── 메뉴 수정 ── */
  openEditMenu(item: MenuPermItem): void {
    this.editMenuTarget.set(item);
    this.efMenuName.set(item.menuName); this.efPath.set(item.path);
    this.efApiUrl.set(item.apiUrl); this.efPageType.set(item.pageType);
    this.showEditMenu.set(true);
  }
  closeEditMenu(): void { this.showEditMenu.set(false); }
  saveEditMenu(): void {
    if (!this.efMenuName().trim()) { this.toast.warning('메뉴명을 입력하세요.'); return; }
    if (!this.efPath().trim()) { this.toast.warning('경로를 입력하세요.'); return; }
    const target = this.editMenuTarget();
    if (!target) return;
    this.editSaving.set(true);
    setTimeout(() => {
      this.data.update(list => list.map(m =>
        m.id === target.id ? { ...m, menuName: this.efMenuName().trim(), path: this.efPath().trim(), apiUrl: this.efApiUrl().trim(), pageType: this.efPageType() } : m
      ));
      this.toast.success('메뉴가 수정되었습니다.');
      this.editSaving.set(false);
      this.closeEditMenu();
    }, 500);
  }

  /* ── 권한 추가 ── */
  openPermForm(item: MenuPermItem): void {
    this.permTarget.set(item);
    this.pfLevel.set(null); this.pfRole.set('');
    this.showPermForm.set(true);
  }
  closePermForm(): void { this.showPermForm.set(false); }
  savePermForm(): void {
    if (this.pfLevel() === null) { this.toast.warning('레벨을 선택하세요.'); return; }
    if (!this.pfRole()) { this.toast.warning('역할을 선택하세요.'); return; }
    const target = this.permTarget();
    if (!target) return;
    this.permSaving.set(true);
    setTimeout(() => {
      const newPerm: MenuPermission = { id: Date.now(), level: this.pfLevel()!, roleName: this.pfRole() };
      this.data.update(list => list.map(m =>
        m.id === target.id ? { ...m, permissions: [...m.permissions, newPerm] } : m
      ));
      this.expandedIds.update(set => { const n = new Set(set); n.add(target.id); return n; });
      this.toast.success('권한이 추가되었습니다.');
      this.permSaving.set(false);
      this.closePermForm();
    }, 500);
  }

  /* ── 하위메뉴/권한 삭제 ── */
  removeSubMenu(menuId: number, subId: number): void {
    this.data.update(list => list.map(m =>
      m.id === menuId ? { ...m, subMenus: m.subMenus.filter(s => s.id !== subId) } : m
    ));
    this.toast.success('하위메뉴가 삭제되었습니다.');
  }

  removePerm(menuId: number, permId: number): void {
    this.data.update(list => list.map(m =>
      m.id === menuId ? { ...m, permissions: m.permissions.filter(p => p.id !== permId) } : m
    ));
    this.toast.success('권한이 삭제되었습니다.');
  }

  /* ── 인라인 하위메뉴 수정 ── */
  updateSub(menuId: number, subId: number, field: keyof SubMenuItem, value: string): void {
    const menu = this.data().find(m => m.id === menuId);
    const sub = menu?.subMenus.find(s => s.id === subId);
    if (sub) (sub as unknown as Record<string, unknown>)[field] = value;
  }

  /* ── 메뉴 삭제 ── */
  onDelete(item: MenuPermItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    setTimeout(() => {
      this.data.update(list => list.filter(m => m.id !== t.id));
      this.toast.success('삭제되었습니다.');
      this.deleteTarget.set(null);
      this.deleting.set(false);
    }, 500);
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
