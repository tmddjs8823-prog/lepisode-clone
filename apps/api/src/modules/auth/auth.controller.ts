import { Controller, Post, Body, Get, Res, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthenticatedRequest } from '../../common/types/api.types';

class LoginDto {
  @ApiProperty({ description: '관리자 이메일', example: 'admin@lepisode.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '비밀번호', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
};

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  private readonly adminUrl: string;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.adminUrl = this.configService.get('ADMIN_URL', 'http://localhost:4200');
  }

  @ApiOperation({ summary: '관리자 로그인' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    // Refresh Token → httpOnly 쿠키
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

    // Access Token → 응답 body (클라이언트 메모리 저장)
    return { accessToken, user };
  }

  @ApiOperation({ summary: 'Access Token 갱신' })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      res.status(HttpStatus.UNAUTHORIZED);
      return { message: 'Refresh Token이 없습니다.' };
    }

    const result = await this.authService.refresh(refreshToken);

    // 새 Refresh Token → 쿠키 갱신
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return { accessToken: result.accessToken, user: result.user };
  }

  @ApiOperation({ summary: '로그아웃' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
    return { message: '로그아웃되었습니다.' };
  }

  @ApiOperation({ summary: '초기 관리자 계정 생성 (시드)' })
  @Post('seed')
  async seed() {
    const admin = await this.authService.createInitialAdmin();
    if (admin) {
      return { message: '초기 관리자 계정이 생성되었습니다.', email: admin.email };
    }
    return { message: '이미 관리자 계정이 존재합니다.' };
  }

  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.sub);
  }

  /* ── Google OAuth ── */

  @ApiOperation({ summary: 'Google 소셜 로그인 시작' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Passport가 자동으로 Google 로그인 페이지로 리디렉트
  }

  @ApiOperation({ summary: 'Google OAuth 콜백' })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res);
  }

  /* ── Kakao OAuth ── */

  @ApiOperation({ summary: 'Kakao 소셜 로그인 시작' })
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  kakaoLogin() {
    // Passport가 자동으로 Kakao 로그인 페이지로 리디렉트
  }

  @ApiOperation({ summary: 'Kakao OAuth 콜백' })
  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res);
  }

  /* ── 공통 OAuth 콜백 처리 ── */

  private async handleOAuthCallback(req: Request, res: Response) {
    const profile = req.user as {
      provider: string;
      providerId: string;
      email: string;
      name: string;
      avatarUrl?: string;
    };

    try {
      const { accessToken, refreshToken } = await this.authService.socialLogin(profile);

      // Refresh Token → httpOnly 쿠키
      res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

      // Admin SPA로 리디렉트 (accessToken을 쿼리 파라미터로 전달)
      res.redirect(`${this.adminUrl}/login?accessToken=${accessToken}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : '소셜 로그인에 실패했습니다.';
      res.redirect(`${this.adminUrl}/login?error=${encodeURIComponent(message)}`);
    }
  }
}

