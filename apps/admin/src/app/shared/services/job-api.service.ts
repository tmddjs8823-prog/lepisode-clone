import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000/api/v1';

export type JobItem = {
  id: number;
  title: string;
  titleEn: string | null;
  titleJa: string | null;
  category: string | null;
  jobUrl: string | null;
  published: boolean;
  startDate: string | null;
  deadline: string | null;
  createdAt: string;
};

export interface CreateJobPayload {
  title: string;
  titleEn?: string;
  titleJa?: string;
  category?: string;
  jobUrl?: string;
  published?: boolean;
  startDate?: string;
  deadline?: string;
}

export type UpdateJobPayload = Partial<CreateJobPayload>;

@Injectable({ providedIn: 'root' })
export class JobApiService {
  private http = inject(HttpClient);

  getList(page = 1, limit = 10): Observable<{ data: JobItem[]; total: number }> {
    return this.http.get<{ data: JobItem[]; total: number }>(`${API}/jobs/admin/list`, {
      params: { page, limit },
    });
  }

  getOne(id: number): Observable<JobItem> {
    return this.http.get<JobItem>(`${API}/jobs/${id}`);
  }

  create(payload: CreateJobPayload): Observable<JobItem> {
    return this.http.post<JobItem>(`${API}/jobs`, payload);
  }

  update(id: number, payload: UpdateJobPayload): Observable<JobItem> {
    return this.http.put<JobItem>(`${API}/jobs/${id}`, payload);
  }

  remove(id: number): Observable<JobItem> {
    return this.http.delete<JobItem>(`${API}/jobs/${id}`);
  }
}
