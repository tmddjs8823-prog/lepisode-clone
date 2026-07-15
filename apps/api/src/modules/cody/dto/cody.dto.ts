import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// CodyCompany
export class CreateCodyCompanyDto {
  @ApiProperty({ description: '업체명', example: '레피소드' })
  @IsString() name: string;
  @ApiPropertyOptional({ description: '사업자번호' })
  @IsOptional() @IsString() businessNumber?: string;
  @ApiPropertyOptional({ description: '대표자명' })
  @IsOptional() @IsString() ceoName?: string;
  @ApiPropertyOptional({ description: '대표 연락처' })
  @IsOptional() @IsString() ceoPhone?: string;
  @ApiPropertyOptional({ description: '기업 연락처' })
  @IsOptional() @IsString() companyPhone?: string;
  @ApiPropertyOptional({ description: '기업 이메일' })
  @IsOptional() @IsString() companyEmail?: string;
  @ApiPropertyOptional({ description: '주소' })
  @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional({ description: '상세 주소' })
  @IsOptional() @IsString() addressDetail?: string;
  @ApiPropertyOptional({ description: '홈페이지' })
  @IsOptional() @IsString() homepage?: string;
  @ApiPropertyOptional({ description: '사업자 등록증 URL' })
  @IsOptional() @IsString() bizFileUrl?: string;
  @ApiPropertyOptional({ description: '이메일' })
  @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional({ description: '메모' })
  @IsOptional() @IsString() memo?: string;
}

export class UpdateCodyCompanyDto {
  @ApiPropertyOptional({ description: '업체명' })
  @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional({ description: '사업자번호' })
  @IsOptional() @IsString() businessNumber?: string;
  @ApiPropertyOptional({ description: '대표자명' })
  @IsOptional() @IsString() ceoName?: string;
  @ApiPropertyOptional({ description: '대표 연락처' })
  @IsOptional() @IsString() ceoPhone?: string;
  @ApiPropertyOptional({ description: '기업 연락처' })
  @IsOptional() @IsString() companyPhone?: string;
  @ApiPropertyOptional({ description: '기업 이메일' })
  @IsOptional() @IsString() companyEmail?: string;
  @ApiPropertyOptional({ description: '주소' })
  @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional({ description: '상세 주소' })
  @IsOptional() @IsString() addressDetail?: string;
  @ApiPropertyOptional({ description: '홈페이지' })
  @IsOptional() @IsString() homepage?: string;
  @ApiPropertyOptional({ description: '사업자 등록증 URL' })
  @IsOptional() @IsString() bizFileUrl?: string;
  @ApiPropertyOptional({ description: '이메일' })
  @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional({ description: '메모' })
  @IsOptional() @IsString() memo?: string;
}

// CodyProject
export class CreateCodyProjectDto {
  @ApiProperty({ description: '프로젝트명', example: '웹 리뉴얼' })
  @IsString() name: string;
  @ApiPropertyOptional({ description: '상태 (진행중/완료/대기)', example: '진행중' })
  @IsOptional() @IsString() status?: string;
  @ApiProperty({ description: '업체 ID', example: 1 })
  @IsInt() @Type(() => Number) companyId: number;
  @ApiPropertyOptional({ description: '시작일', example: '2026-01-01' })
  @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional({ description: '종료일', example: '2026-06-30' })
  @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional({ description: '설명' })
  @IsOptional() @IsString() description?: string;
}

export class UpdateCodyProjectDto {
  @ApiPropertyOptional({ description: '프로젝트명' })
  @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional({ description: '상태' })
  @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ description: '업체 ID' })
  @IsOptional() @IsInt() @Type(() => Number) companyId?: number;
  @ApiPropertyOptional({ description: '시작일' })
  @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional({ description: '종료일' })
  @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional({ description: '설명' })
  @IsOptional() @IsString() description?: string;
}

// CodyCredit
export class CreateCodyCreditDto {
  @ApiProperty({ description: '유형 (CHARGE, USE, REFUND, ADJUST)', example: 'CHARGE' })
  @IsString() type: string; // CHARGE, USE, REFUND, ADJUST
  @ApiProperty({ description: '업체 ID', example: 1 })
  @IsInt() @Type(() => Number) companyId: number;
  @ApiPropertyOptional({ description: '프로젝트 ID' })
  @IsOptional() @IsInt() @Type(() => Number) projectId?: number;
  @ApiPropertyOptional({ description: '설명' })
  @IsOptional() @IsString() description?: string;
  @ApiProperty({ description: '금액 (Decimal 문자열)', example: '100000' })
  @IsString() amount: string; // Decimal as string
  @ApiPropertyOptional({ description: '담당자' })
  @IsOptional() @IsString() manager?: string;
}

// CodyNotification
export class CreateCodyNotificationDto {
  @ApiProperty({ description: '업체 ID', example: 1 })
  @IsInt() @Type(() => Number) companyId: number;
  @ApiProperty({ description: '업체명', example: '레피소드' })
  @IsString() companyName: string;
  @ApiProperty({ description: '알림 내용' })
  @IsString() content: string;
}

export class UpdateCodyNotificationStatusDto {
  @ApiProperty({ description: '상태 (SENT, PENDING, FAILED, READ)', example: 'SENT' })
  @IsString() status: string; // SENT, PENDING, FAILED, READ
}

// CodyWeeklyReport
export class CreateCodyWeeklyReportDto {
  @ApiProperty({ description: '업체 ID', example: 1 })
  @IsInt() @Type(() => Number) companyId: number;
  @ApiProperty({ description: '프로젝트 ID', example: 1 })
  @IsInt() @Type(() => Number) projectId: number;
  @ApiProperty({ description: '보고서 제목', example: '7월 2주차 주간보고' })
  @IsString() title: string;
  @ApiPropertyOptional({ description: '보고 시작일' })
  @IsOptional() @IsDateString() periodStart?: string;
  @ApiPropertyOptional({ description: '보고 종료일' })
  @IsOptional() @IsDateString() periodEnd?: string;
  @ApiPropertyOptional({ description: '보고 내용 (JSON)' })
  @IsOptional() @IsString() content?: string;
}

export class UpdateCodyWeeklyReportDto {
  @ApiPropertyOptional({ description: '보고서 제목' })
  @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional({ description: '보고 시작일' })
  @IsOptional() @IsDateString() periodStart?: string;
  @ApiPropertyOptional({ description: '보고 종료일' })
  @IsOptional() @IsDateString() periodEnd?: string;
  @ApiPropertyOptional({ description: '보고 내용' })
  @IsOptional() @IsString() content?: string;
}
