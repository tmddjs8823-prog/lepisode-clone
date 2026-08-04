import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateSupportProjectDto, UpdateSupportProjectDto,
  CreateProjectStatusDto, UpdateProjectStatusDto,
} from './dto/support.dto';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  private convertDates(dto: object, dateFields: string[]): Record<string, unknown> {
    const data: Record<string, unknown> = { ...dto as Record<string, unknown> };
    for (const field of dateFields) {
      const val = (dto as Record<string, unknown>)[field];
      if (typeof val === 'string' && val) data[field] = new Date(val);
      else if (val === null) data[field] = null;
    }
    return data;
  }

  // ── SupportProject ────────────────────────────────────
  async findAllProjects(params?: { published?: boolean }) {
    const where: Prisma.SupportProjectWhereInput = {};
    if (params?.published !== undefined) where.published = params.published;
    return this.prisma.supportProject.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }

  async findOneProject(id: number) {
    const item = await this.prisma.supportProject.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`SupportProject #${id} not found`);
    return item;
  }

  async createProject(dto: CreateSupportProjectDto) {
    return this.prisma.supportProject.create({ data: dto as never });
  }

  async updateProject(id: number, dto: UpdateSupportProjectDto) {
    await this.findOneProject(id);
    return this.prisma.supportProject.update({ where: { id }, data: dto as never });
  }

  async removeProject(id: number) {
    await this.findOneProject(id);
    return this.prisma.supportProject.delete({ where: { id } });
  }

  // ── ProjectStatus ─────────────────────────────────────
  /** 공개용: published=true인 항목만 반환 (종료 처리는 스케줄러가 담당) */
  async findPublicStatuses() {
    return this.prisma.projectStatus.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllStatuses(params?: { published?: boolean }) {
    const where: Prisma.ProjectStatusWhereInput = {};
    if (params?.published !== undefined) where.published = params.published;
    return this.prisma.projectStatus.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }

  async findOneStatus(id: number) {
    const item = await this.prisma.projectStatus.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`ProjectStatus #${id} not found`);
    return item;
  }

  async createStatus(dto: CreateProjectStatusDto) {
    return this.prisma.projectStatus.create({ data: this.convertDates(dto, ['startDate', 'endDate']) as never });
  }

  async updateStatus(id: number, dto: UpdateProjectStatusDto) {
    await this.findOneStatus(id);
    return this.prisma.projectStatus.update({ where: { id }, data: this.convertDates(dto, ['startDate', 'endDate']) as never });
  }

  async removeStatus(id: number) {
    await this.findOneStatus(id);
    return this.prisma.projectStatus.delete({ where: { id } });
  }
}
