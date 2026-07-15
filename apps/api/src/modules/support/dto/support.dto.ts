import { IsString, IsOptional, IsBoolean, IsInt, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// SupportProject
export class CreateSupportProjectDto {
  @ApiProperty({ description: '프로젝트 제목' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'URL 슬러그', example: 'project-alpha' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: '배너 이미지 URL' })
  @IsOptional() @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ description: 'OG 이미지 URL' })
  @IsOptional() @IsString()
  ogImageUrl?: string;

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional() @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({ description: '설명' })
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '뱃지 텍스트' })
  @IsOptional() @IsString()
  badge?: string;

  @ApiPropertyOptional({ description: '최대 지원금' })
  @IsOptional() @IsString()
  maxGrant?: string;

  @ApiPropertyOptional({ description: '히어로 배경색' })
  @IsOptional() @IsString()
  heroColor?: string;

  @ApiPropertyOptional({ description: '테마 태그 목록' })
  @IsOptional() @IsArray() @IsString({ each: true })
  themes?: string[];

  @ApiPropertyOptional({ description: 'SEO 타이틀' })
  @IsOptional() @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO 설명' })
  @IsOptional() @IsString()
  seoDesc?: string;

  @ApiPropertyOptional({ description: 'SEO 키워드' })
  @IsOptional() @IsString()
  seoKeywords?: string;

  @ApiPropertyOptional({ description: '단계별 안내 (JSON)' })
  @IsOptional()
  steps?: Record<string, unknown>[];

  @ApiPropertyOptional({ description: '선택 포인트 (JSON)' })
  @IsOptional()
  points?: Record<string, unknown>[];

  @ApiPropertyOptional({ description: '매핑 정보 (JSON)' })
  @IsOptional()
  mappings?: Record<string, unknown>[];

  @ApiPropertyOptional({ description: '로드맵 (JSON)' })
  @IsOptional()
  roadmaps?: Record<string, unknown>[];

  @ApiPropertyOptional({ description: 'FAQ (JSON)' })
  @IsOptional()
  faqs?: Record<string, unknown>[];
}

export class UpdateSupportProjectDto {
  @ApiPropertyOptional({ description: '프로젝트 제목' })
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'URL 슬러그' })
  @IsOptional() @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: '배너 이미지 URL' })
  @IsOptional() @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ description: 'OG 이미지 URL' })
  @IsOptional() @IsString()
  ogImageUrl?: string;

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional() @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({ description: '설명' })
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '뱃지 텍스트' })
  @IsOptional() @IsString()
  badge?: string;

  @ApiPropertyOptional({ description: '최대 지원금' })
  @IsOptional() @IsString()
  maxGrant?: string;

  @ApiPropertyOptional({ description: '히어로 배경색' })
  @IsOptional() @IsString()
  heroColor?: string;

  @ApiPropertyOptional({ description: '테마 태그 목록' })
  @IsOptional() @IsArray() @IsString({ each: true })
  themes?: string[];

  @ApiPropertyOptional({ description: 'SEO 타이틀' })
  @IsOptional() @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO 설명' })
  @IsOptional() @IsString()
  seoDesc?: string;

  @ApiPropertyOptional({ description: 'SEO 키워드' })
  @IsOptional() @IsString()
  seoKeywords?: string;

  @ApiPropertyOptional({ description: '단계별 안내 (JSON)' })
  @IsOptional()
  steps?: Record<string, unknown>[];

  @ApiPropertyOptional({ description: '선택 포인트 (JSON)' })
  @IsOptional()
  points?: Record<string, unknown>[];

  @ApiPropertyOptional({ description: '매핑 정보 (JSON)' })
  @IsOptional()
  mappings?: Record<string, unknown>[];

  @ApiPropertyOptional({ description: '로드맵 (JSON)' })
  @IsOptional()
  roadmaps?: Record<string, unknown>[];

  @ApiPropertyOptional({ description: 'FAQ (JSON)' })
  @IsOptional()
  faqs?: Record<string, unknown>[];
}

// ProjectStatus
export class CreateProjectStatusDto {
  @ApiProperty({ description: '프로젝트명' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '영문 프로젝트명' })
  @IsOptional() @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: '일문 프로젝트명' })
  @IsOptional() @IsString()
  titleJa?: string;

  @ApiProperty({ description: '클라이언트명' })
  @IsString()
  client: string;

  @ApiPropertyOptional({ description: '플랫폼 목록', example: ['Web', 'Mobile'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  platforms?: string[];

  @ApiPropertyOptional({ description: '시작일' })
  @IsOptional() @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: '종료일' })
  @IsOptional() @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: '상태', example: '진행중' })
  @IsOptional() @IsString()
  status?: string;

  @ApiPropertyOptional({ description: '이메일' })
  @IsOptional() @IsString()
  email?: string;

  @ApiPropertyOptional({ description: '연락처' })
  @IsOptional() @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '첨부파일 URL' })
  @IsOptional() @IsString()
  attachmentUrl?: string;

  @ApiPropertyOptional({ description: '메모' })
  @IsOptional() @IsString()
  memo?: string;

  @ApiPropertyOptional({ description: '내용' })
  @IsOptional() @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional() @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

export class UpdateProjectStatusDto {
  @ApiPropertyOptional({ description: '프로젝트명' })
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '영문 프로젝트명' })
  @IsOptional() @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: '일문 프로젝트명' })
  @IsOptional() @IsString()
  titleJa?: string;

  @ApiPropertyOptional({ description: '클라이언트명' })
  @IsOptional() @IsString()
  client?: string;

  @ApiPropertyOptional({ description: '플랫폼 목록' })
  @IsOptional() @IsArray() @IsString({ each: true })
  platforms?: string[];

  @ApiPropertyOptional({ description: '시작일' })
  @IsOptional() @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: '종료일' })
  @IsOptional() @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: '상태' })
  @IsOptional() @IsString()
  status?: string;

  @ApiPropertyOptional({ description: '이메일' })
  @IsOptional() @IsString()
  email?: string;

  @ApiPropertyOptional({ description: '연락처' })
  @IsOptional() @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '첨부파일 URL' })
  @IsOptional() @IsString()
  attachmentUrl?: string;

  @ApiPropertyOptional({ description: '메모' })
  @IsOptional() @IsString()
  memo?: string;

  @ApiPropertyOptional({ description: '내용' })
  @IsOptional() @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional() @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}
