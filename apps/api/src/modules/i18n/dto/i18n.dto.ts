import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Translation
export class UpsertTranslationDto {
  @ApiProperty({ description: '번역 키', example: 'home.title' })
  @IsString() key: string;
  @ApiProperty({ description: '한국어 번역', example: '홈' })
  @IsString() ko: string;
  @ApiPropertyOptional({ description: '영문 번역' })
  @IsOptional() @IsString() en?: string;
  @ApiPropertyOptional({ description: '일문 번역' })
  @IsOptional() @IsString() ja?: string;
}

// SeoConfig
export class UpsertSeoConfigDto {
  @ApiProperty({ description: '페이지 경로', example: '/about' })
  @IsString() pagePath: string;
  @ApiPropertyOptional({ description: 'SEO 제목' })
  @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional({ description: '영문 SEO 제목' })
  @IsOptional() @IsString() titleEn?: string;
  @ApiPropertyOptional({ description: '일문 SEO 제목' })
  @IsOptional() @IsString() titleJa?: string;
  @ApiPropertyOptional({ description: 'SEO 설명' })
  @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ description: '영문 SEO 설명' })
  @IsOptional() @IsString() descriptionEn?: string;
  @ApiPropertyOptional({ description: '일문 SEO 설명' })
  @IsOptional() @IsString() descriptionJa?: string;
  @ApiPropertyOptional({ description: '키워드' })
  @IsOptional() @IsString() keywords?: string;
  @ApiPropertyOptional({ description: 'OG 이미지 URL' })
  @IsOptional() @IsString() ogImageUrl?: string;
}
