import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/services/toast.service';
import { CodyApiService, CodyReportApiItem } from '../../shared/services/cody-api.service';
import { RichEditorComponent } from '../../shared/components/rich-editor/rich-editor.component';

@Component({
  selector: 'admin-cody-report-detail-page',
  imports: [FormsModule, RichEditorComponent],
  templateUrl: './cody-report-detail.page.html',
})
export class CodyReportDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private codyApi = inject(CodyApiService);

  isNew = signal(true);
  reportId = signal<number | null>(null);
  saving = signal(false);
  loading = signal(false);

  /* 아코디언 */
  previewOpen = signal(false);
  formOpen = signal(true);

  /* 프로젝트 드롭다운 */
  projectOptions = signal<{ id: number; name: string; companyId: number }[]>([]);

  /* 폼 필드 */
  fProjectId = signal<number | null>(null);
  fTitle = signal('');
  fPeriodStart = signal('');
  fPeriodEnd = signal('');
  fContent = signal('');
  fIssues = signal('');

  ngOnInit(): void {
    this.loadProjectOptions();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isNew.set(false);
      this.reportId.set(+id);
      this.loadReport(+id);
    }
  }

  private loadProjectOptions(): void {
    this.codyApi.getProjectNames().subscribe({
      next: (list) => this.projectOptions.set(list),
      error: () => this.toast.error('프로젝트 목록을 불러오지 못했습니다.'),
    });
  }

  private loadReport(id: number): void {
    this.loading.set(true);
    this.codyApi.getReport(id).subscribe({
      next: (r: CodyReportApiItem) => {
        this.fProjectId.set(r.projectId);
        this.fTitle.set(r.title);
        this.fPeriodStart.set(r.periodStart ? r.periodStart.substring(0, 10) : '');
        this.fPeriodEnd.set(r.periodEnd ? r.periodEnd.substring(0, 10) : '');
        // content는 JSON으로 진행사항/이슈사항을 저장
        try {
          const parsed = JSON.parse(r.content || '{}');
          this.fContent.set(parsed.progress || '');
          this.fIssues.set(parsed.issues || '');
        } catch {
          this.fContent.set(r.content || '');
          this.fIssues.set('');
        }
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('보고서를 불러오지 못했습니다.');
        this.loading.set(false);
      },
    });
  }

  togglePreview(): void { this.previewOpen.update(v => !v); }
  toggleForm(): void { this.formOpen.update(v => !v); }

  goBack(): void {
    this.router.navigate(['/cody/reports']);
  }

  save(): void {
    if (!this.fProjectId()) { this.toast.warning('프로젝트를 선택하세요.'); return; }
    if (!this.fTitle().trim()) { this.toast.warning('보고서 제목을 입력하세요.'); return; }
    if (!this.fPeriodStart() || !this.fPeriodEnd()) { this.toast.warning('보고서 진행기간을 입력하세요.'); return; }

    this.saving.set(true);
    const project = this.projectOptions().find(p => p.id === this.fProjectId());

    const payload = {
      companyId: project?.companyId ?? 0,
      projectId: this.fProjectId()!,
      title: this.fTitle().trim(),
      periodStart: this.fPeriodStart(),
      periodEnd: this.fPeriodEnd(),
      content: JSON.stringify({ progress: this.fContent(), issues: this.fIssues() }),
    };

    const obs = this.isNew()
      ? this.codyApi.createReport(payload)
      : this.codyApi.updateReport(this.reportId()!, payload);

    obs.subscribe({
      next: () => {
        this.toast.success(this.isNew() ? '등록되었습니다.' : '수정되었습니다.');
        this.saving.set(false);
        this.router.navigate(['/cody/reports']);
      },
      error: () => {
        this.toast.error(this.isNew() ? '등록에 실패했습니다.' : '수정에 실패했습니다.');
        this.saving.set(false);
      },
    });
  }
}
