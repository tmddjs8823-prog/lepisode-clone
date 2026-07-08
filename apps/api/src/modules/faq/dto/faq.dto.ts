import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

// FAQ Category
export class CreateFaqCategoryDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  nameEn?: string;

  @IsOptional() @IsString()
  nameJa?: string;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

export class UpdateFaqCategoryDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  nameEn?: string;

  @IsOptional() @IsString()
  nameJa?: string;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

// FAQ
export class CreateFaqDto {
  @IsString()
  question: string;

  @IsOptional() @IsString()
  questionEn?: string;

  @IsOptional() @IsString()
  questionJa?: string;

  @IsString()
  answer: string;

  @IsOptional() @IsString()
  answerEn?: string;

  @IsOptional() @IsString()
  answerJa?: string;

  @IsOptional() @IsBoolean()
  published?: boolean;

  @IsInt()
  @Type(() => Number)
  categoryId: number;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

export class UpdateFaqDto {
  @IsOptional() @IsString()
  question?: string;

  @IsOptional() @IsString()
  questionEn?: string;

  @IsOptional() @IsString()
  questionJa?: string;

  @IsOptional() @IsString()
  answer?: string;

  @IsOptional() @IsString()
  answerEn?: string;

  @IsOptional() @IsString()
  answerJa?: string;

  @IsOptional() @IsBoolean()
  published?: boolean;

  @IsOptional() @IsInt() @Type(() => Number)
  categoryId?: number;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}
