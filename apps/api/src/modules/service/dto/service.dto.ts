import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @IsString()
  title: string;

  @IsOptional() @IsString()
  titleEn?: string;

  @IsOptional() @IsString()
  titleJa?: string;

  @IsString()
  slug: string;

  @IsOptional() @IsString()
  seoTitle?: string;

  @IsOptional() @IsString()
  seoDescription?: string;

  @IsOptional() @IsString()
  content?: string;

  @IsOptional() @IsString()
  icon?: string;

  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;

  @IsOptional() @IsBoolean()
  published?: boolean;
}

export class UpdateServiceDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  titleEn?: string;

  @IsOptional() @IsString()
  titleJa?: string;

  @IsOptional() @IsString()
  slug?: string;

  @IsOptional() @IsString()
  seoTitle?: string;

  @IsOptional() @IsString()
  seoDescription?: string;

  @IsOptional() @IsString()
  content?: string;

  @IsOptional() @IsString()
  icon?: string;

  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;

  @IsOptional() @IsBoolean()
  published?: boolean;
}
