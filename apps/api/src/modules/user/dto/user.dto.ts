import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

// AdminUser 관리 DTO
export class CreateAdminUserDto {
  @IsEmail() email: string;
  @IsString() password: string;
  @IsString() name: string;
  @IsOptional() @IsString() role?: string;
}

export class UpdateAdminUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

// Role
export class CreateRoleDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
}

// MenuPermission
export class CreateMenuPermissionDto {
  @IsString() menuKey: string;
  @IsString() menuName: string;
  @IsOptional() @IsString() parentKey?: string;
}

// RolePermission
export class SetRolePermissionDto {
  @IsOptional() @IsBoolean() canRead?: boolean;
  @IsOptional() @IsBoolean() canWrite?: boolean;
  @IsOptional() @IsBoolean() canDelete?: boolean;
}
