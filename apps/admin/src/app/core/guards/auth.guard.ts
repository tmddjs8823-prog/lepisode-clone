import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const token = inject(TokenService);
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!token.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // 토큰 만료 시 refresh 시도
  if (token.isTokenExpired()) {
    return auth.refresh().pipe(
      map(() => true),
      catchError(() => {
        router.navigate(['/login']);
        return of(false);
      }),
    );
  }

  return true;
};

export const loginGuard: CanActivateFn = () => {
  const token = inject(TokenService);
  const router = inject(Router);

  if (token.isAuthenticated() && !token.isTokenExpired()) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
