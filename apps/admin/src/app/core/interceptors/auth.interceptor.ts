import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  const token = tokenService.accessToken();

  // refresh 요청 자체는 토큰 없이 진행
  if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login')) {
    return next(req);
  }

  const addToken = (r: HttpRequest<unknown>, t: string) =>
    r.clone({ setHeaders: { Authorization: `Bearer ${t}` } });

  // 토큰 만료 시 선제적으로 refresh
  if (token && tokenService.isTokenExpired()) {
    return authService.refresh().pipe(
      switchMap(res => next(addToken(req, res.accessToken))),
      catchError(err => throwError(() => err)),
    );
  }

  const request = token ? addToken(req, token) : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        // 401 → refresh 시도
        return authService.refresh().pipe(
          switchMap(res => next(addToken(req, res.accessToken))),
          catchError(refreshErr => {
            authService.logout();
            return throwError(() => refreshErr);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
