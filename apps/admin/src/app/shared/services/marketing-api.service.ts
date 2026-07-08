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

@Injectable({ providedIn: 'root' })
export class MarketingApiService {
  private http = inject(HttpClient);

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
}
