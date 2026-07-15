import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000/api/v1/marketing';

export interface MarketingConsentItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  isConsented: boolean;
  consentedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface MarketingCompanyItem {
  id: number;
  name: string;
  slug: string;
  manager: string | null;
  monthlyBudget: number;
  password: string | null;
  status: string;
  naverApiKey: string | null;
  naverSecretKey: string | null;
  naverCustomerId: string | null;
  chPowerlink: boolean;
  chPowerContent: boolean;
  chPlace: boolean;
  ga4PropertyId: string | null;
  ga4ServiceAccountKey: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class MarketingApiService {
  private http = inject(HttpClient);

  // ── Consent ──
  getConsents(params: { page?: number; limit?: number } = {}): Observable<{
    data: MarketingConsentItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.http.get<{ data: MarketingConsentItem[]; total: number; page: number; limit: number; totalPages: number }>(`${API}/consents`, { params: params as Record<string, string | number | boolean> });
  }

  revokeConsent(id: number): Observable<MarketingConsentItem> {
    return this.http.put<MarketingConsentItem>(`${API}/consents/${id}/revoke`, {});
  }

  // ── Company ──
  getCompanies(): Observable<MarketingCompanyItem[]> {
    return this.http.get<MarketingCompanyItem[]>(`${API}/companies`);
  }

  createCompany(dto: Partial<MarketingCompanyItem>): Observable<MarketingCompanyItem> {
    return this.http.post<MarketingCompanyItem>(`${API}/companies`, dto);
  }

  updateCompany(id: number, dto: Partial<MarketingCompanyItem>): Observable<MarketingCompanyItem> {
    return this.http.put<MarketingCompanyItem>(`${API}/companies/${id}`, dto);
  }

  deleteCompany(id: number): Observable<MarketingCompanyItem> {
    return this.http.delete<MarketingCompanyItem>(`${API}/companies/${id}`);
  }
}
