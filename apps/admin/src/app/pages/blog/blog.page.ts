import { Component, OnInit, signal, inject, computed, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../shared/services/toast.service';
import { ExcelExportService } from '../../shared/services/excel-export.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ColumnDef } from '../../shared/types/api.types';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

export interface BlogPost {
  id: number;
  title: string;
  titleEn?: string;
  titleJa?: string;
  slug: string;
  content: string;
  contentEn?: string;
  contentJa?: string;
  description?: string;
  category: string | null;
  subCategory?: string | null;
  author?: string | null;
  tags?: string[];
  thumbnailUrl: string | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
}

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'admin-blog-page',
  imports: [FormsModule, ConfirmDialogComponent, DataTableComponent, PageHeaderComponent],
  templateUrl: './blog.page.html',
})
export class BlogPage implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private excel = inject(ExcelExportService);
  private sanitizer = inject(DomSanitizer);

  data = signal<BlogPost[]>([]);
  searchTerm = signal('');
  loading = signal(false);

  readonly columns: ColumnDef<Record<string, unknown>>[] = [
    { key: 'id', label: '순번', align: 'center', width: '5%' },
    { key: 'title', label: '제목', align: 'center', width: '15%' },
    { key: 'category', label: '카테고리', align: 'center', width: '10%' },
    { key: 'subCategory', label: '서브 카테고리', align: 'center', width: '12%' },
    { key: 'author', label: '작성자', align: 'center', width: '8%' },
    { key: 'thumbnailUrl', label: '썸네일', align: 'center', width: '12%', type: 'image' },
    { key: 'publishedAt', label: '발행일', align: 'center', width: '10%', type: 'date' },
    { key: 'createdAt', label: '생성일', align: 'center', width: '10%', type: 'date' },
  ];

  /* ── 삭제 ── */
  deleteTarget = signal<BlogPost | null>(null);
  deleting = signal(false);

  /* ── 폼 ── */
  showForm = signal(false);
  editingItem = signal<BlogPost | null>(null);
  saving = signal(false);

  fTitle = signal('');
  fDescription = signal('');
  fContent = signal('');
  fCategory = signal('');
  fSubCategory = signal('');
  fAuthor = signal('');
  fPublished = signal(true);
  fPublishedAt = signal('');
  fThumbnailFile = signal<File | null>(null);
  fThumbnailPreview = signal('');

  formTitle = computed(() => this.editingItem() ? '기술 블로그 수정' : '기술 블로그 등록');

  /* ── 마크다운 에디터 ── */
  editorMode = signal<'write' | 'preview'>('write');
  previewHtml = signal<SafeHtml>('');

  @ViewChild('editorTextarea') editorTextarea!: ElementRef<HTMLTextAreaElement>;

  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.data();
    return this.data().filter(item =>
      Object.values(item).some(v => v != null && String(v).toLowerCase().includes(term))
    );
  });
  ngOnInit(): void { this.loadData(); }

  onSearch(term?: string): void { this.searchTerm.set(typeof term === 'string' ? term : ''); }

  onExportExcel(): void {
    this.excel.export(this.data() as unknown as Record<string, unknown>[], [
      { key: 'id', header: 'ID' },
      { key: 'title', header: '제목' },
      { key: 'category', header: '카테고리' },
      { key: 'author', header: '작성자' },
      { key: 'published', header: '공개여부' },
      { key: 'createdAt', header: '등록일' },
    ], '블로그');
  }

  loadData(): void {
    this.loading.set(true);
    this.http.get<{ data: BlogPost[]; total: number }>(`${API}/blog/admin/list`).subscribe({
      next: (res) => { this.data.set(res.data); this.loading.set(false); },
      error: () => { this.toast.error('목록을 불러오지 못했습니다.'); this.loading.set(false); },
    });
  }

  /* ── 폼 열기/닫기 ── */
  openForm(item?: BlogPost): void {
    if (item) {
      this.editingItem.set(item);
      this.fTitle.set(item.title);
      this.fDescription.set(item.description ?? '');
      this.fContent.set(item.content ?? '');
      this.fCategory.set(item.category ?? '');
      this.fSubCategory.set(item.subCategory ?? '');
      this.fAuthor.set(item.author ?? '');
      this.fPublished.set(item.published);
      this.fPublishedAt.set(item.publishedAt?.slice(0, 10) ?? '');
      this.fThumbnailPreview.set(item.thumbnailUrl ?? '');
      this.fThumbnailFile.set(null);
    } else {
      this.editingItem.set(null);
      this.fTitle.set('');
      this.fDescription.set('');
      this.fContent.set('');
      this.fCategory.set('');
      this.fSubCategory.set('');
      this.fAuthor.set('');
      this.fPublished.set(true);
      this.fPublishedAt.set(new Date().toISOString().slice(0, 10));
      this.fThumbnailPreview.set('');
      this.fThumbnailFile.set(null);
    }
    this.editorMode.set('write');
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); }

  /* ── 썸네일 업로드 ── */
  onFileSelect(ev: Event): void {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.fThumbnailFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.fThumbnailPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onDragOver(ev: DragEvent): void { ev.preventDefault(); }
  onDropFile(ev: DragEvent): void {
    ev.preventDefault();
    const file = ev.dataTransfer?.files[0];
    if (!file?.type.startsWith('image/')) return;
    this.fThumbnailFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.fThumbnailPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.fThumbnailFile.set(null);
    this.fThumbnailPreview.set('');
  }

  /* ── 마크다운 에디터 툴바 ── */
  insertMarkdown(type: string): void {
    const ta = this.editorTextarea?.nativeElement;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = this.fContent();
    const selected = text.substring(start, end);

    let before = '', after = '', insert = '';
    switch (type) {
      case 'heading':   before = '## '; insert = selected || '제목'; break;
      case 'bold':      before = '**'; after = '**'; insert = selected || '굵은 텍스트'; break;
      case 'italic':    before = '*'; after = '*'; insert = selected || '기울임'; break;
      case 'strike':    before = '~~'; after = '~~'; insert = selected || '취소선'; break;
      case 'image':     before = '!['; after = '](url)'; insert = selected || '이미지 설명'; break;
      case 'table':
        insert = '\n| 헤더1 | 헤더2 | 헤더3 |\n|-------|-------|-------|\n| 셀1   | 셀2   | 셀3   |\n';
        break;
      case 'link':      before = '['; after = '](url)'; insert = selected || '링크 텍스트'; break;
      case 'code':      before = '`'; after = '`'; insert = selected || '코드'; break;
      case 'codeblock':
        before = '\n```\n'; after = '\n```\n'; insert = selected || '코드 블록'; break;
    }

    const newText = text.substring(0, start) + before + insert + after + text.substring(end);
    this.fContent.set(newText);

    setTimeout(() => {
      ta.focus();
      const cursorPos = start + before.length + insert.length;
      ta.setSelectionRange(cursorPos, cursorPos);
    });
  }

  switchEditorMode(mode: 'write' | 'preview'): void {
    this.editorMode.set(mode);
    if (mode === 'preview') {
      this.previewHtml.set(this.sanitizer.bypassSecurityTrustHtml(this.renderMarkdown(this.fContent())));
    }
  }

  private renderMarkdown(md: string): string {
    return marked.parse(md, { async: false }) as string;
  }

  /* ── 저장 ── */
  save(): void {
    if (!this.fTitle().trim()) { this.toast.warning('제목을 입력하세요.'); return; }
    if (!this.fContent().trim()) { this.toast.warning('본문을 입력하세요.'); return; }
    if (!this.fAuthor().trim()) { this.toast.warning('작성자를 입력하세요.'); return; }

    const publishedAt = this.fPublishedAt();
    const payload: Record<string, unknown> = {
      title: this.fTitle().trim(),
      content: this.fContent().trim(),
      category: this.fCategory().trim() || undefined,
      subCategory: this.fSubCategory().trim() || undefined,
      author: this.fAuthor().trim(),
      published: this.fPublished(),
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      thumbnailUrl: this.fThumbnailPreview() || undefined,
    };

    this.saving.set(true);
    const editing = this.editingItem();
    const req = editing
      ? this.http.patch(`${API}/blog/${editing.id}`, payload)
      : this.http.post(`${API}/blog`, payload);

    req.subscribe({
      next: () => {
        this.toast.success(this.editingItem() ? '수정되었습니다.' : '등록되었습니다.');
        this.closeForm();
        this.saving.set(false);
        this.loadData();
      },
      error: () => { this.toast.error('저장에 실패했습니다.'); this.saving.set(false); },
    });
  }

  /* ── 삭제 ── */
  onDelete(item: BlogPost): void { this.deleteTarget.set(item); }
  confirmDelete(): void {
    const t = this.deleteTarget(); if (!t) return;
    this.deleting.set(true);
    this.http.delete(`${API}/blog/${t.id}`).subscribe({
      next: () => { this.toast.success('삭제되었습니다.'); this.deleteTarget.set(null); this.deleting.set(false); this.loadData(); },
      error: () => { this.toast.error('삭제에 실패했습니다.'); this.deleting.set(false); },
    });
  }
  cancelDelete(): void { this.deleteTarget.set(null); }
}
