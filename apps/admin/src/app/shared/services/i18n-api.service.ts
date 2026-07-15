import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TranslationItem {
  id: number;
  key: string;
  ko: string;
  en: string | null;
  ja: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertTranslationPayload {
  key: string;
  ko: string;
  en?: string | null;
  ja?: string | null;
}

@Injectable({ providedIn: 'root' })
export class I18nApiService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/api/v1/i18n';

  getTranslations(): Observable<TranslationItem[]> {
    return this.http.get<TranslationItem[]>(`${this.base}/translations`);
  }

  upsertTranslation(payload: UpsertTranslationPayload): Observable<TranslationItem> {
    return this.http.put<TranslationItem>(`${this.base}/translations`, payload);
  }

  removeTranslation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/translations/${id}`);
  }

  bulkUploadTranslations(formData: FormData): Observable<{ count: number }> {
    return this.http.post<{ count: number }>(`${this.base}/translations/bulk`, formData);
  }
}
