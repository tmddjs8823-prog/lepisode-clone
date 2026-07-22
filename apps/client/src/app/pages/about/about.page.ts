import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-about-page',
  standalone: true,
  templateUrl: './about.page.html',
})
export class AboutPage {
  private sanitizer = inject(DomSanitizer);

  /** 유튜브 영상 ID — 여기만 바꾸면 됩니다 */
  private readonly youtubeVideoId = 'otnzfiIn_U8';

  youtubeEmbedUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    `https://www.youtube.com/embed/${this.youtubeVideoId}?rel=0&modestbranding=1&amp;enablejsapi=1&amp;origin=https://homepage-dev.lepisode.team`
  );
}
