import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateAdminUserDto, UpdateAdminUserDto, CreateRoleDto, CreateMenuPermissionDto, SetRolePermissionDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // ── AdminUser CRUD ─────────────────────────────────────
  async findAllUsers() {
    return this.prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true },
    });
  }

  async findOneUser(id: number) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException(`AdminUser #${id} not found`);
    return user;
  }

  async createUser(dto: CreateAdminUserDto) {
    const exists = await this.prisma.adminUser.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('이미 사용 중인 이메일입니다.');
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.adminUser.create({
      data: { ...dto, password: hashedPassword },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
  }

  async updateUser(id: number, dto: UpdateAdminUserDto) {
    await this.findOneUser(id);
    return this.prisma.adminUser.update({
      where: { id },
      data: dto,
      select: { id: true, email: true, name: true, role: true, isActive: true, updatedAt: true },
    });
  }

  async removeUser(id: number) {
    await this.findOneUser(id);
    return this.prisma.adminUser.delete({ where: { id } });
  }

  // ── Role ───────────────────────────────────────────────
  async findAllRoles() {
    return this.prisma.role.findMany({ include: { permissions: { include: { menu: true } } } });
  }

  async createRole(dto: CreateRoleDto) {
    return this.prisma.role.create({ data: dto });
  }

  async removeRole(id: number) {
    return this.prisma.role.delete({ where: { id } });
  }

  // ── MenuPermission ─────────────────────────────────────
  async findAllMenus() {
    return this.prisma.menuPermission.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createMenu(dto: CreateMenuPermissionDto) {
    return this.prisma.menuPermission.create({ data: dto });
  }

  async removeMenu(id: number) {
    return this.prisma.menuPermission.delete({ where: { id } });
  }

  // ── RolePermission ─────────────────────────────────────
  async setRolePermission(roleId: number, menuId: number, dto: SetRolePermissionDto) {
    return this.prisma.rolePermission.upsert({
      where: { roleId_menuId: { roleId, menuId } },
      create: { roleId, menuId, ...dto },
      update: dto,
    });
  }
}
