import { IsString, IsOptional, IsBoolean, IsArray, IsDateString } from 'class-validator';

export class CreateBlogPostDto {
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

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString()
  subCategory?: string;

  @IsOptional() @IsString()
  author?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @IsOptional() @IsBoolean()
  published?: boolean;

  @IsOptional() @IsDateString()
  publishedAt?: string;
}

export class UpdateBlogPostDto {
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

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString()
  subCategory?: string;

  @IsOptional() @IsString()
  author?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @IsOptional() @IsBoolean()
  published?: boolean;

  @IsOptional() @IsDateString()
  publishedAt?: string;
}
