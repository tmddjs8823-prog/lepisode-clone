import { Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';
import { ClientApiService, TeamMember } from '../../shared/services/client-api.service';
import { RichTextPipe } from '../../shared/pipes/rich-text.pipe';
import { I18nService } from '../../shared/services/i18n.service';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [TranslatePipe, RichTextPipe],
  templateUrl: './about.page.html',
})
export class AboutPage {
  private sanitizer = inject(DomSanitizer);
  private api = inject(ClientApiService);
  private i18n = inject(I18nService);

  /** 유튜브 영상 ID — 여기만 바꾸면 됩니다 */
  private readonly youtubeVideoId = 'otnzfiIn_U8';

  youtubeEmbedUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    `https://www.youtube.com/embed/${this.youtubeVideoId}?rel=0&modestbranding=1&amp;enablejsapi=1&amp;origin=https://homepage-dev.lepisode.team`
  );

  teamMembers = signal<TeamMember[]>([]);

  constructor() {
    this.api.getTeamMembers().subscribe({
      next: (members) => this.teamMembers.set(members),
      error: () => this.teamMembers.set([]),
    });
  }

  /** 다국어 필드 조회 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loc(item: any, field: string): string {
    if (!item) return '';
    const lang = this.i18n.currentLang();
    if (lang === 'en') return String(item[field + 'En'] || item[field] || '');
    if (lang === 'ja') return String(item[field + 'Ja'] || item[field] || '');
    return String(item[field] || '');
  }

  /** 이름에서 성(姓)만 추출 — 프로필 이미지 없을 때 이니셜 표시용 */
  getInitials(name: string): string {
    return name.length >= 2 ? name.slice(0, 2) : name;
  }

  /** 이름 마스킹 — 성만 표시하고 나머지 * (양주성 → 양**) */
  maskName(name: string): string {
    if (name.length <= 1) return name;
    return name[0] + '*'.repeat(name.length - 1);
  }
}
