import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
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

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.api.getPopups().subscribe({
      next: (items) => {

        const now = new Date();
        const active = items.filter((p) => {
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
          const dismissed = localStorage.getItem(`popup_dismiss_${p.id}`);
          if (dismissed) {
            const dismissDate = new Date(dismissed);
            const today = new Date();
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
      },
      error: (err) => console.error('팝업 로드 실패', err),
    });
  }

  close(popupId: number): void {
    this.popups.update((list) => list.filter((p) => p.id !== popupId));
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
}
