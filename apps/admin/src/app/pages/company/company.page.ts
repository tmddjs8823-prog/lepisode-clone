import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ColumnDef } from '../../shared/types/api.types';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { FormsModule } from '@angular/forms';

export interface TeamMember {
  id: number;
  name: string;
  nameEn?: string;
  nameJa?: string;
  position: string;
  positionEn?: string;
  positionJa?: string;
  profileImageUrl?: string;
  bio?: string;
  bioEn?: string;
  bioJa?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'admin-company-page',
  imports: [FormsModule, ConfirmDialogComponent, DataTableComponent, PageHeaderComponent],
  templateUrl: './company.page.html',
})
export class CompanyPage implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  data = signal<TeamMember[]>([]);
  searchTerm = signal('');
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'sortOrder', label: '순서',   align: 'center', width: '5rem', type: 'number' },
    { key: 'name',      label: '이름',   align: 'center' },
    { key: 'position',  label: '직함',   align: 'center' },
    { key: 'bio',       label: '분야',   align: 'center' },
    { key: 'createdAt', label: '등록일', align: 'center', width: '7.5rem', type: 'date' },
  ];

  showForm = signal(false);
  saving = signal(false);
  editingItem = signal<TeamMember | null>(null);
  formTitle = computed(() => this.editingItem() ? '팀원 수정' : '팀원 등록');

  fName = signal('');
  fNameEn = signal('');
  fNameJa = signal('');
  fPosition = signal('');
  fPositionEn = signal('');
  fPositionJa = signal('');
  fBio = signal('');
  fBioEn = signal('');
  fBioJa = signal('');
  fSortOrder = signal(0);
  fProfileImageUrl = signal('');
  fImageFile = signal<File | null>(null);
  fImagePreview = signal('');

  deleteTarget = signal<TeamMember | null>(null);
  deleting = signal(false);

  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.data();
    return this.data().filter(item =>
      Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
    );
  });
  ngOnInit(): void { this.loadData(); }

  onSearch(term?: string): void { this.searchTerm.set(typeof term === 'string' ? term : ''); }

  loadData(): void {
    this.loading.set(true);
    this.http.get<TeamMember[]>('http://localhost:3000/api/v1/company/team').subscribe({
      next: (res) => { this.data.set(res); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'sortOrder', header: '순서' },
      { key: 'name', header: '이름' },
      { key: 'position', header: '직함' },
      { key: 'bio', header: '분야' },
      { key: 'createdAt', header: '등록일' },
    ], '회사소개_팀원');
  }

  openForm(item?: TeamMember): void {
    this.showForm.set(true);
    if (item) {
      this.editingItem.set(item);
      this.fName.set(item.name);
      this.fNameEn.set(item.nameEn ?? '');
      this.fNameJa.set(item.nameJa ?? '');
      this.fPosition.set(item.position);
      this.fPositionEn.set(item.positionEn ?? '');
      this.fPositionJa.set(item.positionJa ?? '');
      this.fBio.set(item.bio ?? '');
      this.fBioEn.set(item.bioEn ?? '');
      this.fBioJa.set(item.bioJa ?? '');
      this.fSortOrder.set(item.sortOrder);
      this.fProfileImageUrl.set(item.profileImageUrl ?? '');
      this.fImagePreview.set(item.profileImageUrl ?? '');
      this.fImageFile.set(null);
    } else {
      this.editingItem.set(null);
      this.fName.set(''); this.fNameEn.set(''); this.fNameJa.set('');
      this.fPosition.set(''); this.fPositionEn.set(''); this.fPositionJa.set('');
      this.fBio.set(''); this.fBioEn.set(''); this.fBioJa.set('');
      this.fSortOrder.set(0);
      this.fProfileImageUrl.set(''); this.fImagePreview.set(''); this.fImageFile.set(null);
    }
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingItem.set(null);
    this.fImageFile.set(null);
    this.fImagePreview.set('');
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.fImageFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.fImagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); }

  onDropFile(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    this.fImageFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.fImagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.fImageFile.set(null);
    this.fImagePreview.set('');
    this.fProfileImageUrl.set('');
  }

  save(): void {
    if (!this.fName().trim())     { this.toast.warning('이름을 입력하세요.'); return; }
    if (!this.fPosition().trim()) { this.toast.warning('직함을 입력하세요.'); return; }

    const payload = {
      name: this.fName().trim(),
      nameEn: this.fNameEn().trim() || undefined,
      nameJa: this.fNameJa().trim() || undefined,
      position: this.fPosition().trim(),
      positionEn: this.fPositionEn().trim() || undefined,
      positionJa: this.fPositionJa().trim() || undefined,
      bio: this.fBio().trim() || undefined,
      bioEn: this.fBioEn().trim() || undefined,
      bioJa: this.fBioJa().trim() || undefined,
      sortOrder: this.fSortOrder(),
      profileImageUrl: this.fImagePreview() || this.fProfileImageUrl() || undefined,
    };

    this.saving.set(true);
    const editing = this.editingItem();
    const req = editing
      ? this.http.put(`http://localhost:3000/api/v1/company/team/${editing.id}`, payload)
      : this.http.post('http://localhost:3000/api/v1/company/team', payload);

    req.subscribe({
      next: () => {
        this.toast.success(this.editingItem() ? '수정되었습니다.' : '등록되었습니다.');
        this.closeForm(); this.loadData(); this.saving.set(false);
      },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
    });
  }

  onDelete(item: TeamMember): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget(); if (!t) return;
    this.deleting.set(true);
    this.http.delete(`http://localhost:3000/api/v1/company/team/${t.id}`).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleteTarget.set(null); this.deleting.set(false); this.loadData(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
