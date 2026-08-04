import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';

const API = 'http://localhost:3000/api/v1';

@Component({
  selector: 'admin-login',
  imports: [FormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage implements OnInit {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  loading = signal(false);
  errorMsg = signal('');

  ngOnInit() {
    // OAuth 콜백: URL에 accessToken이 있으면 처리
    const params = this.route.snapshot.queryParams;

    if (params['accessToken']) {
      this.tokenService.setAccessToken(params['accessToken']);
      // 프로필 로드 후 대시보드 이동
      this.authService.loadProfile().subscribe({
        next: () => this.router.navigate(['/dashboard'], { replaceUrl: true }),
        error: () => {
          this.errorMsg.set('프로필 로드에 실패했습니다.');
          this.tokenService.clearAccessToken();
        },
      });
      return;
    }

    if (params['error']) {
      this.errorMsg.set(decodeURIComponent(params['error']));
    }
  }

  onSubmit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMsg.set(err?.error?.message ?? '로그인에 실패했습니다.');
        this.loading.set(false);
      },
    });
  }

  loginWithGoogle() {
    window.location.href = `${API}/auth/google`;
  }

  loginWithKakao() {
    window.location.href = `${API}/auth/kakao`;
  }
}
