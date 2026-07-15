import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInquiryDto {
  @ApiProperty({ description: '이름', example: '홍길동' })
  @IsString()
  name: string;

  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: '연락처' })
  @IsOptional() @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '회사명' })
  @IsOptional() @IsString()
  company?: string;

  @ApiPropertyOptional({ description: '예산', example: '1000만원' })
  @IsOptional() @IsString()
  budget?: string;

  @ApiPropertyOptional({ description: '프로젝트 유형', example: '웹사이트' })
  @IsOptional() @IsString()
  projectType?: string;

  @ApiProperty({ description: '문의 내용' })
  @IsString()
  content: string;
}

export class UpdateInquiryStatusDto {
  @ApiProperty({ description: '상태 (NEW/CONFIRMED/REPLIED/CLOSED)', example: 'CONFIRMED' })
  @IsString()
  status: string;

  @ApiPropertyOptional({ description: '관리자 메모' })
  @IsOptional() @IsString()
  adminMemo?: string;
}
