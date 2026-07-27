import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const API = '/api/v1';

/* ── 서비스 ── */
export interface ServiceItem {
  id: number;
  title: string;
  titleEn?: string;
  slug?: string;
  seoDescription?: string;
  content?: string;
  icon?: string;
  thumbnailUrl?: string;
  description?: string;
  iconUrl?: string;
  sortOrder: number;
  published: boolean;
  createdAt?: string;
}

/* ── 포트폴리오 ── */
export interface PortfolioItem {
  id: number;
  title: string;
  client?: string;
  category?: string;
  description?: string;
  keywords?: string;
  thumbnailUrl?: string;
  images?: string[];
  techStack?: string[];
  period?: string;
  published: boolean;
  sortOrder?: number;
  createdAt: string;
}

/* ── 공지사항 ── */
export interface NoticeItem {
  id: number;
  title: string;
  content?: string;
  thumbnailUrl?: string;
  published: boolean;
  createdAt: string;
}

/* ── FAQ ── */
export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  categoryId?: number;
  published: boolean;
  sortOrder: number;
}

/* ── 블로그 ── */
export interface BlogItem {
  id: number;
  title: string;
  thumbnailUrl?: string;
  category?: string;
  author?: string;
  tags?: string[];
  published: boolean;
  publishedAt?: string;
  createdAt: string;
}

/* ── 네이버 블로그 RSS ── */
export interface NaverBlogPost {
  title: string;
  link: string;
  category: string;
  pubDate: string;
  thumbnail: string;
}

/* ── 채용 ── */
export interface JobItem {
  id: number;
  title: string;
  department?: string;
  type?: string;
  location?: string;
  description?: string;
  published: boolean;
  createdAt: string;
}

/* ── 팝업 ── */
export interface PopupItem {
  id: number;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  published: boolean;
  startDate?: string;
  endDate?: string;
}

/* ── 현황 ── */
export interface ProjectStatusItem {
  id: number;
  title: string;
  titleEn?: string;
  client?: string;
  status: string;
  platforms?: string[];
  startDate?: string;
  endDate?: string;
  published: boolean;
}

/* ── 문의 ── */
export interface InquiryPayload {
  name: string;
  phone?: string;
  email?: string;
  content: string;
  company?: string;
}

/* ── 이벤트 ── */
export interface EventItem {
  id: number;
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
  published: boolean;
  createdAt: string;
}

/* ── 채용공고 ── */
export interface JobItem {
  id: number;
  title: string;
  category: string | null;
  jobUrl: string | null;
  published: boolean;
  startDate: string | null;
  deadline: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ClientApiService {
  private http = inject(HttpClient);

  /* 서비스 목록 (공개) */
  getServices(): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(`${API}/services`);
  }

  /* 포트폴리오 목록 (공개, 최신 6건) */
  getPortfolios(limit = 6): Observable<PortfolioItem[]> {
    return this.http.get<{ data: PortfolioItem[] }>(`${API}/portfolio`, {
      params: { page: '1', limit: String(limit) },
    }).pipe(map(res => res.data));
  }

  /* 포트폴리오 목록 (페이지네이션) */
  getPortfoliosPaged(page = 1, limit = 12): Observable<{ data: PortfolioItem[]; total: number }> {
    return this.http.get<{ data: PortfolioItem[]; total: number }>(`${API}/portfolio`, {
      params: { page: String(page), limit: String(limit) },
    });
  }

  /* 포트폴리오 상세 */
  getPortfolioDetail(id: number): Observable<PortfolioItem> {
    return this.http.get<PortfolioItem>(`${API}/portfolio/${id}`);
  }

  /* 공지사항 목록 (최신 3건) */
  getNotices(limit = 3): Observable<NoticeItem[]> {
    return this.http.get<{ data: NoticeItem[] }>(`${API}/notices`, {
      params: { page: '1', limit: String(limit) },
    }).pipe(map(res => res.data));
  }

  /* 공지사항 페이지네이션 */
  getNoticesPaged(page = 1, limit = 5): Observable<{ data: NoticeItem[]; total: number; totalPages: number }> {
    return this.http.get<{ data: NoticeItem[]; total: number; totalPages: number }>(`${API}/notices`, {
      params: { page: String(page), limit: String(limit) },
    });
  }

  /* 공지사항 상세 */
  getNoticeDetail(id: number): Observable<NoticeItem> {
    return this.http.get<NoticeItem>(`${API}/notices/${id}`);
  }

  /* FAQ 목록 */
  getFaqs(): Observable<FaqItem[]> {
    return this.http.get<FaqItem[]>(`${API}/faq`);
  }

  /* 팝업 목록 (노출중) */
  getPopups(): Observable<PopupItem[]> {
    return this.http.get<PopupItem[]>(`${API}/content/popups`);
  }

  /* 프로젝트 현황 (공개) */
  getStatuses(): Observable<ProjectStatusItem[]> {
    return this.http.get<ProjectStatusItem[]>(`${API}/support/statuses/public`);
  }

  /* 문의 등록 */
  createInquiry(payload: InquiryPayload): Observable<unknown> {
    return this.http.post(`${API}/inquiries`, payload);
  }

  /* 이벤트 목록 (공개) */
  getEvents(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(`${API}/content/events`);
  }

  /* 이벤트 상세 */
  getEventDetail(id: number): Observable<EventItem> {
    return this.http.get<EventItem>(`${API}/content/events/${id}`);
  }

  /* 블로그 목록 */
  getBlogs(limit = 10): Observable<BlogItem[]> {
    return this.http.get<{ data: BlogItem[] }>(`${API}/blog`, {
      params: { page: '1', limit: String(limit) },
    }).pipe(map(res => res.data));
  }

  /* 블로그 목록 (페이지네이션) */
  getBlogsPaged(page = 1, limit = 12): Observable<{ data: BlogItem[]; total: number }> {
    return this.http.get<{ data: BlogItem[]; total: number }>(`${API}/blog`, {
      params: { page: String(page), limit: String(limit) },
    });
  }

  /* 네이버 블로그 RSS (프록시) */
  getNaverBlogs(): Observable<NaverBlogPost[]> {
    return this.http.get<{ data: NaverBlogPost[]; total: number }>(`${API}/blog/naver-rss`).pipe(
      map(res => res.data),
    );
  }

  /* 채용공고 목록 */
  getJobs(): Observable<JobItem[]> {
    return this.http.get<{ data: JobItem[] }>(`${API}/jobs`, {
      params: { published: 'true' },
    }).pipe(map(res => res.data));
  }

  /* 팀원 목록 */
  getTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${API}/company/team`);
  }

  /* 약관 타입별 조회 */
  getTermsByType(type: string): Observable<TermsItem> {
    return this.http.get<TermsItem>(`${API}/content/terms/${type}`);
  }

  /* 다국어 번역 전체 조회 */
  getTranslations(): Observable<TranslationItem[]> {
    return this.http.get<TranslationItem[]>(`${API}/i18n/translations`);
  }
}

/* ── 팀원 ── */
export interface TeamMember {
  id: number;
  name: string;
  nameEn?: string;
  position: string;
  positionEn?: string;
  profileImageUrl?: string;
  bio?: string;
  bioEn?: string;
  sortOrder?: number;
}

/* ── 약관 ── */
export interface TermsItem {
  id: number;
  type: string;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  updatedAt?: string;
}

/* ── 다국어 번역 ── */
export interface TranslationItem {
  id: number;
  key: string;
  ko: string;
  en?: string | null;
  ja?: string | null;
}
