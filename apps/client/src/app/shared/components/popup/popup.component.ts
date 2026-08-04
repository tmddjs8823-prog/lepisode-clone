import { Component, inject, signal, OnInit, PLATFORM_ID, HostListener, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ClientApiService, PopupItem } from '../../services/client-api.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css',
})
export class PopupComponent implements OnInit {
  private api = inject(ClientApiService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  popups = signal<PopupItem[]>([]);
  currentIndex = signal(0);
  isMobile = signal(false);

  /** 모바일 + 팝업 2개 이상이면 스와이프 모드 */
  isSwipeMode = computed(() => this.isMobile() && this.popups().length > 1);

  /* 터치 스와이프용 */
  private touchStartX = 0;
  private touchStartY = 0;
  private swiping = false;

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.checkMobile();
    this.loadPopups();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
  }

  private checkMobile(): void {
    if (this.isBrowser) {
      this.isMobile.set(window.innerWidth < 768);
    }
  }

  private loadPopups(): void {
    this.api.getPopups().subscribe({
      next: (items) => {
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const active = items.filter((p) => {
          // 날짜 필터링
          if (p.startDate) {
            const start = new Date(p.startDate);
            start.setHours(0, 0, 0, 0);
            if (start > now) return false;
          }
          if (p.endDate) {
            const end = new Date(p.endDate);
            end.setHours(23, 59, 59, 999);
            if (end < now) return false;
          }
          // 오늘 하루 보지 않기 체크
          const dismissed = localStorage.getItem(`popup_dismiss_${p.id}`);
          if (dismissed) {
            const dismissDate = new Date(dismissed);
            if (
              dismissDate.getFullYear() === today.getFullYear() &&
              dismissDate.getMonth() === today.getMonth() &&
              dismissDate.getDate() === today.getDate()
            ) {
              return false;
            }
          }
          return true;
        });

        this.popups.set(active);
        this.currentIndex.set(0);
      },
      error: (err) => console.error('팝업 로드 실패', err),
    });
  }

  close(popupId: number): void {
    const list = this.popups().filter((p) => p.id !== popupId);
    this.popups.set(list);
    // 인덱스 보정
    if (this.currentIndex() >= list.length && list.length > 0) {
      this.currentIndex.set(list.length - 1);
    }
  }

  closeAll(): void {
    this.popups.set([]);
  }

  dismissToday(popupId: number): void {
    localStorage.setItem(`popup_dismiss_${popupId}`, new Date().toISOString());
    this.close(popupId);
  }

  onImageClick(popup: PopupItem): void {
    if (popup.linkUrl) {
      window.open(popup.linkUrl, '_blank', 'noopener');
    }
  }

  /* ── 스와이프 네비게이션 ── */
  goTo(index: number): void {
    const len = this.popups().length;
    if (index < 0) index = 0;
    if (index >= len) index = len - 1;
    this.currentIndex.set(index);
  }

  prev(): void { this.goTo(this.currentIndex() - 1); }
  next(): void { this.goTo(this.currentIndex() + 1); }

  /* ── 터치 이벤트 ── */
  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.swiping = true;
  }

  onTouchEnd(e: TouchEvent): void {
    if (!this.swiping) return;
    this.swiping = false;
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    // 수평 이동이 수직보다 크고 최소 50px 이상일 때만 스와이프
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) this.next();
      else this.prev();
    }
  }
}
