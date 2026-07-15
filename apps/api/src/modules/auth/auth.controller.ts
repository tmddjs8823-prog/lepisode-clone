import { Controller, Post, Body, Get, Res, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
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
  constructor(private readonly authService: AuthService) {}

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
}

