import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// FAQ Category
export class CreateFaqCategoryDto {
  @ApiProperty({ description: '카테고리명', example: '일반' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '영문 카테고리명' })
  @IsOptional() @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: '일문 카테고리명' })
  @IsOptional() @IsString()
  nameJa?: string;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

export class UpdateFaqCategoryDto {
  @ApiPropertyOptional({ description: '카테고리명' })
  @IsOptional() @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '영문 카테고리명' })
  @IsOptional() @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: '일문 카테고리명' })
  @IsOptional() @IsString()
  nameJa?: string;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

// FAQ
export class CreateFaqDto {
  @ApiProperty({ description: '질문' })
  @IsString()
  question: string;

  @ApiPropertyOptional({ description: '영문 질문' })
  @IsOptional() @IsString()
  questionEn?: string;

  @ApiPropertyOptional({ description: '일문 질문' })
  @IsOptional() @IsString()
  questionJa?: string;

  @ApiProperty({ description: '답변' })
  @IsString()
  answer: string;

  @ApiPropertyOptional({ description: '영문 답변' })
  @IsOptional() @IsString()
  answerEn?: string;

  @ApiPropertyOptional({ description: '일문 답변' })
  @IsOptional() @IsString()
  answerJa?: string;

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional() @IsBoolean()
  published?: boolean;

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  @IsInt()
  @Type(() => Number)
  categoryId: number;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}

export class UpdateFaqDto {
  @ApiPropertyOptional({ description: '질문' })
  @IsOptional() @IsString()
  question?: string;

  @ApiPropertyOptional({ description: '영문 질문' })
  @IsOptional() @IsString()
  questionEn?: string;

  @ApiPropertyOptional({ description: '일문 질문' })
  @IsOptional() @IsString()
  questionJa?: string;

  @ApiPropertyOptional({ description: '답변' })
  @IsOptional() @IsString()
  answer?: string;

  @ApiPropertyOptional({ description: '영문 답변' })
  @IsOptional() @IsString()
  answerEn?: string;

  @ApiPropertyOptional({ description: '일문 답변' })
  @IsOptional() @IsString()
  answerJa?: string;

  @ApiPropertyOptional({ description: '공개 여부' })
  @IsOptional() @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: '카테고리 ID' })
  @IsOptional() @IsInt() @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({ description: '정렬 순서' })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  sortOrder?: number;
}
