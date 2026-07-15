import { IsString, IsOptional, IsBoolean, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlogPostDto {
  @ApiProperty({ description: '블로그 제목', example: 'NestJS로 API 만들기' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '영문 제목' })
  @IsOptional() @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: '일문 제목' })
  @IsOptional() @IsString()
  titleJa?: string;

  @ApiProperty({ description: '본문 내용 (HTML)' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '영문 본문' })
  @IsOptional() @IsString()
  contentEn?: string;

  @ApiPropertyOptional({ description: '일문 본문' })
  @IsOptional() @IsString()
  contentJa?: string;

  @ApiPropertyOptional({ description: '썸네일 URL' })
  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: '카테고리', example: '기술' })
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '서브 카테고리' })
  @IsOptional() @IsString()
  subCategory?: string;

  @ApiPropertyOptional({ description: '작성자', example: '관리자' })
  @IsOptional() @IsString()
  author?: string;

  @ApiPropertyOptional({ description: '태그 목록', example: ['NestJS', 'TypeScript'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '공개 여부', example: true })
  @IsOptional() @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: '발행일', example: '2026-01-01T00:00:00Z' })
  @IsOptional() @IsDateString()
  publishedAt?: string;
}

export class UpdateBlogPostDto {
  @ApiPropertyOptional({ description: '블로그 제목' })
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '영문 제목' })
  @IsOptional() @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: '일문 제목' })
  @IsOptional() @IsString()
  titleJa?: string;

  @ApiPropertyOptional({ description: '본문 내용 (HTML)' })
  @IsOptional() @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '영문 본문' })
  @IsOptional() @IsString()
  contentEn?: string;

  @ApiPropertyOptional({ description: '일문 본문' })
  @IsOptional() @IsString()
  contentJa?: string;

  @ApiPropertyOptional({ description: '썸네일 URL' })
  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: '카테고리' })
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '서브 카테고리' })
  @IsOptional() @IsString()
  subCategory?: string;

  @ApiPropertyOptional({ description: '작성자' })
  @IsOptional() @IsString()
  author?: string;

  @ApiPropertyOptional({ description: '태그 목록' })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional() @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: '발행일' })
  @IsOptional() @IsDateString()
  publishedAt?: string;
}
