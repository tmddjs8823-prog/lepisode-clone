import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000/api/v1';

export interface PortfolioItem {
  id: number;
  title: string;
  titleEn: string | null;
  titleJa: string | null;
  client: string | null;
  category: string;
  period: string | null;
  techStack: string[];
  keywords: string | null;
  thumbnailUrl: string | null;
  images: string[];
  description: string | null;
  descriptionEn: string | null;
  descriptionJa: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePortfolioPayload {
  title: string;
  titleEn?: string;
  titleJa?: string;
  client?: string;
  category: string;
  period?: string;
  techStack?: string[];
  keywords?: string;
  thumbnailUrl?: string;
  images?: string[];
  description?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  published?: boolean;
  sortOrder?: number;
}

export type UpdatePortfolioPayload = Partial<CreatePortfolioPayload>;

@Injectable({ providedIn: 'root' })
export class PortfolioApiService {
  private http = inject(HttpClient);

  getList(params: { page?: number; limit?: number; category?: string } = {}): Observable<{ data: PortfolioItem[]; total: number; page: number; limit: number; totalPages: number }> {
    return this.http.get<{ data: PortfolioItem[]; total: number; page: number; limit: number; totalPages: number }>(`${API}/portfolio/admin/list`, { params: params as Record<string, string | number | boolean> });
  }

  getOne(id: number): Observable<PortfolioItem> {
    return this.http.get<PortfolioItem>(`${API}/portfolio/${id}`);
  }

  create(payload: CreatePortfolioPayload): Observable<PortfolioItem> {
    return this.http.post<PortfolioItem>(`${API}/portfolio`, payload);
  }

  update(id: number, payload: UpdatePortfolioPayload): Observable<PortfolioItem> {
    return this.http.put<PortfolioItem>(`${API}/portfolio/${id}`, payload);
  }

  remove(id: number): Observable<PortfolioItem> {
    return this.http.delete<PortfolioItem>(`${API}/portfolio/${id}`);
  }
}
