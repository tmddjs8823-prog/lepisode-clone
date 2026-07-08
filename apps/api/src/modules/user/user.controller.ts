import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAdminUserDto, UpdateAdminUserDto, CreateRoleDto, CreateMenuPermissionDto, SetRolePermissionDto } from './dto/user.dto';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly service: UserService) {}

  // AdminUser
  @Get()
  findAll() { return this.service.findAllUsers(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOneUser(id); }

  @Post()
  create(@Body() dto: CreateAdminUserDto) { return this.service.createUser(dto); }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminUserDto) { return this.service.updateUser(id, dto); }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.removeUser(id); }

  // Role
  @Get('roles/list')
  findRoles() { return this.service.findAllRoles(); }

  @Post('roles')
  createRole(@Body() dto: CreateRoleDto) { return this.service.createRole(dto); }

  @Delete('roles/:id')
  removeRole(@Param('id', ParseIntPipe) id: number) { return this.service.removeRole(id); }

  // MenuPermission
  @Get('menus/list')
  findMenus() { return this.service.findAllMenus(); }

  @Post('menus')
  createMenu(@Body() dto: CreateMenuPermissionDto) { return this.service.createMenu(dto); }

  @Delete('menus/:id')
  removeMenu(@Param('id', ParseIntPipe) id: number) { return this.service.removeMenu(id); }

  // RolePermission
  @Put('roles/:roleId/menus/:menuId')
  setPermission(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('menuId', ParseIntPipe) menuId: number,
    @Body() dto: SetRolePermissionDto,
  ) {
    return this.service.setRolePermission(roleId, menuId, dto);
  }
}
