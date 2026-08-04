import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID', ''),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET', ''),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL', 'http://localhost:3000/api/v1/auth/google/callback'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: { id: string; displayName: string; emails?: { value: string }[]; photos?: { value: string }[] },
    done: VerifyCallback,
  ): Promise<void> {
    const user = {
      provider: 'google' as const,
      providerId: profile.id,
      email: profile.emails?.[0]?.value ?? '',
      name: profile.displayName ?? '',
      avatarUrl: profile.photos?.[0]?.value ?? undefined,
    };
    done(null, user);
  }
}
