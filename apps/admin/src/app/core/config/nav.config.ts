export interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: '홈페이지 관리',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    children: [
      { label: '대시보드',           icon: '', route: '/dashboard' },
      { label: '포트폴리오 관리',    icon: '', route: '/homepage/portfolio' },
      { label: '서비스 소개 관리',   icon: '', route: '/homepage/services' },
      { label: '지원사업 관리',      icon: '', route: '/support/projects' },
      { label: '현황 관리',          icon: '', route: '/support/statuses' },
      { label: '문의 내역 관리',     icon: '', route: '/homepage/inquiries' },
      { label: '마케팅 수신동의 관리', icon: '', route: '/marketing/consents' },
      { label: '인증서 관리',        icon: '', route: '/content/certificates' },
      { label: '이벤트 관리',        icon: '', route: '/content/events' },
      { label: '팝업 관리',          icon: '', route: '/content/popups' },
      { label: '약관 관리',          icon: '', route: '/content/terms' },
      { label: '공지사항 관리',      icon: '', route: '/homepage/notices' },
      { label: '채용 관리',          icon: '', route: '/homepage/jobs' },
      { label: 'QR코드 관리',        icon: '', route: '/content/qr' },
      { label: 'FAQ 관리',           icon: '', route: '/homepage/faq' },
      { label: '다국어 관리',        icon: '', route: '/settings/i18n' },
      { label: '회사 소개 관리',     icon: '', route: '/homepage/company' },
      { label: 'SEO 관리',           icon: '', route: '/settings/seo' },
      { label: '기술 블로그 관리',   icon: '', route: '/homepage/blog' },
    ],
  },
  {
    label: '마케팅 업체 관리',
    icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    children: [
      { label: '마케팅 업체 관리', icon: '', route: '/marketing/companies' },
    ],
  },
  {
    label: '사용자 관리',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    children: [
      { label: '역할 및 권한 관리', icon: '', route: '/users/roles' },
      { label: '메뉴별 권한 관리',  icon: '', route: '/users/menus' },
      { label: '사용자 목록',       icon: '', route: '/users/admins' },
    ],
  },
  {
    label: '코디(Cody)',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    children: [
      { label: '기업 관리',  icon: '', route: '/cody/companies' },
      { label: '프로젝트',   icon: '', route: '/cody/projects' },
      { label: '크레딧',     icon: '', route: '/cody/credits' },
      { label: '알림',       icon: '', route: '/cody/notifications' },
      { label: '주간 보고',  icon: '', route: '/cody/reports' },
    ],
  },
];
