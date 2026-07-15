import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../shared/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { forkJoin, catchError, of } from 'rxjs';

interface SeoConfig {
  pagePath: string;
  title: string;
  description: string;
  keywords: string;
}

interface CompanyInfo {
  key: string;
  value: string;
}

export interface PageSeoForm {
  key: string;
  label: string;
  path: string;
  title: string;
  desc: string;
  keywords: string;
}

@Component({
  selector: 'admin-seo-page',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './seo.page.html',
})
export class SeoPage implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  loading = signal(false);
  saving = signal(false);

  // 사이트 전체 SEO 기본값
  seoTitle    = signal('');
  seoDesc     = signal('');
  seoKeywords = signal('');

  // AEO/GEO
  aiTxt   = signal('');
  llmsTxt = signal('');

  // 페이지별 SEO — 배열로 관리해서 템플릿 바인딩 단순화
  pageForms = signal<PageSeoForm[]>([
    { key: 'about',     label: '회사소개',    path: '/about',     title: '', desc: '', keywords: '' },
    { key: 'careers',   label: '채용',        path: '/careers',   title: '', desc: '', keywords: '' },
    { key: 'blog',      label: '블로그',      path: '/blog',      title: '', desc: '', keywords: '' },
    { key: 'portfolio', label: '포트폴리오',  path: '/portfolio', title: '', desc: '', keywords: '' },
    { key: 'services',  label: '서비스 소개', path: '/services',  title: '', desc: '', keywords: '' },
    { key: 'status',    label: '작업현황',    path: '/status',    title: '', desc: '', keywords: '' },
    { key: 'faq',       label: 'FAQ',         path: '/faq',       title: '', desc: '', keywords: '' },
    { key: 'notice',    label: '공지사항',    path: '/notice',    title: '', desc: '', keywords: '' },
    { key: 'events',    label: '이벤트',      path: '/events',    title: '', desc: '', keywords: '' },
  ]);

  updatePageForm(key: string, field: 'title' | 'desc' | 'keywords', value: string): void {
    this.pageForms.update(forms =>
      forms.map(f => f.key === key ? { ...f, [field]: value } : f)
    );
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    forkJoin({
      seo:    this.http.get<SeoConfig[]>('http://localhost:3000/api/v1/i18n/seo').pipe(catchError(() => of([]))),
      aiInfo: this.http.get<CompanyInfo[]>('http://localhost:3000/api/v1/company/info').pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        // 전체 기본값
        const globalSeo = res.seo.find(s => s.pagePath === 'GLOBAL');
        if (globalSeo) {
          this.seoTitle.set(globalSeo.title ?? '');
          this.seoDesc.set(globalSeo.description ?? '');
          this.seoKeywords.set(globalSeo.keywords ?? '');
        }

        // 페이지별: API 결과로 각 form의 title/desc/keywords 채우기
        this.pageForms.update(forms =>
          forms.map(f => {
            const found = res.seo.find(s => s.pagePath === f.key.toUpperCase());
            return found
              ? { ...f, title: found.title ?? '', desc: found.description ?? '', keywords: found.keywords ?? '' }
              : f;
          })
        );

        // AEO/GEO
        const ai   = res.aiInfo.find(i => i.key === 'ai_txt');
        const llms = res.aiInfo.find(i => i.key === 'llms_txt');
        if (ai)   this.aiTxt.set(ai.value ?? '');
        if (llms) this.llmsTxt.set(llms.value ?? '');

        this.loading.set(false);
      },
      error: () => {
        this.toast.error('데이터를 불러오지 못했습니다.');
        this.loading.set(false);
      }
    });
  }

  save(): void {
    this.saving.set(true);

    const globalReq = this.http.put('http://localhost:3000/api/v1/i18n/seo', {
      pagePath:    'GLOBAL',
      title:       this.seoTitle(),
      description: this.seoDesc(),
      keywords:    this.seoKeywords(),
    });

    const pageReqs = this.pageForms().map(f =>
      this.http.put('http://localhost:3000/api/v1/i18n/seo', {
        pagePath:    f.key.toUpperCase(),
        title:       f.title,
        description: f.desc,
        keywords:    f.keywords,
      })
    );

    const aiReq   = this.http.put('http://localhost:3000/api/v1/company/info/ai_txt',   { value: this.aiTxt() });
    const llmsReq = this.http.put('http://localhost:3000/api/v1/company/info/llms_txt', { value: this.llmsTxt() });

    forkJoin([globalReq, ...pageReqs, aiReq, llmsReq]).subscribe({
      next: () => {
        this.toast.success('모든 변경사항이 저장되었습니다.');
        this.saving.set(false);
      },
      error: () => {
        this.toast.error('저장 중 오류가 발생했습니다.');
        this.saving.set(false);
      }
    });
  }
}
