import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServiceManageService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: { published?: boolean }) {
    const where: Prisma.ServiceWhereInput = {};
    if (params?.published !== undefined) where.published = params.published;
    return this.prisma.service.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }

  async findOne(id: number) {
    const item = await this.prisma.service.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Service #${id} not found`);
    return item;
  }

  async create(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: dto });
  }

  async update(id: number, dto: UpdateServiceDto) {
    await this.findOne(id);
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.service.delete({ where: { id } });
  }
}
