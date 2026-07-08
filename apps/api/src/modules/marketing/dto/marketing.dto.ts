import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

// MarketingConsent
export class CreateMarketingConsentDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string;
}

// MarketingCompany
export class CreateMarketingCompanyDto {
  @IsString() name: string;
  @IsOptional() @IsString() contactPerson?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() serviceType?: string;
  @IsOptional() @IsString() memo?: string;
}

export class UpdateMarketingCompanyDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() contactPerson?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() serviceType?: string;
  @IsOptional() @IsString() memo?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
