import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoticeDto {
  @ApiProperty({ description: '공지사항 제목', example: '서비스 점검 안내' })
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

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional() @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: '고정 여부' })
  @IsOptional() @IsBoolean()
  isPinned?: boolean;
}

export class UpdateNoticeDto {
  @ApiPropertyOptional({ description: '공지사항 제목' })
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '영문 제목' })
  @IsOptional() @IsString()
  titleEn?: string;

  @ApiPropertyOptional({ description: '일문 제목' })
  @IsOptional() @IsString()
  titleJa?: string;

  @ApiPropertyOptional({ description: '본문 내용' })
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

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional() @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: '고정 여부' })
  @IsOptional() @IsBoolean()
  isPinned?: boolean;
}
