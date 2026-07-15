import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateCodyCompanyDto, UpdateCodyCompanyDto,
  CreateCodyProjectDto, UpdateCodyProjectDto,
  CreateCodyCreditDto,
  CreateCodyNotificationDto, UpdateCodyNotificationStatusDto,
  CreateCodyWeeklyReportDto, UpdateCodyWeeklyReportDto,
} from './dto/cody.dto';

@Injectable()
export class CodyService {
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

  // ── Company ────────────────────────────────────────────
  async findAllCompanies(params?: { page?: number; limit?: number }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const [data, total] = await Promise.all([
      this.prisma.codyCompany.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.codyCompany.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneCompany(id: number) {
    const item = await this.prisma.codyCompany.findUnique({
      where: { id },
      include: { projects: true },
    });
    if (!item) throw new NotFoundException(`CodyCompany #${id} not found`);
    return item;
  }

  async createCompany(dto: CreateCodyCompanyDto) {
    const existing = await this.prisma.codyCompany.findFirst({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`이미 등록된 기업명입니다: ${dto.name}`);
    return this.prisma.codyCompany.create({ data: dto });
  }

  async updateCompany(id: number, dto: UpdateCodyCompanyDto) {
    await this.findOneCompany(id);
    return this.prisma.codyCompany.update({ where: { id }, data: dto });
  }

  async removeCompany(id: number) {
    await this.findOneCompany(id);
    return this.prisma.codyCompany.delete({ where: { id } });
  }

  // ── Project ────────────────────────────────────────────
  async findAllProjects(params?: { page?: number; limit?: number; companyId?: number; status?: string }) {
    const where: Prisma.CodyProjectWhereInput = {};
    if (params?.companyId) where.companyId = params.companyId;
    if (params?.status) where.status = params.status;
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const [data, total] = await Promise.all([
      this.prisma.codyProject.findMany({
        where,
        include: { company: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.codyProject.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneProject(id: number) {
    const item = await this.prisma.codyProject.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!item) throw new NotFoundException(`CodyProject #${id} not found`);
    return item;
  }

  async createProject(dto: CreateCodyProjectDto) {
    const { companyId, ...rest } = dto;
    const converted = this.convertDates(rest, ['startDate', 'endDate']);
    return this.prisma.codyProject.create({
      data: { ...converted, company: { connect: { id: companyId } } } as never,
      include: { company: { select: { id: true, name: true } } },
    });
  }

  async updateProject(id: number, dto: UpdateCodyProjectDto) {
    await this.findOneProject(id);
    const { companyId, ...rest } = dto;
    const converted = this.convertDates(rest, ['startDate', 'endDate']);
    const data: Prisma.CodyProjectUpdateInput = { ...converted };
    if (companyId !== undefined) data.company = { connect: { id: companyId } };
    return this.prisma.codyProject.update({ where: { id }, data, include: { company: { select: { id: true, name: true } } } });
  }

  async removeProject(id: number) {
    await this.findOneProject(id);
    return this.prisma.codyProject.delete({ where: { id } });
  }

  // ── Credit ────────────────────────────────────────────
  async findAllCredits(params?: { page?: number; limit?: number; companyId?: number }) {
    const where: Prisma.CodyCreditWhereInput = {};
    if (params?.companyId) where.companyId = params.companyId;
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const [data, total] = await Promise.all([
      this.prisma.codyCredit.findMany({
        where,
        include: {
          company: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.codyCredit.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createCredit(dto: CreateCodyCreditDto) {
    const { companyId, projectId, amount, ...rest } = dto;
    return this.prisma.codyCredit.create({
      data: {
        ...rest,
        amount,
        company: { connect: { id: companyId } },
        ...(projectId ? { project: { connect: { id: projectId } } } : {}),
      },
      include: { company: { select: { id: true, name: true } }, project: { select: { id: true, name: true } } },
    });
  }

  async removeCredit(id: number) {
    return this.prisma.codyCredit.delete({ where: { id } });
  }

  // ── Notification ──────────────────────────────────────
  async findAllNotifications(params?: { page?: number; limit?: number; companyId?: number; status?: string }) {
    const where: Prisma.CodyNotificationWhereInput = {};
    if (params?.companyId) where.companyId = params.companyId;
    if (params?.status) where.status = params.status;
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const [data, total] = await Promise.all([
      this.prisma.codyNotification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.codyNotification.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createNotification(dto: CreateCodyNotificationDto) {
    const { companyId, ...rest } = dto;
    return this.prisma.codyNotification.create({
      data: { ...rest, company: { connect: { id: companyId } } },
    });
  }

  async updateNotificationStatus(id: number, dto: UpdateCodyNotificationStatusDto) {
    return this.prisma.codyNotification.update({ where: { id }, data: { status: dto.status } });
  }

  // ── WeeklyReport ──────────────────────────────────────
  async findAllReports(params?: { page?: number; limit?: number; companyId?: number; projectId?: number }) {
    const where: Prisma.CodyWeeklyReportWhereInput = {};
    if (params?.companyId) where.companyId = params.companyId;
    if (params?.projectId) where.projectId = params.projectId;
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const [data, total] = await Promise.all([
      this.prisma.codyWeeklyReport.findMany({
        where,
        include: {
          company: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.codyWeeklyReport.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneReport(id: number) {
    const item = await this.prisma.codyWeeklyReport.findUnique({
      where: { id },
      include: { company: { select: { id: true, name: true } }, project: { select: { id: true, name: true } } },
    });
    if (!item) throw new NotFoundException(`WeeklyReport #${id} not found`);
    return item;
  }

  async createReport(dto: CreateCodyWeeklyReportDto) {
    const { companyId, projectId, ...rest } = dto;
    const converted = this.convertDates(rest, ['periodStart', 'periodEnd']);
    return this.prisma.codyWeeklyReport.create({
      data: {
        ...converted,
        company: { connect: { id: companyId } },
        project: { connect: { id: projectId } },
      } as never,
      include: { company: { select: { id: true, name: true } }, project: { select: { id: true, name: true } } },
    });
  }

  async updateReport(id: number, dto: UpdateCodyWeeklyReportDto) {
    await this.findOneReport(id);
    const converted = this.convertDates(dto, ['periodStart', 'periodEnd']);
    return this.prisma.codyWeeklyReport.update({ where: { id }, data: converted as never, include: { company: { select: { id: true, name: true } }, project: { select: { id: true, name: true } } } });
  }

  async removeReport(id: number) {
    await this.findOneReport(id);
    return this.prisma.codyWeeklyReport.delete({ where: { id } });
  }
}
