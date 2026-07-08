import { Component } from '@angular/core';

@Component({
  selector: 'admin-dashboard',
  templateUrl: './dashboard.page.html',
})
export class DashboardPage {
  stats = [
    { label: '전체 포트폴리오', value: '-', sub: '게시된 항목' },
    { label: '접수된 문의', value: '-', sub: '미처리 포함' },
    { label: '블로그 포스트', value: '-', sub: '발행된 글' },
    { label: '코디 업체', value: '-', sub: '등록된 업체' },
  ];
}
