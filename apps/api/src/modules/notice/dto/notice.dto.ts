import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateNoticeDto {
  @IsString()
  title: string;

  @IsOptional() @IsString()
  titleEn?: string;

  @IsOptional() @IsString()
  titleJa?: string;

  @IsString()
  content: string;

  @IsOptional() @IsString()
  contentEn?: string;

  @IsOptional() @IsString()
  contentJa?: string;

  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @IsOptional() @IsBoolean()
  published?: boolean;

  @IsOptional() @IsBoolean()
  isPinned?: boolean;
}

export class UpdateNoticeDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  titleEn?: string;

  @IsOptional() @IsString()
  titleJa?: string;

  @IsOptional() @IsString()
  content?: string;

  @IsOptional() @IsString()
  contentEn?: string;

  @IsOptional() @IsString()
  contentJa?: string;

  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @IsOptional() @IsBoolean()
  published?: boolean;

  @IsOptional() @IsBoolean()
  isPinned?: boolean;
}
