import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload, AdminUserResponse } from '../../common/types/api.types';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly accessTokenSecret: string;
  private readonly accessTokenExpiry: number; // seconds
  private readonly refreshTokenSecret: string;
  private readonly refreshTokenExpiry: number; // seconds

  onModuleInit() {
    this.createInitialAdmin();
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenSecret = this.configService.get('JWT_SECRET', 'lepisode-jwt-secret');
    this.accessTokenExpiry = this.parseExpiry(this.configService.get('JWT_ACCESS_EXPIRY', '15m'));
    this.refreshTokenSecret = this.configService.get('JWT_REFRESH_SECRET', 'lepisode-refresh-secret');
    this.refreshTokenExpiry = this.parseExpiry(this.configService.get('JWT_REFRESH_EXPIRY', '7d'));
  }

  private parseExpiry(value: string): number {
    const match = value.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return 900; // default 15min
    const num = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's': return num;
      case 'm': return num * 60;
      case 'h': return num * 3600;
      case 'd': return num * 86400;
      default: return 900;
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('잘못된 이메일 또는 비밀번호입니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('잘못된 이메일 또는 비밀번호입니다.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('비활성화된 계정입니다.');
    }

    return user;
  }

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign({ ...payload } as Record<string, unknown>, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiry,
    });
  }

  generateRefreshToken(payload: Pick<JwtPayload, 'sub'>): string {
    return this.jwtService.sign(
      { sub: payload.sub } as Record<string, unknown>,
      { secret: this.refreshTokenSecret, expiresIn: this.refreshTokenExpiry },
    );
  }

  verifyRefreshToken(token: string): { sub: number } {
    try {
      return this.jwtService.verify<{ sub: number }>(token, {
        secret: this.refreshTokenSecret,
      });
    } catch {
      throw new UnauthorizedException('유효하지 않은 Refresh Token입니다.');
    }
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken({ sub: user.id }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    const { sub } = this.verifyRefreshToken(refreshToken);

    const user = await this.prisma.adminUser.findUnique({ where: { id: sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken({ sub: user.id }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async createInitialAdmin() {
    const count = await this.prisma.adminUser.count();
    if (count > 0) return null;

    const hashedPassword = await bcrypt.hash('admin1234', 10);
    const admin = await this.prisma.adminUser.create({
      data: {
        email: 'admin@lepisode.team',
        password: hashedPassword,
        name: '관리자',
        role: 'SUPER_ADMIN',
      },
    });

    return admin;
  }

  async getProfile(userId: number): Promise<AdminUserResponse> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permission: true,
        roleId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new UnauthorizedException();

    return user;
  }
}
