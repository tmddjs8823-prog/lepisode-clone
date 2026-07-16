import { IsString, IsOptional, IsBoolean, IsEmail, IsNumber, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// AdminUser 관리 DTO
export class CreateAdminUserDto {
  @ApiProperty({ description: '이메일', example: 'admin@lepisode.com' })
  @IsEmail() email: string;
  @ApiProperty({ description: '비밀번호', example: 'password123' })
  @IsString() password: string;
  @ApiProperty({ description: '이름', example: '관리자' })
  @IsString() name: string;
  @ApiPropertyOptional({ description: '역할', example: 'admin' })
  @IsOptional() @IsString() role?: string;
  @ApiPropertyOptional({ description: '권한 역할 ID' })
  @IsOptional() @IsInt() @Type(() => Number) roleId?: number;
  @ApiPropertyOptional({ description: '선택 권한명' })
  @IsOptional() @IsString() permission?: string;
}

export class UpdateAdminUserDto {
  @ApiPropertyOptional({ description: '이름' })
  @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional({ description: '역할' })
  @IsOptional() @IsString() role?: string;
  @ApiPropertyOptional({ description: '권한 역할 ID' })
  @IsOptional() @IsInt() @Type(() => Number) roleId?: number;
  @ApiPropertyOptional({ description: '선택 권한명' })
  @IsOptional() @IsString() permission?: string;
  @ApiPropertyOptional({ description: '활성 여부' })
  @IsOptional() @IsBoolean() isActive?: boolean;
}

// Role
export class CreateRoleDto {
  @ApiProperty({ description: '역할명', example: 'editor' })
  @IsString() name: string;
  @ApiPropertyOptional({ description: '설명' })
  @IsOptional() @IsString() description?: string;
}

// MenuPermission
export class CreateMenuPermissionDto {
  @ApiProperty({ description: '메뉴 키', example: 'blog' })
  @IsString() menuKey: string;
  @ApiProperty({ description: '메뉴명', example: '블로그 관리' })
  @IsString() menuName: string;
  @ApiPropertyOptional({ description: '상위 메뉴 키' })
  @IsOptional() @IsString() parentKey?: string;
  @ApiPropertyOptional({ description: '라우트 URL' })
  @IsOptional() @IsString() routeUrl?: string;
  @ApiPropertyOptional({ description: 'API URL' })
  @IsOptional() @IsString() apiUrl?: string;
  @ApiPropertyOptional({ description: '페이지 유형 (조회/등록/수정)' })
  @IsOptional() @IsString() pageType?: string;
}

// RolePermission
export class SetRolePermissionDto {
  @ApiProperty({ description: '권한 레벨', example: 10 })
  @IsNumber() level: number;
  @ApiProperty({ description: '권한명', example: '최고 관리자' })
  @IsString() name: string;
  @ApiPropertyOptional({ description: '설명' })
  @IsOptional() @IsString() description?: string;
}
