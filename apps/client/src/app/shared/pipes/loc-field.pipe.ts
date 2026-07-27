import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../services/i18n.service';

/**
 * DB에서 불러온 동적 데이터의 다국어 필드를 현재 언어에 맞게 선택하는 파이프
 *
 * 사용법: {{ item | locField:'title' }}
 * - 한국어 → item.title
 * - 영어   → item.titleEn ?? item.title
 * - 일본어 → item.titleJa ?? item.title
 */
@Pipe({ name: 'locField', standalone: true, pure: false })
export class LocFieldPipe implements PipeTransform {
  private i18n = inject(I18nService);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(item: any, field: string): string {
    if (!item) return '';
    const lang = this.i18n.currentLang();

    if (lang === 'en') {
      const enKey = field + 'En';
      return item[enKey] || item[field] || '';
    }
    if (lang === 'ja') {
      const jaKey = field + 'Ja';
      return item[jaKey] || item[field] || '';
    }
    return item[field] || '';
  }
}
