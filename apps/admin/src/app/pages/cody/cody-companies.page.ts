import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ColumnDef } from '../../shared/types/api.types';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CodyApiService, CodyCompanyApiItem } from '../../shared/services/cody-api.service';
import { UploadService, IMAGE_AND_DOCUMENT_ACCEPT, isImageFile } from '../../shared/services/upload.service';

export interface CodyCompanyItem {
  id: number;
  companyName: string;
  bizNumber: string;
  ceoName: string;
  ceoPhone: string;
  address: string;
  email: string;
  memo: string;
  createdAt: string;
}

@Component({
  selector: 'admin-cody-companies-page',
  imports: [FormsModule, PageHeaderComponent, ConfirmDialogComponent, DataTableComponent],
  templateUrl: './cody-companies.page.html',
})
export class CodyCompaniesPage implements OnInit {
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);
  private codyApi = inject(CodyApiService);
  private upload = inject(UploadService);

  readonly fileAccept = IMAGE_AND_DOCUMENT_ACCEPT;
  isImage = isImageFile;

  data = signal<CodyCompanyItem[]>([]);
  searchTerm = signal('');
  total = signal(0);
  page = signal(1);
  limit = signal(10);
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id', label: '순번', align: 'center', width: '8%' },
    { key: 'companyName', label: '기업명', align: 'center', width: '25%' },
    { key: 'bizNumber', label: '사업자등록번호', align: 'center', width: '20%' },
    { key: 'ceoName', label: '대표자명', align: 'center', width: '15%' },
    { key: 'ceoPhone', label: '대표 연락처', align: 'center', width: '17%' },
    { key: 'createdAt', label: '등록일자', align: 'center', width: '15%', type: 'date' },
  ];

  /* ── 폼 ── */
  showForm = signal(false);
  editingItem = signal<CodyCompanyItem | null>(null);
  saving = signal(false);
  formTitle = computed(() => this.editingItem() ? '기업 수정' : '기업 등록');

  fCompanyName  = signal('');
  fBizNumber    = signal('');
  fCeoName      = signal('');
  fCeoPhone     = signal('');
  fCompanyPhone = signal('');
  fCompanyEmail = signal('');
  fAddress      = signal('');
  fAddressDetail = signal('');
  fHomepage     = signal('');
  fBizFileUrl   = signal('');
  fBizFileName  = signal('');
  fEmail        = signal('');
  fMemo         = signal('');

  /* ── 삭제 ── */
  deleteTarget = signal<CodyCompanyItem | null>(null);
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
      { key: 'companyName', header: '기업명' },
      { key: 'bizNumber', header: '사업자등록번호' },
      { key: 'ceoName', header: '대표자명' },
      { key: 'ceoPhone', header: '대표 연락처' },
      { key: 'createdAt', header: '등록일' },
    ], '기업관리');
  }

  /** API에서 기업 목록을 가져옴 */
  loadData(): void {
    this.loading.set(true);
    this.codyApi.getCompanies(this.page(), this.limit()).subscribe({
      next: (res) => {
        this.data.set(res.data.map(this.mapApiToItem));
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('기업 목록을 불러오지 못했습니다.');
        this.loading.set(false);
      },
    });
  }

  /** API 응답 → 프론트 인터페이스 매핑 */
  private mapApiToItem(c: CodyCompanyApiItem): CodyCompanyItem {
    return {
      id: c.id,
      companyName: c.name,
      bizNumber: c.businessNumber ?? '',
      ceoName: c.ceoName ?? '',
      ceoPhone: c.ceoPhone ?? '',
      address: c.address ?? '',
      email: c.email ?? '',
      memo: c.memo ?? '',
      createdAt: c.createdAt,
    };
  }

  onPageChange(p: number): void {
    this.page.set(p);
    this.loadData();
  }

  /* ── 등록/수정 ── */
  openForm(item?: CodyCompanyItem): void {
    this.editingItem.set(item ?? null);
    const r = (item as unknown as Record<string, string>) ?? {};
    this.fCompanyName.set(item?.companyName ?? '');
    this.fBizNumber.set(item?.bizNumber ?? '');
    this.fCeoName.set(item?.ceoName ?? '');
    this.fCeoPhone.set(item?.ceoPhone ?? '');
    this.fCompanyPhone.set(r['companyPhone'] ?? '');
    this.fCompanyEmail.set(r['companyEmail'] ?? '');
    this.fAddress.set(item?.address ?? '');
    this.fAddressDetail.set(r['addressDetail'] ?? '');
    this.fHomepage.set(r['homepage'] ?? '');
    this.fBizFileUrl.set(r['bizFileUrl'] ?? '');
    this.fBizFileName.set('');
    this.fEmail.set(item?.email ?? '');
    this.fMemo.set(item?.memo ?? '');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingItem.set(null);
    this.fCompanyName.set('');
    this.fBizNumber.set('');
    this.fCeoName.set('');
    this.fCeoPhone.set('');
    this.fCompanyPhone.set('');
    this.fCompanyEmail.set('');
    this.fAddress.set('');
    this.fAddressDetail.set('');
    this.fHomepage.set('');
    this.fBizFileUrl.set('');
    this.fBizFileName.set('');
    this.fEmail.set('');
    this.fMemo.set('');
  }

  /** Daum 우편번호 팝업으로 주소 검색 */
  openPostcode(): void {
    const daum = (window as unknown as Record<string, unknown>)['daum'] as
      | { Postcode: new (opts: { oncomplete: (data: Record<string, string>) => void }) => { open(): void } }
      | undefined;
    if (!daum) { alert('주소 검색 서비스를 불러오지 못했습니다.'); return; }
    new daum.Postcode({
      oncomplete: (data) => {
        this.fAddress.set(data['address'] ?? '');
        this.fAddressDetail.set('');
      },
    }).open();
  }

  /** 사업자등록증 파일 업로드 */
  onBizFileChange(event: Event): void {
    const file = this.upload.extractFile(event);
    if (!file) return;
    this.fBizFileName.set(file.name);
    this.upload.upload(file, 'cody/biz').subscribe({
      next: (res) => {
        this.fBizFileUrl.set(res.url);
        this.toast.success('파일이 업로드되었습니다.');
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || '알 수 없는 오류';
        console.error('파일 업로드 오류:', err);
        this.toast.error(`파일 업로드 실패: ${msg}`);
      },
    });
  }

  save(): void {
    if (!this.fCompanyName().trim()) { this.toast.warning('기업명을 입력하세요.'); return; }

    this.saving.set(true);
    const payload = {
      name: this.fCompanyName().trim(),
      businessNumber: this.fBizNumber().trim() || undefined,
      ceoName: this.fCeoName().trim() || undefined,
      ceoPhone: this.fCeoPhone().trim() || undefined,
      address: this.fAddress().trim() || undefined,
      email: this.fEmail().trim() || undefined,
      memo: this.fMemo().trim() || undefined,
    };

    const editing = this.editingItem();
    if (editing) {
      this.codyApi.updateCompany(editing.id, payload).subscribe({
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
      this.codyApi.createCompany(payload).subscribe({
        next: () => {
          this.toast.success('등록되었습니다.');
          this.saving.set(false);
          this.closeForm();
          this.loadData();
        },
        error: () => {
          this.toast.error('등록에 실패했습니다.');
          this.saving.set(false);
        },
      });
    }
  }

  /* ── 삭제 ── */
  onDelete(item: CodyCompanyItem): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget();
    if (!t) return;
    this.deleting.set(true);
    this.codyApi.removeCompany(t.id).subscribe({
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
