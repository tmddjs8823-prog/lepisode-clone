import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateAdminUserDto, UpdateAdminUserDto, CreateRoleDto, CreateMenuPermissionDto, SetRolePermissionDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // ── AdminUser CRUD ─────────────────────────────────────
  async findAllUsers() {
    const users = await this.prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, name: true, role: true, permission: true, roleId: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true },
    });

    // role 문자열로 Role 테이블 매칭하여 permissions 포함
    const roles = await this.prisma.role.findMany({ include: { permissions: true } });
    const roleMap = new Map(roles.map(r => [r.name, r]));

    return users.map(u => ({
      ...u,
      roleRef: roleMap.get(u.role) ?? null,
    }));
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
      select: { id: true, email: true, name: true, role: true, permission: true, isActive: true, createdAt: true, updatedAt: true },
    });
  }

  async updateUser(id: number, dto: UpdateAdminUserDto) {
    await this.findOneUser(id);
    return this.prisma.adminUser.update({
      where: { id },
      data: dto,
      select: { id: true, email: true, name: true, role: true, permission: true, isActive: true, updatedAt: true },
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

  async updateRole(id: number, dto: CreateRoleDto) {
    const oldRole = await this.prisma.role.findUnique({ where: { id } });
    const updated = await this.prisma.role.update({
      where: { id },
      data: { name: dto.name, description: dto.description },
      include: { permissions: true },
    });
    // 역할명이 변경된 경우 사용자 테이블도 동기화
    if (oldRole && oldRole.name !== dto.name) {
      await this.prisma.adminUser.updateMany({
        where: { role: oldRole.name },
        data: { role: dto.name },
      });
    }
    return updated;
  }

  async removeRole(id: number) {
    // 삭제할 역할명 조회
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (role) {
      // 해당 역할을 가진 사용자의 role, permission 초기화
      await this.prisma.adminUser.updateMany({
        where: { role: role.name },
        data: { role: '', permission: null },
      });
    }
    return this.prisma.role.delete({ where: { id } });
  }

  // ── MenuPermission ─────────────────────────────────────
  async findAllMenus() {
    return this.prisma.menuPermission.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createMenu(dto: CreateMenuPermissionDto) {
    try {
      return await this.prisma.menuPermission.create({ data: dto });
    } catch (e: unknown) {
      if (e instanceof Object && 'code' in e && e.code === 'P2002') {
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
    // 삭제할 권한의 이름 조회
    const perm = await this.prisma.rolePermission.findUnique({ where: { id } });
    if (perm) {
      // 해당 권한을 가진 사용자의 role, permission 필드 초기화
      await this.prisma.adminUser.updateMany({
        where: { permission: perm.name },
        data: { role: '', permission: null },
      });
    }
    return this.prisma.rolePermission.delete({ where: { id } });
  }

  async updatePermission(id: number, dto: SetRolePermissionDto) {
    // 기존 권한명 조회 (이름 변경 감지용)
    const oldPerm = await this.prisma.rolePermission.findUnique({ where: { id } });
    const data: Record<string, unknown> = {
      level: dto.level,
      name: dto.name,
    };
    if (dto.description !== undefined) {
      data.description = dto.description;
    }
    const updated = await this.prisma.rolePermission.update({
      where: { id },
      data,
    });
    // 권한명이 변경된 경우 사용자 테이블도 동기화
    if (oldPerm && oldPerm.name !== dto.name) {
      await this.prisma.adminUser.updateMany({
        where: { permission: oldPerm.name },
        data: { permission: dto.name },
      });
    }
    return updated;
  }
}
