import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: '서비스 제목', example: '웹 개발' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '영문 제목' })
  @IsOptional() @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: '일문 제목' })
  @IsOptional() @IsString()
  titleJa?: string;

  @ApiProperty({ description: 'URL 슬러그', example: 'web-development' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'SEO 제목' })
  @IsOptional() @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO 설명' })
  @IsOptional() @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ description: '서비스 상세 내용 (HTML)' })
  @IsOptional() @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '아이콘' })
  @IsOptional() @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '썸네일 URL' })
  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional() @IsBoolean()
  published?: boolean;
}

export class UpdateServiceDto {
  @ApiPropertyOptional({ description: '서비스 제목' })
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '영문 제목' })
  @IsOptional() @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: '일문 제목' })
  @IsOptional() @IsString()
  titleJa?: string;

  @ApiPropertyOptional({ description: 'URL 슬러그' })
  @IsOptional() @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'SEO 제목' })
  @IsOptional() @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO 설명' })
  @IsOptional() @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ description: '서비스 상세 내용' })
  @IsOptional() @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '아이콘' })
  @IsOptional() @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '썸네일 URL' })
  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional() @IsBoolean()
  published?: boolean;
}
