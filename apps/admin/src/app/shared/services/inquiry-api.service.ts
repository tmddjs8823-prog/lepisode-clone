import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResponse } from '../types/api.types';

const API = 'http://localhost:3000/api/v1';

export type InquiryStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type InquiryItem = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  budget: string | null;
  projectType: string | null;
  content: string;
  status: InquiryStatus;
  isRead: boolean;
  adminMemo: string | null;
  createdAt: string;
};

export interface UpdateInquiryStatusPayload {
  status: InquiryStatus;
  adminMemo?: string;
}

@Injectable({ providedIn: 'root' })
export class InquiryApiService {
  private http = inject(HttpClient);

  getList(page = 1, limit = 10, status?: InquiryStatus): Observable<PagedResponse<InquiryItem>> {
    const params: Record<string, string | number> = { page, limit };
    if (status) params['status'] = status;
    return this.http.get<PagedResponse<InquiryItem>>(`${API}/inquiries`, { params });
  }

  getOne(id: number): Observable<InquiryItem> {
    return this.http.get<InquiryItem>(`${API}/inquiries/${id}`);
  }

  updateStatus(id: number, payload: UpdateInquiryStatusPayload): Observable<InquiryItem> {
    return this.http.put<InquiryItem>(`${API}/inquiries/${id}/status`, payload);
  }

  remove(id: number): Observable<InquiryItem> {
    return this.http.delete<InquiryItem>(`${API}/inquiries/${id}`);
  }
}
