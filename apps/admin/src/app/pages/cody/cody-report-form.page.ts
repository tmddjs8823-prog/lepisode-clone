import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { RichEditorComponent } from '../../shared/components/rich-editor/rich-editor.component';
import { CodyApiService } from '../../shared/services/cody-api.service';

@Component({
  selector: 'admin-cody-report-form-page',
  imports: [FormsModule, RichEditorComponent],
  templateUrl: './cody-report-form.page.html',
})
export class CodyReportFormPage implements OnInit {
  private router = inject(Router);
  private toast = inject(ToastService);
  private codyApi = inject(CodyApiService);

  // 아코디언 상태
  previewOpen = signal(true);
  formOpen = signal(true);

  // 폼 필드
  project = signal('');
  title = signal('');
  startDate = signal('');
  endDate = signal('');
  progress = signal('');
  issues = signal('');

  saving = signal(false);

  // 프로젝트 목록
  projectOptions = signal<{ id: number; name: string }[]>([]);

  ngOnInit(): void {
    this.codyApi.getProjectNames().subscribe({
      next: (list) => this.projectOptions.set(list),
      error: () => this.toast.error('프로젝트 목록을 불러오지 못했습니다.'),
    });
  }

  togglePreview(): void {
    this.previewOpen.update(v => !v);
  }

  toggleForm(): void {
    this.formOpen.update(v => !v);
  }

  goBack(): void {
    this.router.navigate(['/cody/reports']);
  }

  save(): void {
    if (!this.project()) {
      this.toast.warning('프로젝트를 선택하세요.');
      return;
    }
    if (!this.title().trim()) {
      this.toast.warning('보고서 제목을 입력하세요.');
      return;
    }
    if (!this.startDate() || !this.endDate()) {
      this.toast.warning('보고서 진행기간을 선택하세요.');
      return;
    }

    this.saving.set(true);
    // TODO: API 연동
    setTimeout(() => {
      this.toast.success('주간보고서가 저장되었습니다.');
      this.saving.set(false);
      this.goBack();
    }, 800);
  }
}
