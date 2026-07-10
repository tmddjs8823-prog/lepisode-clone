/** 페이지네이션된 API 응답 공통 타입 */
export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** 데이터 테이블 컬럼 정의 */
export interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  type?: 'text' | 'badge' | 'date' | 'boolean' | 'number' | 'image' | 'index';
  badgeMap?: Record<string, { label: string; class: string }>;
  width?: string;
  align?: 'left' | 'center' | 'right';
  /** 행 전체를 받아 표시할 문자열을 반환하는 커스텀 변환 함수 */
  transform?: (row: T) => string;
}

/** 토스트 메시지 */
export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

/** 페이지 쿼리 파라미터 */
export interface PageQuery {
  page: number;
  limit: number;
  search?: string;
}
