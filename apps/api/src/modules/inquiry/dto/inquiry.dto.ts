import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  company?: string;

  @IsOptional() @IsString()
  budget?: string;

  @IsOptional() @IsString()
  projectType?: string;

  @IsString()
  content: string;
}

export class UpdateInquiryStatusDto {
  @IsString()
  status: string;

  @IsOptional() @IsString()
  adminMemo?: string;
}
