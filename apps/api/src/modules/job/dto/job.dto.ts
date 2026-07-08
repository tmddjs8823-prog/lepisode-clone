import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateJobPostingDto {
  @IsString()
  title: string;

  @IsOptional() @IsString()
  titleEn?: string;

  @IsOptional() @IsString()
  titleJa?: string;

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString()
  jobUrl?: string;

  @IsOptional() @IsBoolean()
  published?: boolean;

  @IsOptional() @IsDateString()
  startDate?: string;

  @IsOptional() @IsDateString()
  deadline?: string;
}

export class UpdateJobPostingDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  titleEn?: string;

  @IsOptional() @IsString()
  titleJa?: string;

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString()
  jobUrl?: string;

  @IsOptional() @IsBoolean()
  published?: boolean;

  @IsOptional() @IsDateString()
  startDate?: string;

  @IsOptional() @IsDateString()
  deadline?: string;
}
