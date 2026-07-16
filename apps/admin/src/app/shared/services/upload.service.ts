import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000/api/v1/upload';

/** accept 속성에 사용할 문서 확장자 */
export const DOCUMENT_ACCEPT = '.pdf,.ppt,.pptx,.hwp,.doc,.docx,.xls,.xlsx';
/** accept 속성에 사용할 이미지+문서 확장자 */
export const IMAGE_AND_DOCUMENT_ACCEPT = 'image/*,.pdf,.ppt,.pptx,.hwp,.doc,.docx,.xls,.xlsx';

/** 파일이 이미지인지 여부 */
export function isImageFile(file: File | string): boolean {
  if (typeof file === 'string') {
    return /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(file);
  }
  return file.type.startsWith('image/');
}

/** 파일명에서 확장자 추출 (예: '.pdf') */
export function getFileExtLabel(nameOrUrl: string): string {
  const ext = nameOrUrl.split('.').pop()?.toUpperCase() ?? '';
  return ext;
}

export interface UploadResult {
  url: string;
  path: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);

  /**
   * 이미지 파일을 Supabase Storage에 업로드합니다.
   * @param file - 업로드할 File 객체
   * @param folder - 저장 폴더 (예: 'blog', 'portfolio', 'events')
   * @returns Observable<UploadResult> - { url, path }
   */
  upload(file: File, folder = 'general'): Observable<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResult>(`${API}?folder=${encodeURIComponent(folder)}`, formData);
  }

  /**
   * Supabase Storage에서 파일을 삭제합니다.
   * @param filePath - 저장 경로 (예: 'blog/uuid.png')
   */
  remove(filePath: string): Observable<void> {
    return this.http.delete<void>(`${API}?path=${encodeURIComponent(filePath)}`);
  }

  /**
   * input[type=file] change 이벤트에서 File 객체를 추출합니다.
   */
  extractFile(event: Event): File | null {
    return (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  /**
   * File 객체를 DataURL로 변환합니다 (미리보기용).
   */
  toPreviewUrl(file: File): Observable<string> {
    return new Observable<string>(subscriber => {
      const reader = new FileReader();
      reader.onload = () => {
        subscriber.next(reader.result as string);
        subscriber.complete();
      };
      reader.onerror = () => subscriber.error(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
