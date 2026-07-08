import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContentApiService, TermsItem, UpsertTermsPayload } from '../../shared/services/content-api.service';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { RichEditorComponent } from '../../shared/components/rich-editor/rich-editor.component';

interface TabDef {
  id: string;
  label: string;
}

@Component({
  selector: 'admin-terms-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RichEditorComponent],
  templateUrl: './terms.page.html',
})
export class TermsPage implements OnInit {
  private api = inject(ContentApiService);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);

  readonly tabs: TabDef[] = [
    { id: 'SERVICE', label: '이용약관' },
    { id: 'PRIVACY', label: '개인정보처리방침' },
    { id: 'PRIVACY_INQUIRY', label: '개인정보처리방침(문의)' },
    { id: 'MARKETING', label: '마케팅정보 수신동의' },
  ];

  activeTab = signal<string>('SERVICE');
  termsData = signal<TermsItem[]>([]);
  loading = signal(false);
  saving = signal(false);

  // 현재 활성화된 탭의 내용
  currentContent = signal('');

  // 아코디언 열림 여부
  isEditorOpen = signal(true);

  activeTabLabel = computed(() => this.tabs.find(t => t.id === this.activeTab())?.label ?? '');

  ngOnInit(): void {
    this.loadData();
  }

  onExportExcel(): void {
    this.excel.export(this.termsData() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'type', header: '유형' },
      { key: 'title', header: '제목' },
      { key: 'updatedAt', header: '수정일' },
    ], '약관');
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getTerms().subscribe({
      next: (res) => {
        this.termsData.set(res);
        this.syncCurrentContent();
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('약관 데이터를 불러오지 못했습니다.');
        this.loading.set(false);
      }
    });
  }

  syncCurrentContent(): void {
    const item = this.termsData().find(t => t.type === this.activeTab());
    this.currentContent.set(item?.content ?? '');
  }

  setTab(tabId: string): void {
    this.activeTab.set(tabId);
    this.syncCurrentContent();
    this.isEditorOpen.set(true); // 탭 변경 시 에디터 열림 유지
  }

  toggleEditor(): void {
    this.isEditorOpen.set(!this.isEditorOpen());
  }

  save(): void {
    const payload: UpsertTermsPayload = {
      type: this.activeTab(),
      title: this.activeTabLabel(),
      content: this.currentContent(),
    };

    this.saving.set(true);
    this.api.upsertTerms(payload).subscribe({
      next: (res) => {
        this.toast.success('저장되었습니다.');
        // Update local state
        const currentData = [...this.termsData()];
        const idx = currentData.findIndex(t => t.type === res.type);
        if (idx !== -1) currentData[idx] = res;
        else currentData.push(res);
        this.termsData.set(currentData);
        
        this.saving.set(false);
      },
      error: () => {
        this.toast.error('저장에 실패했습니다.');
        this.saving.set(false);
      }
    });
  }
}
