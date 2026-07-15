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
      select: { id: true, email: true, name: true, role: true, roleId: true, roleRef: { select: { id: true, name: true } }, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true },
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
    return this.prisma.role.findMany({ include: { permissions: true } });
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
    try {
      return await this.prisma.menuPermission.create({ data: dto });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('이미 존재하는 메뉴 키입니다.');
      }
      throw e;
    }
  }

  async removeMenu(id: number) {
    return this.prisma.menuPermission.delete({ where: { id } });
  }

  // ── RolePermission ─────────────────────────────────────
  async createPermission(roleId: number, dto: SetRolePermissionDto) {
    return this.prisma.rolePermission.create({
      data: {
        roleId,
        level: dto.level,
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async removePermission(id: number) {
    return this.prisma.rolePermission.delete({ where: { id } });
  }

  async updatePermission(id: number, dto: SetRolePermissionDto) {
    return this.prisma.rolePermission.update({
      where: { id },
      data: {
        level: dto.level,
        name: dto.name,
        description: dto.description,
      },
    });
  }
}
