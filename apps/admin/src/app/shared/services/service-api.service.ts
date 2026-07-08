import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000/api/v1';

export type ServiceItem = {
  id: number;
  title: string;
  titleEn: string | null;
  titleJa: string | null;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  content: string | null;
  icon: string | null;
  thumbnailUrl: string | null;
  sortOrder: number;
  published: boolean;
  createdAt: string;
};

export interface CreateServicePayload {
  title: string;
  titleEn?: string;
  titleJa?: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  content?: string;
  icon?: string;
  thumbnailUrl?: string;
  sortOrder?: number;
  published?: boolean;
}

export type UpdateServicePayload = Partial<CreateServicePayload>;

@Injectable({ providedIn: 'root' })
export class ServiceApiService {
  private http = inject(HttpClient);

  getList(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(`${API}/services/admin/list`);
  }

  getOne(id: number): Observable<ServiceItem> {
    return this.http.get<ServiceItem>(`${API}/services/${id}`);
  }

  create(payload: CreateServicePayload): Observable<ServiceItem> {
    return this.http.post<ServiceItem>(`${API}/services`, payload);
  }

  update(id: number, payload: UpdateServicePayload): Observable<ServiceItem> {
    return this.http.put<ServiceItem>(`${API}/services/${id}`, payload);
  }

  remove(id: number): Observable<ServiceItem> {
    return this.http.delete<ServiceItem>(`${API}/services/${id}`);
  }
}
