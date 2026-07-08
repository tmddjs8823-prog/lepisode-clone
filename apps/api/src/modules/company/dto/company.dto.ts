import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

// Company Info
export class UpsertCompanyInfoDto {
  @IsString()
  value: string;

  @IsOptional() @IsString()
  valueEn?: string;

  @IsOptional() @IsString()
  valueJa?: string;
}

// Team Member
export class CreateTeamMemberDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  nameEn?: string;

  @IsOptional() @IsString()
  nameJa?: string;

  @IsString()
  position: string;

  @IsOptional() @IsString()
  positionEn?: string;

  @IsOptional() @IsString()
  positionJa?: string;

  @IsOptional() @IsString()
  profileImageUrl?: string;

  @IsOptional() @IsString()
  bio?: string;

  @IsOptional() @IsString()
  bioEn?: string;

  @IsOptional() @IsString()
  bioJa?: string;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

export class UpdateTeamMemberDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  nameEn?: string;

  @IsOptional() @IsString()
  nameJa?: string;

  @IsOptional() @IsString()
  position?: string;

  @IsOptional() @IsString()
  positionEn?: string;

  @IsOptional() @IsString()
  positionJa?: string;

  @IsOptional() @IsString()
  profileImageUrl?: string;

  @IsOptional() @IsString()
  bio?: string;

  @IsOptional() @IsString()
  bioEn?: string;

  @IsOptional() @IsString()
  bioJa?: string;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

// Company History
export class CreateCompanyHistoryDto {
  @IsInt()
  @Type(() => Number)
  year: number;

  @IsOptional() @IsInt() @Type(() => Number)
  month?: number;

  @IsString()
  title: string;

  @IsOptional() @IsString()
  titleEn?: string;

  @IsOptional() @IsString()
  titleJa?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  descriptionEn?: string;

  @IsOptional() @IsString()
  descriptionJa?: string;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

export class UpdateCompanyHistoryDto {
  @IsOptional() @IsInt() @Type(() => Number)
  year?: number;

  @IsOptional() @IsInt() @Type(() => Number)
  month?: number;

  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  titleEn?: string;

  @IsOptional() @IsString()
  titleJa?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  descriptionEn?: string;

  @IsOptional() @IsString()
  descriptionJa?: string;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}
