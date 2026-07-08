import { Injectable, signal } from '@angular/core';

const ACCESS_TOKEN_KEY = '__admin_at__';

@Injectable({ providedIn: 'root' })
export class TokenService {
  // Access Token → 메모리 (signal)
  private _accessToken = signal<string | null>(
    sessionStorage.getItem(ACCESS_TOKEN_KEY) // 탭 유지용 세션스토리지 (새로고침 대비)
  );

  readonly accessToken = this._accessToken.asReadonly();

  setAccessToken(token: string) {
    this._accessToken.set(token);
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  clearAccessToken() {
    this._accessToken.set(null);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this._accessToken();
  }

  getTokenExpiry(): number | null {
    const token = this._accessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    return Date.now() >= expiry - 30_000; // 30초 여유
  }
}
