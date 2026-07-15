import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Company Info
export class UpsertCompanyInfoDto {
  @ApiProperty({ description: '값', example: '레피소드' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ description: '영문 값' })
  @IsOptional() @IsString()
  valueEn?: string;

  @ApiPropertyOptional({ description: '일문 값' })
  @IsOptional() @IsString()
  valueJa?: string;
}

// Team Member
export class CreateTeamMemberDto {
  @ApiProperty({ description: '이름', example: '홍길동' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '영문 이름' })
  @IsOptional() @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: '일문 이름' })
  @IsOptional() @IsString()
  nameJa?: string;

  @ApiProperty({ description: '직책', example: 'CTO' })
  @IsString()
  position: string;

  @ApiPropertyOptional({ description: '영문 직책' })
  @IsOptional() @IsString()
  positionEn?: string;

  @ApiPropertyOptional({ description: '일문 직책' })
  @IsOptional() @IsString()
  positionJa?: string;

  @ApiPropertyOptional({ description: '프로필 이미지 URL' })
  @IsOptional() @IsString()
  profileImageUrl?: string;

  @ApiPropertyOptional({ description: '소개' })
  @IsOptional() @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: '영문 소개' })
  @IsOptional() @IsString()
  bioEn?: string;

  @ApiPropertyOptional({ description: '일문 소개' })
  @IsOptional() @IsString()
  bioJa?: string;

  @ApiPropertyOptional({ description: '정렬 순서', example: 0 })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

export class UpdateTeamMemberDto {
  @ApiPropertyOptional({ description: '이름' })
  @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '영문 이름' })
  @IsOptional() @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: '일문 이름' })
  @IsOptional() @IsString()
  nameJa?: string;

  @ApiPropertyOptional({ description: '직책' })
  @IsOptional() @IsString()
  position?: string;

  @ApiPropertyOptional({ description: '영문 직책' })
  @IsOptional() @IsString()
  positionEn?: string;

  @ApiPropertyOptional({ description: '일문 직책' })
  @IsOptional() @IsString()
  positionJa?: string;

  @ApiPropertyOptional({ description: '프로필 이미지 URL' })
  @IsOptional() @IsString()
  profileImageUrl?: string;

  @ApiPropertyOptional({ description: '소개' })
  @IsOptional() @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: '영문 소개' })
  @IsOptional() @IsString()
  bioEn?: string;

  @ApiPropertyOptional({ description: '일문 소개' })
  @IsOptional() @IsString()
  bioJa?: string;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

// Company History
export class CreateCompanyHistoryDto {
  @ApiProperty({ description: '연도', example: 2026 })
  @IsInt()
  @Type(() => Number)
  year: number;

  @ApiPropertyOptional({ description: '월 (1~12)', example: 7 })
  @IsOptional() @IsInt() @Type(() => Number)
  month?: number;

  @ApiProperty({ description: '제목', example: '본사 이전' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '영문 제목' })
  @IsOptional() @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: '일문 제목' })
  @IsOptional() @IsString()
  titleJa?: string;

  @ApiPropertyOptional({ description: '설명' })
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '영문 설명' })
  @IsOptional() @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: '일문 설명' })
  @IsOptional() @IsString()
  descriptionJa?: string;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

export class UpdateCompanyHistoryDto {
  @ApiPropertyOptional({ description: '연도' })
  @IsOptional() @IsInt() @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ description: '월' })
  @IsOptional() @IsInt() @Type(() => Number)
  month?: number;

  @ApiPropertyOptional({ description: '제목' })
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '영문 제목' })
  @IsOptional() @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: '일문 제목' })
  @IsOptional() @IsString()
  titleJa?: string;

  @ApiPropertyOptional({ description: '설명' })
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '영문 설명' })
  @IsOptional() @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: '일문 설명' })
  @IsOptional() @IsString()
  descriptionJa?: string;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}
