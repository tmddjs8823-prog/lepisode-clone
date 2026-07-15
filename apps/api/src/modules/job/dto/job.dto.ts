import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobPostingDto {
  @ApiProperty({ description: '채용공고 제목', example: 'Frontend 개발자' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '영문 제목' })
  @IsOptional() @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: '일문 제목' })
  @IsOptional() @IsString()
  titleJa?: string;

  @ApiPropertyOptional({ description: '카테고리', example: '개발' })
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '채용 공고 URL' })
  @IsOptional() @IsString()
  jobUrl?: string;

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional() @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: '시작일' })
  @IsOptional() @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '마감일' })
  @IsOptional() @IsDateString()
  deadline?: string;
}

export class UpdateJobPostingDto {
  @ApiPropertyOptional({ description: '채용공고 제목' })
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '영문 제목' })
  @IsOptional() @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: '일문 제목' })
  @IsOptional() @IsString()
  titleJa?: string;

  @ApiPropertyOptional({ description: '카테고리' })
  @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '채용 공고 URL' })
  @IsOptional() @IsString()
  jobUrl?: string;

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional() @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: '시작일' })
  @IsOptional() @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '마감일' })
  @IsOptional() @IsDateString()
  deadline?: string;
}
