import { IsString, IsOptional, IsBoolean, IsInt, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePortfolioDto {
  @ApiProperty({ description: '포트폴리오 제목', example: '레피소드 웹사이트 리뉴얼' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '영문 제목' })
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: '일문 제목' })
  @IsOptional()
  @IsString()
  titleJa?: string;

  @ApiPropertyOptional({ description: '클라이언트', example: '레피소드' })
  @IsOptional()
  @IsString()
  client?: string;

  @ApiProperty({ description: '카테고리', example: '웹' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: '기간', example: '2026.01 - 2026.06' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({ description: '기술 스택', example: ['React', 'NestJS'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @ApiPropertyOptional({ description: '키워드' })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiPropertyOptional({ description: '썸네일 URL' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: '이미지 URL 목록' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: '설명' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '영문 설명' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: '일문 설명' })
  @IsOptional()
  @IsString()
  descriptionJa?: string;

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}

export class UpdatePortfolioDto {
  @ApiPropertyOptional({ description: '포트폴리오 제목' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '영문 제목' })
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: '일문 제목' })
  @IsOptional()
  @IsString()
  titleJa?: string;

  @ApiPropertyOptional({ description: '클라이언트' })
  @IsOptional()
  @IsString()
  client?: string;

  @ApiPropertyOptional({ description: '카테고리' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '기간' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({ description: '기술 스택' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];

  @ApiPropertyOptional({ description: '키워드' })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiPropertyOptional({ description: '썸네일 URL' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: '이미지 URL 목록' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: '설명' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '영문 설명' })
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: '일문 설명' })
  @IsOptional()
  @IsString()
  descriptionJa?: string;

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}
