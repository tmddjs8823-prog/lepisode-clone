import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000/api/v1';

/* ── 지원사업 ── */
export type SupportProjectItem = {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export interface CreateSupportProjectPayload {
  title: string;
  slug: string;
  published?: boolean;
  sortOrder?: number;
}
export type UpdateSupportProjectPayload = Partial<CreateSupportProjectPayload>;

/* ── 현황 ── */
export type ProjectStatusType = 'ESTIMATING' | 'IN_PROGRESS' | 'COMPLETE';

export type ProjectStatusItem = {
  id: number;
  title: string;
  titleEn: string | null;
  titleJa: string | null;
  client: string;
  platforms: string[];
  startDate: string | null;
  endDate: string | null;
  status: ProjectStatusType;
  email: string | null;
  phone: string | null;
  attachmentUrl: string | null;
  memo: string | null;
  content: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export interface CreateProjectStatusPayload {
  title: string;
  titleEn?: string;
  titleJa?: string;
  client: string;
  platforms?: string[];
  startDate?: string;
  endDate?: string;
  status?: ProjectStatusType;
  email?: string;
  phone?: string;
  attachmentUrl?: string;
  memo?: string;
  content?: string;
  published?: boolean;
  sortOrder?: number;
}
export type UpdateProjectStatusPayload = Partial<CreateProjectStatusPayload>;

@Injectable({ providedIn: 'root' })
export class SupportApiService {
  private http = inject(HttpClient);

  /* 지원사업 */
  getProjects(): Observable<SupportProjectItem[]> {
    return this.http.get<SupportProjectItem[]>(`${API}/support/projects`);
  }
  getProject(id: number): Observable<SupportProjectItem> {
    return this.http.get<SupportProjectItem>(`${API}/support/projects/${id}`);
  }
  createProject(p: CreateSupportProjectPayload): Observable<SupportProjectItem> {
    return this.http.post<SupportProjectItem>(`${API}/support/projects`, p);
  }
  updateProject(id: number, p: UpdateSupportProjectPayload): Observable<SupportProjectItem> {
    return this.http.put<SupportProjectItem>(`${API}/support/projects/${id}`, p);
  }
  removeProject(id: number): Observable<SupportProjectItem> {
    return this.http.delete<SupportProjectItem>(`${API}/support/projects/${id}`);
  }

  /* 현황 */
  getStatuses(): Observable<ProjectStatusItem[]> {
    return this.http.get<ProjectStatusItem[]>(`${API}/support/statuses`);
  }
  getStatus(id: number): Observable<ProjectStatusItem> {
    return this.http.get<ProjectStatusItem>(`${API}/support/statuses/${id}`);
  }
  createStatus(p: CreateProjectStatusPayload): Observable<ProjectStatusItem> {
    return this.http.post<ProjectStatusItem>(`${API}/support/statuses`, p);
  }
  updateStatus(id: number, p: UpdateProjectStatusPayload): Observable<ProjectStatusItem> {
    return this.http.put<ProjectStatusItem>(`${API}/support/statuses/${id}`, p);
  }
  removeStatus(id: number): Observable<ProjectStatusItem> {
    return this.http.delete<ProjectStatusItem>(`${API}/support/statuses/${id}`);
  }
}
