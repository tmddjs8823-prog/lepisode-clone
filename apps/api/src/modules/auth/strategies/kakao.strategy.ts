import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('KAKAO_CLIENT_ID', ''),
      clientSecret: configService.get('KAKAO_CLIENT_SECRET', ''),
      callbackURL: configService.get('KAKAO_CALLBACK_URL', 'http://localhost:3000/api/v1/auth/kakao/callback'),
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      displayName?: string;
      _json?: { kakao_account?: { email?: string; profile?: { nickname?: string; profile_image_url?: string } } };
    },
    done: (error: Error | null, user?: Record<string, unknown>) => void,
  ): Promise<void> {
    const kakaoAccount = profile._json?.kakao_account;
    const user = {
      provider: 'kakao' as const,
      providerId: String(profile.id),
      email: kakaoAccount?.email ?? '',
      name: kakaoAccount?.profile?.nickname ?? profile.displayName ?? '',
      avatarUrl: kakaoAccount?.profile?.profile_image_url ?? undefined,
    };
    done(null, user);
  }
}
