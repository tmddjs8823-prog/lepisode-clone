import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000/api/v1';

export type FaqCategoryItem = {
  id: number;
  name: string;
  nameEn: string | null;
  nameJa: string | null;
  sortOrder: number;
  createdAt: string;
};

export type FaqItem = {
  id: number;
  categoryId: number;
  category: Pick<FaqCategoryItem, 'id' | 'name'>;
  question: string;
  questionEn: string | null;
  questionJa: string | null;
  answer: string;
  answerEn: string | null;
  answerJa: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
};

export interface CreateFaqCategoryPayload {
  name: string;
  nameEn?: string;
  nameJa?: string;
  sortOrder?: number;
}

export type UpdateFaqCategoryPayload = Partial<CreateFaqCategoryPayload>;

export interface CreateFaqPayload {
  categoryId: number;
  question: string;
  questionEn?: string;
  questionJa?: string;
  answer: string;
  answerEn?: string;
  answerJa?: string;
  published?: boolean;
  sortOrder?: number;
}

export type UpdateFaqPayload = Partial<CreateFaqPayload>;

@Injectable({ providedIn: 'root' })
export class FaqApiService {
  private http = inject(HttpClient);

  // 카테고리
  getCategories(): Observable<FaqCategoryItem[]> {
    return this.http.get<FaqCategoryItem[]>(`${API}/faq/categories`);
  }

  createCategory(payload: CreateFaqCategoryPayload): Observable<FaqCategoryItem> {
    return this.http.post<FaqCategoryItem>(`${API}/faq/categories`, payload);
  }

  updateCategory(id: number, payload: UpdateFaqCategoryPayload): Observable<FaqCategoryItem> {
    return this.http.put<FaqCategoryItem>(`${API}/faq/categories/${id}`, payload);
  }

  removeCategory(id: number): Observable<FaqCategoryItem> {
    return this.http.delete<FaqCategoryItem>(`${API}/faq/categories/${id}`);
  }

  // FAQ 항목
  getList(categoryId?: number): Observable<FaqItem[]> {
    const params: Record<string, string> = {};
    if (categoryId !== undefined) params['categoryId'] = String(categoryId);
    return this.http.get<FaqItem[]>(`${API}/faq/admin/list`, { params });
  }

  getOne(id: number): Observable<FaqItem> {
    return this.http.get<FaqItem>(`${API}/faq/${id}`);
  }

  create(payload: CreateFaqPayload): Observable<FaqItem> {
    return this.http.post<FaqItem>(`${API}/faq`, payload);
  }

  update(id: number, payload: UpdateFaqPayload): Observable<FaqItem> {
    return this.http.put<FaqItem>(`${API}/faq/${id}`, payload);
  }

  remove(id: number): Observable<FaqItem> {
    return this.http.delete<FaqItem>(`${API}/faq/${id}`);
  }
}
