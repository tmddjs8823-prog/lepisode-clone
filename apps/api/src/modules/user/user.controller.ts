import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAdminUserDto, UpdateAdminUserDto, CreateRoleDto, CreateMenuPermissionDto, SetRolePermissionDto } from './dto/user.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly service: UserService) {}

  // ── AdminUser (목록/생성) ──────────────────────────────
  @ApiOperation({ summary: '관리자 목록 조회' })
  @Get()
  findAll() { return this.service.findAllUsers(); }

  @ApiOperation({ summary: '관리자 생성' })
  @Post()
  create(@Body() dto: CreateAdminUserDto) { return this.service.createUser(dto); }

  // ── Role (반드시 :id 라우트보다 앞에 선언) ─────────────
  @ApiOperation({ summary: '역할 목록 조회' })
  @Get('roles/list')
  findRoles() { return this.service.findAllRoles(); }

  @ApiOperation({ summary: '역할 생성' })
  @Post('roles')
  createRole(@Body() dto: CreateRoleDto) { return this.service.createRole(dto); }

  @ApiOperation({ summary: '역할 수정' })
  @Put('roles/:id')
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateRoleDto) { return this.service.updateRole(id, dto); }

  @ApiOperation({ summary: '역할 삭제' })
  @Delete('roles/:id')
  removeRole(@Param('id', ParseIntPipe) id: number) { return this.service.removeRole(id); }

  // ── RolePermission ─────────────────────────────────────
  @ApiOperation({ summary: '역할에 권한 등록' })
  @Post('roles/:roleId/permissions')
  createPermission(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: SetRolePermissionDto,
  ) {
    return this.service.createPermission(roleId, dto);
  }

  @ApiOperation({ summary: '역할 권한 수정' })
  @Put('roles/:roleId/permissions/:permId')
  updatePermission(
    @Param('permId', ParseIntPipe) permId: number,
    @Body() dto: SetRolePermissionDto,
  ) {
    return this.service.updatePermission(permId, dto);
  }

  @ApiOperation({ summary: '역할 권한 삭제' })
  @Delete('roles/:roleId/permissions/:permId')
  removePermission(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permId', ParseIntPipe) permId: number,
  ) {
    return this.service.removePermission(permId);
  }

  // ── MenuPermission ─────────────────────────────────────
  @ApiOperation({ summary: '메뉴 권한 목록 조회' })
  @Get('menus/list')
  findMenus() { return this.service.findAllMenus(); }

  @ApiOperation({ summary: '메뉴 권한 생성' })
  @Post('menus')
  createMenu(@Body() dto: CreateMenuPermissionDto) { return this.service.createMenu(dto); }

  @ApiOperation({ summary: '메뉴 권한 삭제' })
  @Delete('menus/:id')
  removeMenu(@Param('id', ParseIntPipe) id: number) { return this.service.removeMenu(id); }

  // ── AdminUser (상세/수정/삭제 — 반드시 마지막에 선언) ──
  @ApiOperation({ summary: '관리자 상세 조회' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOneUser(id); }

  @ApiOperation({ summary: '관리자 수정' })
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminUserDto) { return this.service.updateUser(id, dto); }

  @ApiOperation({ summary: '관리자 삭제' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.removeUser(id); }
}
