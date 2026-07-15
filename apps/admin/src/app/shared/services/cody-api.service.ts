import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const API = 'http://localhost:3000/api/v1/cody';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CodyCompanyApiItem {
  id: number;
  name: string;
  businessNumber: string | null;
  ceoName: string | null;
  ceoPhone: string | null;
  companyPhone: string | null;
  companyEmail: string | null;
  address: string | null;
  addressDetail: string | null;
  homepage: string | null;
  bizFileUrl: string | null;
  email: string | null;
  memo: string | null;
  createdAt: string;
}

export interface CodyCompanyPayload {
  name: string;
  businessNumber?: string;
  ceoName?: string;
  ceoPhone?: string;
  companyPhone?: string;
  companyEmail?: string;
  address?: string;
  addressDetail?: string;
  homepage?: string;
  bizFileUrl?: string;
  email?: string;
  memo?: string;
}

export interface CodyProjectApiItem {
  id: number;
  name: string;
  status: string;
  companyId: number;
  company: { id: number; name: string };
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  createdAt: string;
}

export interface CodyProjectPayload {
  name: string;
  status?: string;
  companyId: number;
  startDate?: string;
  endDate?: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class CodyApiService {
  private http = inject(HttpClient);

  /* ── Company ── */
  getCompanies(page = 1, limit = 100): Observable<PaginatedResponse<CodyCompanyApiItem>> {
    return this.http.get<PaginatedResponse<CodyCompanyApiItem>>(`${API}/companies?page=${page}&limit=${limit}`);
  }

  getCompanyNames(): Observable<{ id: number; name: string }[]> {
    return this.getCompanies(1, 999).pipe(
      map(res => res.data.map(c => ({ id: c.id, name: c.name })))
    );
  }

  createCompany(dto: CodyCompanyPayload): Observable<CodyCompanyApiItem> {
    return this.http.post<CodyCompanyApiItem>(`${API}/companies`, dto);
  }

  updateCompany(id: number, dto: Partial<CodyCompanyPayload>): Observable<CodyCompanyApiItem> {
    return this.http.put<CodyCompanyApiItem>(`${API}/companies/${id}`, dto);
  }

  removeCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/companies/${id}`);
  }

  /* ── Project ── */
  getProjects(page = 1, limit = 100): Observable<PaginatedResponse<CodyProjectApiItem>> {
    return this.http.get<PaginatedResponse<CodyProjectApiItem>>(`${API}/projects?page=${page}&limit=${limit}`);
  }

  getProjectNames(): Observable<{ id: number; name: string; companyId: number }[]> {
    return this.getProjects(1, 999).pipe(
      map(res => res.data.map(p => ({ id: p.id, name: p.name, companyId: p.companyId })))
    );
  }

  createProject(dto: CodyProjectPayload): Observable<CodyProjectApiItem> {
    return this.http.post<CodyProjectApiItem>(`${API}/projects`, dto);
  }

  updateProject(id: number, dto: Partial<CodyProjectPayload>): Observable<CodyProjectApiItem> {
    return this.http.put<CodyProjectApiItem>(`${API}/projects/${id}`, dto);
  }

  removeProject(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/projects/${id}`);
  }

  /* ── Report ── */
  getReports(page = 1, limit = 20): Observable<PaginatedResponse<CodyReportApiItem>> {
    return this.http.get<PaginatedResponse<CodyReportApiItem>>(`${API}/reports?page=${page}&limit=${limit}`);
  }

  getReport(id: number): Observable<CodyReportApiItem> {
    return this.http.get<CodyReportApiItem>(`${API}/reports/${id}`);
  }

  createReport(dto: CodyReportPayload): Observable<CodyReportApiItem> {
    return this.http.post<CodyReportApiItem>(`${API}/reports`, dto);
  }

  updateReport(id: number, dto: Partial<CodyReportPayload>): Observable<CodyReportApiItem> {
    return this.http.put<CodyReportApiItem>(`${API}/reports/${id}`, dto);
  }

  removeReport(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/reports/${id}`);
  }

  /* ── Credit ── */
  getCredits(page = 1, limit = 20): Observable<PaginatedResponse<CodyCreditApiItem>> {
    return this.http.get<PaginatedResponse<CodyCreditApiItem>>(`${API}/credits?page=${page}&limit=${limit}`);
  }

  createCredit(dto: CodyCreditPayload): Observable<CodyCreditApiItem> {
    return this.http.post<CodyCreditApiItem>(`${API}/credits`, dto);
  }

  removeCredit(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/credits/${id}`);
  }
}

export interface CodyCreditApiItem {
  id: number;
  type: string;
  companyId: number;
  projectId: number | null;
  company: { id: number; name: string };
  project: { id: number; name: string } | null;
  description: string | null;
  amount: string; // Decimal comes as string
  manager: string | null;
  createdAt: string;
}

export interface CodyCreditPayload {
  type: string;
  companyId: number;
  projectId?: number;
  description?: string;
  amount: string;
  manager?: string;
}

export interface CodyReportApiItem {
  id: number;
  title: string;
  companyId: number;
  projectId: number;
  company: { id: number; name: string };
  project: { id: number; name: string };
  periodStart: string | null;
  periodEnd: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CodyReportPayload {
  companyId: number;
  projectId: number;
  title: string;
  periodStart?: string;
  periodEnd?: string;
  content?: string;
}
