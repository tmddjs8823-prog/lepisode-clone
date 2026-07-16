import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000/api/v1/content';

export interface CertificateItem {
  id: number;
  title: string;
  titleEn: string | null;
  titleJa: string | null;
  issuer: string | null;
  issueDate: string | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface CertificatePayload {
  title: string;
  titleEn?: string;
  titleJa?: string;
  issuer?: string;
  issueDate?: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface TermsItem {
  id: number;
  type: string;
  title: string;
  titleEn: string | null;
  titleJa: string | null;
  content: string;
  contentEn: string | null;
  contentJa: string | null;
  updatedAt: string;
}

export interface UpsertTermsPayload {
  type: string;
  title: string;
  titleEn?: string;
  titleJa?: string;
  content: string;
  contentEn?: string;
  contentJa?: string;
}

@Injectable({ providedIn: 'root' })
export class ContentApiService {
  private http = inject(HttpClient);

  getCertificates(): Observable<CertificateItem[]> {
    return this.http.get<CertificateItem[]>(`${API}/certificates`);
  }

  createCertificate(dto: CertificatePayload): Observable<CertificateItem> {
    return this.http.post<CertificateItem>(`${API}/certificates`, dto);
  }

  updateCertificate(id: number, dto: CertificatePayload): Observable<CertificateItem> {
    return this.http.put<CertificateItem>(`${API}/certificates/${id}`, dto);
  }

  removeCertificate(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/certificates/${id}`);
  }

  /* ── Event ─────────────────────────────────────── */
  getEvents(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(`${API}/events/admin`);
  }

  getEvent(id: number): Observable<EventItem> {
    return this.http.get<EventItem>(`${API}/events/${id}`);
  }

  createEvent(dto: EventPayload): Observable<EventItem> {
    return this.http.post<EventItem>(`${API}/events`, dto);
  }

  updateEvent(id: number, dto: EventPayload): Observable<EventItem> {
    return this.http.put<EventItem>(`${API}/events/${id}`, dto);
  }

  removeEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/events/${id}`);
  }

  /* ── Popup ──────────────────────────────────────── */
  getPopups(): Observable<PopupItem[]> {
    return this.http.get<PopupItem[]>(`${API}/popups/admin`);
  }

  createPopup(dto: PopupPayload): Observable<PopupItem> {
    return this.http.post<PopupItem>(`${API}/popups`, dto);
  }

  updatePopup(id: number, dto: PopupPayload): Observable<PopupItem> {
    return this.http.put<PopupItem>(`${API}/popups/${id}`, dto);
  }

  removePopup(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/popups/${id}`);
  }

  /* ── Terms ─────────────────────────────────────── */
  getTerms(): Observable<TermsItem[]> {
    return this.http.get<TermsItem[]>(`${API}/terms`);
  }

  upsertTerms(dto: UpsertTermsPayload): Observable<TermsItem> {
    return this.http.put<TermsItem>(`${API}/terms`, dto);
  }

  /* ── QrCode ─────────────────────────────────────── */
  getQrCodes(): Observable<QrCodeItem[]> {
    return this.http.get<QrCodeItem[]>(`${API}/qr`);
  }

  createQrCode(dto: QrCodePayload): Observable<QrCodeItem> {
    return this.http.post<QrCodeItem>(`${API}/qr`, dto);
  }

  updateQrCode(id: number, dto: Partial<QrCodePayload>): Observable<QrCodeItem> {
    return this.http.put<QrCodeItem>(`${API}/qr/${id}`, dto);
  }

  removeQrCode(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/qr/${id}`);
  }
}

export interface EventItem {
  id: number;
  title: string;
  titleEn: string | null;
  titleJa: string | null;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  attachmentUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  selectedDate: string | null;
  published: boolean;
  seoTitle: string | null;
  metaDesc: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventPayload {
  title: string;
  titleEn?: string;
  titleJa?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  attachmentUrl?: string;
  startDate?: string;
  endDate?: string;
  selectedDate?: string;
  published?: boolean;
}

export interface PopupItem {
  id: number;
  title: string;
  imageUrl: string | null;
  linkUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  position: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PopupPayload {
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  position?: string;
  sortOrder?: number;
  published?: boolean;
}

export interface QrCodeItem {
  id: number;
  name: string;
  type: string | null;
  targetUrl: string;
  qrCodeUrl: string | null;
  scanCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QrCodePayload {
  name: string;
  type?: string;
  targetUrl: string;
  isActive?: boolean;
}
