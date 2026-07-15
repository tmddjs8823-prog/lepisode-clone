import { IsString, IsOptional, IsBoolean, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Certificate
export class CreateCertificateDto {
  @ApiProperty({ description: '인증서 제목' }) @IsString() title: string;
  @ApiPropertyOptional({ description: '영문 제목' }) @IsOptional() @IsString() titleEn?: string;
  @ApiPropertyOptional({ description: '일문 제목' }) @IsOptional() @IsString() titleJa?: string;
  @ApiPropertyOptional({ description: '발급 기관' }) @IsOptional() @IsString() issuer?: string;
  @ApiPropertyOptional({ description: '발급일' }) @IsOptional() @IsDateString() issueDate?: string;
  @ApiPropertyOptional({ description: '이미지 URL' }) @IsOptional() @IsString() imageUrl?: string;
  @ApiPropertyOptional({ description: '정렬 순서' }) @IsOptional() @IsInt() @Min(0) @Type(() => Number) sortOrder?: number;
}

export class UpdateCertificateDto {
  @ApiPropertyOptional({ description: '인증서 제목' }) @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional({ description: '영문 제목' }) @IsOptional() @IsString() titleEn?: string;
  @ApiPropertyOptional({ description: '일문 제목' }) @IsOptional() @IsString() titleJa?: string;
  @ApiPropertyOptional({ description: '발급 기관' }) @IsOptional() @IsString() issuer?: string;
  @ApiPropertyOptional({ description: '발급일' }) @IsOptional() @IsDateString() issueDate?: string;
  @ApiPropertyOptional({ description: '이미지 URL' }) @IsOptional() @IsString() imageUrl?: string;
  @ApiPropertyOptional({ description: '정렬 순서' }) @IsOptional() @IsInt() @Min(0) @Type(() => Number) sortOrder?: number;
}

// Event
export class CreateEventDto {
  @ApiProperty({ description: '이벤트 제목' }) @IsString() title: string;
  @ApiPropertyOptional({ description: '영문 제목' }) @IsOptional() @IsString() titleEn?: string;
  @ApiPropertyOptional({ description: '일문 제목' }) @IsOptional() @IsString() titleJa?: string;
  @ApiPropertyOptional({ description: '설명' }) @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ description: '이미지 URL' }) @IsOptional() @IsString() imageUrl?: string;
  @ApiPropertyOptional({ description: '링크 URL' }) @IsOptional() @IsString() linkUrl?: string;
  @ApiPropertyOptional({ description: '첨부파일 URL' }) @IsOptional() @IsString() attachmentUrl?: string;
  @ApiPropertyOptional({ description: '시작일' }) @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional({ description: '종료일' }) @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional({ description: '선택일' }) @IsOptional() @IsDateString() selectedDate?: string;
  @ApiPropertyOptional({ description: '공개 여부' }) @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdateEventDto {
  @ApiPropertyOptional({ description: '이벤트 제목' }) @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional({ description: '영문 제목' }) @IsOptional() @IsString() titleEn?: string;
  @ApiPropertyOptional({ description: '일문 제목' }) @IsOptional() @IsString() titleJa?: string;
  @ApiPropertyOptional({ description: '설명' }) @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ description: '이미지 URL' }) @IsOptional() @IsString() imageUrl?: string;
  @ApiPropertyOptional({ description: '링크 URL' }) @IsOptional() @IsString() linkUrl?: string;
  @ApiPropertyOptional({ description: '첨부파일 URL' }) @IsOptional() @IsString() attachmentUrl?: string;
  @ApiPropertyOptional({ description: '시작일' }) @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional({ description: '종료일' }) @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional({ description: '선택일' }) @IsOptional() @IsDateString() selectedDate?: string;
  @ApiPropertyOptional({ description: '공개 여부' }) @IsOptional() @IsBoolean() published?: boolean;
}

// Popup
export class CreatePopupDto {
  @ApiProperty({ description: '팝업 제목' }) @IsString() title: string;
  @ApiPropertyOptional({ description: '이미지 URL' }) @IsOptional() @IsString() imageUrl?: string;
  @ApiPropertyOptional({ description: '링크 URL' }) @IsOptional() @IsString() linkUrl?: string;
  @ApiPropertyOptional({ description: '시작일' }) @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional({ description: '종료일' }) @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional({ description: '위치 (center/bottom 등)' }) @IsOptional() @IsString() position?: string;
  @ApiPropertyOptional({ description: '정렬 순서' }) @IsOptional() @IsInt() @Min(0) @Type(() => Number) sortOrder?: number;
  @ApiPropertyOptional({ description: '공개 여부' }) @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdatePopupDto {
  @ApiPropertyOptional({ description: '팝업 제목' }) @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional({ description: '이미지 URL' }) @IsOptional() @IsString() imageUrl?: string;
  @ApiPropertyOptional({ description: '링크 URL' }) @IsOptional() @IsString() linkUrl?: string;
  @ApiPropertyOptional({ description: '시작일' }) @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional({ description: '종료일' }) @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional({ description: '위치' }) @IsOptional() @IsString() position?: string;
  @ApiPropertyOptional({ description: '정렬 순서' }) @IsOptional() @IsInt() @Min(0) @Type(() => Number) sortOrder?: number;
  @ApiPropertyOptional({ description: '공개 여부' }) @IsOptional() @IsBoolean() published?: boolean;
}

// Terms
export class UpsertTermsDto {
  @ApiProperty({ description: '약관 유형 (privacy/service 등)', example: 'privacy' }) @IsString() type: string;
  @ApiProperty({ description: '약관 제목' }) @IsString() title: string;
  @ApiPropertyOptional({ description: '영문 제목' }) @IsOptional() @IsString() titleEn?: string;
  @ApiPropertyOptional({ description: '일문 제목' }) @IsOptional() @IsString() titleJa?: string;
  @ApiProperty({ description: '약관 내용 (HTML)' }) @IsString() content: string;
  @ApiPropertyOptional({ description: '영문 내용' }) @IsOptional() @IsString() contentEn?: string;
  @ApiPropertyOptional({ description: '일문 내용' }) @IsOptional() @IsString() contentJa?: string;
}

// QrCode
export class CreateQrCodeDto {
  @ApiProperty({ description: 'QR코드 이름', example: '메인 페이지' }) @IsString() name: string;
  @ApiPropertyOptional({ description: '유형' }) @IsOptional() @IsString() type?: string;
  @ApiProperty({ description: '대상 URL', example: 'https://lepisode.com' }) @IsString() targetUrl: string;
}

export class UpdateQrCodeDto {
  @ApiPropertyOptional({ description: 'QR코드 이름' }) @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional({ description: '유형' }) @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional({ description: '대상 URL' }) @IsOptional() @IsString() targetUrl?: string;
  @ApiPropertyOptional({ description: '활성 여부' }) @IsOptional() @IsBoolean() isActive?: boolean;
}
