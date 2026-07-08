import { IsString, IsOptional } from 'class-validator';

// Translation
export class UpsertTranslationDto {
  @IsString() key: string;
  @IsString() ko: string;
  @IsOptional() @IsString() en?: string;
  @IsOptional() @IsString() ja?: string;
}

// SeoConfig
export class UpsertSeoConfigDto {
  @IsString() pagePath: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() titleEn?: string;
  @IsOptional() @IsString() titleJa?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() descriptionEn?: string;
  @IsOptional() @IsString() descriptionJa?: string;
  @IsOptional() @IsString() keywords?: string;
  @IsOptional() @IsString() ogImageUrl?: string;
}
