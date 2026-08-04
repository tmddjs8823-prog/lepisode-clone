import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { TokenService } from './token.service';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  permission?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AdminUser;
}

const API = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private token = inject(TokenService);
  private router = inject(Router);

  private _currentUser = signal<AdminUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/auth/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap(res => {
          this.token.setAccessToken(res.accessToken);
          this._currentUser.set(res.user);
        }),
      );
  }

  refresh(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(res => {
          this.token.setAccessToken(res.accessToken);
          this._currentUser.set(res.user);
        }),
        catchError(err => {
          this.logout();
          return throwError(() => err);
        }),
      );
  }

  logout(): void {
    this.http.post(`${API}/auth/logout`, {}, { withCredentials: true }).subscribe();
    this.token.clearAccessToken();
    this._currentUser.set(null);
    // 미처리 문의 알림 상태 초기화 (재로그인 시 다시 표시)
    localStorage.removeItem('inquiry-alert-dismissed');
    sessionStorage.removeItem('inquiry-alert-last-run');
    this.router.navigate(['/login']);
  }

  loadProfile(): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${API}/auth/profile`, { withCredentials: true })
      .pipe(tap(user => this._currentUser.set(user)));
  }

  isLoggedIn(): boolean {
    return this.token.isAuthenticated();
  }
}
