import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * 동적 컨텐츠(DB에서 불러온 데이터)의 다국어 필드를 현재 언어에 맞게 선택합니다.
 *
 * 예: localized(post, 'title') → 일본어이면 post.titleJa ?? post.title 반환
 */
export function localizedField(item: any, field: string, lang: string): string {
  if (!item) return '';
  if (lang === 'en') {
    const enField = field + 'En';
    return item[enField] || item[field] || '';
  }
  if (lang === 'ja') {
    const jaField = field + 'Ja';
    return item[jaField] || item[field] || '';
  }
  return item[field] || '';
}
