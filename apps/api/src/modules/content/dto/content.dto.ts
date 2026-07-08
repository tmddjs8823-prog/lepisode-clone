import { IsString, IsOptional, IsBoolean, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Certificate
export class CreateCertificateDto {
  @IsString() title: string;
  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() titleJa?: string;
  @IsOptional() @IsString() issuer?: string;
  @IsOptional() @IsDateString() issueDate?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) sortOrder?: number;
}

export class UpdateCertificateDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() titleJa?: string;
  @IsOptional() @IsString() issuer?: string;
  @IsOptional() @IsDateString() issueDate?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) sortOrder?: number;
}

// Event
export class CreateEventDto {
  @IsString() title: string;
  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() titleJa?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() linkUrl?: string;
  @IsOptional() @IsString() attachmentUrl?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsDateString() selectedDate?: string;
  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdateEventDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() titleJa?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() linkUrl?: string;
  @IsOptional() @IsString() attachmentUrl?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsDateString() selectedDate?: string;
  @IsOptional() @IsBoolean() published?: boolean;
}

// Popup
export class CreatePopupDto {
  @IsString() title: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() linkUrl?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) sortOrder?: number;
  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdatePopupDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() linkUrl?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) sortOrder?: number;
  @IsOptional() @IsBoolean() published?: boolean;
}

// Terms
export class UpsertTermsDto {
  @IsString() type: string;
  @IsString() title: string;
  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() titleJa?: string;
  @IsString() content: string;
  @IsOptional() @IsString() contentEn?: string;
  @IsOptional() @IsString() contentJa?: string;
}

// QrCode
export class CreateQrCodeDto {
  @IsString() name: string;
  @IsOptional() @IsString() type?: string;
  @IsString() targetUrl: string;
}

export class UpdateQrCodeDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() targetUrl?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
