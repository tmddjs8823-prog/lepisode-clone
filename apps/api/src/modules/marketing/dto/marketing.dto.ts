import { IsString, IsOptional, IsEmail, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MarketingConsent
export class CreateMarketingConsentDto {
  @ApiProperty({ description: '이름', example: '홍길동' })
  @IsString() name: string;
  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  @IsEmail() email: string;
  @ApiPropertyOptional({ description: '연락처' })
  @IsOptional() @IsString() phone?: string;
}

// MarketingCompany
export class CreateMarketingCompanyDto {
  @ApiProperty({ description: '업체명', example: '마케팅 파트너' })
  @IsString() name: string;
  @ApiProperty({ description: '슬러그 (URL 경로)', example: 'goorum-tax' })
  @IsString() slug: string;
  @ApiPropertyOptional({ description: '담당자' })
  @IsOptional() @IsString() manager?: string;
  @ApiPropertyOptional({ description: '월 광고 예산' })
  @IsOptional() @IsInt() monthlyBudget?: number;
  @ApiPropertyOptional({ description: '공유 페이지 비밀번호' })
  @IsOptional() @IsString() password?: string;

  // 네이버 검색광고
  @ApiPropertyOptional({ description: '네이버 API Key' })
  @IsOptional() @IsString() naverApiKey?: string;
  @ApiPropertyOptional({ description: '네이버 Secret Key' })
  @IsOptional() @IsString() naverSecretKey?: string;
  @ApiPropertyOptional({ description: '네이버 Customer ID' })
  @IsOptional() @IsString() naverCustomerId?: string;
  @ApiPropertyOptional({ description: '파워링크 채널 표시' })
  @IsOptional() @IsBoolean() chPowerlink?: boolean;
  @ApiPropertyOptional({ description: '파워컨텐츠 채널 표시' })
  @IsOptional() @IsBoolean() chPowerContent?: boolean;
  @ApiPropertyOptional({ description: '플레이스 채널 표시' })
  @IsOptional() @IsBoolean() chPlace?: boolean;

  // GA4
  @ApiPropertyOptional({ description: 'GA4 Property ID' })
  @IsOptional() @IsString() ga4PropertyId?: string;
  @ApiPropertyOptional({ description: 'GA4 서비스 계정 키 (JSON)' })
  @IsOptional() @IsString() ga4ServiceAccountKey?: string;
}

export class UpdateMarketingCompanyDto {
  @ApiPropertyOptional({ description: '업체명' })
  @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional({ description: '슬러그 (URL 경로)' })
  @IsOptional() @IsString() slug?: string;
  @ApiPropertyOptional({ description: '담당자' })
  @IsOptional() @IsString() manager?: string;
  @ApiPropertyOptional({ description: '월 광고 예산' })
  @IsOptional() @IsInt() monthlyBudget?: number;
  @ApiPropertyOptional({ description: '공유 페이지 비밀번호' })
  @IsOptional() @IsString() password?: string;
  @ApiPropertyOptional({ description: '상태' })
  @IsOptional() @IsString() status?: string;

  // 네이버 검색광고
  @ApiPropertyOptional({ description: '네이버 API Key' })
  @IsOptional() @IsString() naverApiKey?: string;
  @ApiPropertyOptional({ description: '네이버 Secret Key' })
  @IsOptional() @IsString() naverSecretKey?: string;
  @ApiPropertyOptional({ description: '네이버 Customer ID' })
  @IsOptional() @IsString() naverCustomerId?: string;
  @ApiPropertyOptional({ description: '파워링크 채널 표시' })
  @IsOptional() @IsBoolean() chPowerlink?: boolean;
  @ApiPropertyOptional({ description: '파워컨텐츠 채널 표시' })
  @IsOptional() @IsBoolean() chPowerContent?: boolean;
  @ApiPropertyOptional({ description: '플레이스 채널 표시' })
  @IsOptional() @IsBoolean() chPlace?: boolean;

  // GA4
  @ApiPropertyOptional({ description: 'GA4 Property ID' })
  @IsOptional() @IsString() ga4PropertyId?: string;
  @ApiPropertyOptional({ description: 'GA4 서비스 계정 키 (JSON)' })
  @IsOptional() @IsString() ga4ServiceAccountKey?: string;
}
