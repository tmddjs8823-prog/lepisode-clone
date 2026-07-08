import { IsString, IsOptional, IsBoolean, IsInt, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

// SupportProject
export class CreateSupportProjectDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional() @IsBoolean()
  published?: boolean;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

export class UpdateSupportProjectDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  slug?: string;

  @IsOptional() @IsBoolean()
  published?: boolean;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

// ProjectStatus
export class CreateProjectStatusDto {
  @IsString()
  title: string;

  @IsOptional() @IsString()
  titleEn?: string;

  @IsOptional() @IsString()
  titleJa?: string;

  @IsString()
  client: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  platforms?: string[];

  @IsOptional() @IsString()
  startDate?: string;

  @IsOptional() @IsString()
  endDate?: string;

  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  attachmentUrl?: string;

  @IsOptional() @IsString()
  memo?: string;

  @IsOptional() @IsString()
  content?: string;

  @IsOptional() @IsBoolean()
  published?: boolean;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

export class UpdateProjectStatusDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  titleEn?: string;

  @IsOptional() @IsString()
  titleJa?: string;

  @IsOptional() @IsString()
  client?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  platforms?: string[];

  @IsOptional() @IsString()
  startDate?: string;

  @IsOptional() @IsString()
  endDate?: string;

  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  attachmentUrl?: string;

  @IsOptional() @IsString()
  memo?: string;

  @IsOptional() @IsString()
  content?: string;

  @IsOptional() @IsBoolean()
  published?: boolean;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}
