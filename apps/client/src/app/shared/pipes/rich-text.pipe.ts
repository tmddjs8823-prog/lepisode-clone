import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * 순수 텍스트를 HTML로 변환하는 파이프
 * - 줄바꿈(\n) → <br>
 * - 이미 <br>이 있으면 이중 변환 방지
 *
 * 사용: [innerHTML]="'key' | translate | richText"
 */
@Pipe({ name: 'richText', standalone: true })
export class RichTextPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';
    // 이미 <br> 태그가 있으면 그대로 반환
    if (value.includes('<br')) {
      return this.sanitizer.bypassSecurityTrustHtml(value);
    }
    // \n → <br>
    const html = value.replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
