import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

// CodyCompany
export class CreateCodyCompanyDto {
  @IsString() name: string;
  @IsOptional() @IsString() businessNumber?: string;
  @IsOptional() @IsString() ceoName?: string;
  @IsOptional() @IsString() ceoPhone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() memo?: string;
}

export class UpdateCodyCompanyDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() businessNumber?: string;
  @IsOptional() @IsString() ceoName?: string;
  @IsOptional() @IsString() ceoPhone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() memo?: string;
}

// CodyProject
export class CreateCodyProjectDto {
  @IsString() name: string;
  @IsOptional() @IsString() status?: string;
  @IsInt() @Type(() => Number) companyId: number;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsString() description?: string;
}

export class UpdateCodyProjectDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsInt() @Type(() => Number) companyId?: number;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsString() description?: string;
}

// CodyCredit
export class CreateCodyCreditDto {
  @IsString() type: string; // CHARGE, USE, REFUND, ADJUST
  @IsInt() @Type(() => Number) companyId: number;
  @IsOptional() @IsInt() @Type(() => Number) projectId?: number;
  @IsOptional() @IsString() description?: string;
  @IsString() amount: string; // Decimal as string
  @IsOptional() @IsString() manager?: string;
}

// CodyNotification
export class CreateCodyNotificationDto {
  @IsInt() @Type(() => Number) companyId: number;
  @IsString() companyName: string;
  @IsString() content: string;
}

export class UpdateCodyNotificationStatusDto {
  @IsString() status: string; // SENT, PENDING, FAILED, READ
}

// CodyWeeklyReport
export class CreateCodyWeeklyReportDto {
  @IsInt() @Type(() => Number) companyId: number;
  @IsInt() @Type(() => Number) projectId: number;
  @IsString() title: string;
  @IsOptional() @IsDateString() periodStart?: string;
  @IsOptional() @IsDateString() periodEnd?: string;
  @IsOptional() @IsString() content?: string;
}

export class UpdateCodyWeeklyReportDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsDateString() periodStart?: string;
  @IsOptional() @IsDateString() periodEnd?: string;
  @IsOptional() @IsString() content?: string;
}
