import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResponse } from '../types/api.types';

const API = 'http://localhost:3000/api/v1';

/** 공지사항 레코드 타입 (Prisma Notice에서 필요한 필드만 Pick) */
export type NoticeItem = Pick<
  {
    id: number;
    title: string;
    titleEn: string | null;
    titleJa: string | null;
    content: string;
    contentEn: string | null;
    contentJa: string | null;
    thumbnailUrl: string | null;
    published: boolean;
    isPinned: boolean;
    seoTitle: string | null;
    metaDescription: string | null;
    createdAt: string;
    updatedAt: string;
  },
  | 'id'
  | 'title'
  | 'titleEn'
  | 'titleJa'
  | 'content'
  | 'contentEn'
  | 'contentJa'
  | 'thumbnailUrl'
  | 'published'
  | 'isPinned'
  | 'seoTitle'
  | 'metaDescription'
  | 'createdAt'
  | 'updatedAt'
>;

export interface CreateNoticePayload {
  title: string;
  titleEn?: string;
  titleJa?: string;
  content: string;
  contentEn?: string;
  contentJa?: string;
  thumbnailUrl?: string;
  published?: boolean;
  isPinned?: boolean;
  createdAt?: string;
}

export type UpdateNoticePayload = Partial<CreateNoticePayload>;

@Injectable({ providedIn: 'root' })
export class NoticeApiService {
  private http = inject(HttpClient);

  getList(page = 1, limit = 10): Observable<PagedResponse<NoticeItem>> {
    return this.http.get<PagedResponse<NoticeItem>>(`${API}/notices/admin/list`, {
      params: { page, limit },
    });
  }

  getOne(id: number): Observable<NoticeItem> {
    return this.http.get<NoticeItem>(`${API}/notices/${id}`);
  }

  create(payload: CreateNoticePayload): Observable<NoticeItem> {
    return this.http.post<NoticeItem>(`${API}/notices`, payload);
  }

  update(id: number, payload: UpdateNoticePayload): Observable<NoticeItem> {
    return this.http.put<NoticeItem>(`${API}/notices/${id}`, payload);
  }

  remove(id: number): Observable<NoticeItem> {
    return this.http.delete<NoticeItem>(`${API}/notices/${id}`);
  }
}
