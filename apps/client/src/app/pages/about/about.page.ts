import { Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';
import { ClientApiService, TeamMember } from '../../shared/services/client-api.service';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './about.page.html',
})
export class AboutPage {
  private sanitizer = inject(DomSanitizer);
  private api = inject(ClientApiService);

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

  /** 이름에서 성(姓)만 추출 — 프로필 이미지 없을 때 이니셜 표시용 */
  getInitials(name: string): string {
    return name.length >= 2 ? name.slice(0, 2) : name;
  }
}
