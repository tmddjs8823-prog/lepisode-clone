/**
 * API 공통 타입 유틸리티
 *
 * Prisma 모델을 직접 노출하지 않고, Pick/Omit으로
 * 필요한 필드만 선별하여 API 응답 타입으로 사용합니다.
 */
import type {
  AdminUser, Portfolio, Service, BlogPost, Notice,
  FaqCategory, Faq, Inquiry, JobPosting,
  CompanyInfo, TeamMember, CompanyHistory,
  SupportProject, ProjectStatus
} from '@prisma/client';

// ─── Pagination ──────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Admin User (password 제외) ──────────────────────────
export type AdminUserResponse = Omit<AdminUser, 'password'>;

// ─── Portfolio ────────────────────────────────────────────
export type PortfolioListItem = Pick<Portfolio,
  'id' | 'title' | 'titleEn' | 'titleJa' | 'category' | 'client' | 'thumbnailUrl' | 'published' | 'sortOrder' | 'createdAt'
>;
export type PortfolioDetail = Omit<Portfolio, never>; // 전체 필드

// ─── Service ──────────────────────────────────────────────
export type ServiceListItem = Pick<Service,
  'id' | 'title' | 'titleEn' | 'titleJa' | 'slug' | 'icon' | 'thumbnailUrl' | 'sortOrder' | 'published'
>;
export type ServiceDetail = Omit<Service, never>;

// ─── Blog ─────────────────────────────────────────────────
export type BlogPostListItem = Omit<BlogPost, 'content' | 'contentEn' | 'contentJa'>;
export type BlogPostDetail = Omit<BlogPost, never>;

// ─── Notice ───────────────────────────────────────────────
export type NoticeListItem = Omit<Notice, 'content' | 'contentEn' | 'contentJa'>;
export type NoticeDetail = Omit<Notice, never>;

// ─── FAQ ──────────────────────────────────────────────────
export type FaqCategoryResponse = FaqCategory & { faqs?: FaqResponse[] };
export type FaqResponse = Omit<Faq, 'categoryId'> & {
  category: Pick<FaqCategory, 'id' | 'name' | 'nameEn' | 'nameJa'>;
};

// ─── Inquiry ──────────────────────────────────────────────
export type InquiryListItem = Omit<Inquiry, 'content' | 'adminMemo'>;
export type InquiryDetail = Omit<Inquiry, never>;

// ─── Job Posting ──────────────────────────────────────────
export type JobPostingListItem = Pick<JobPosting,
  'id' | 'title' | 'titleEn' | 'titleJa' | 'category' | 'jobUrl' | 'published' | 'startDate' | 'deadline' | 'createdAt'
>;
export type JobPostingDetail = Omit<JobPosting, never>;

// ─── Company ──────────────────────────────────────────────
export type CompanyInfoResponse = Omit<CompanyInfo, never>;
export type TeamMemberResponse = Omit<TeamMember, never>;
export type CompanyHistoryResponse = Omit<CompanyHistory, never>;

// ─── Support ──────────────────────────────────────────────
export type SupportProjectListItem = Omit<SupportProject, never>;
export type SupportProjectDetail = Omit<SupportProject, never>;

export type ProjectStatusListItem = Pick<ProjectStatus,
  'id' | 'title' | 'titleEn' | 'titleJa' | 'client' | 'status' | 'published' | 'sortOrder' | 'createdAt'
>;
export type ProjectStatusDetail = Omit<ProjectStatus, never>;

// ─── JWT Payload ──────────────────────────────────────────
export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface AuthenticatedRequest {
  user: JwtPayload;
}
