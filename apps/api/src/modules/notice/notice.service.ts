import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notice.dto';

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: { page?: number; limit?: number; published?: boolean }) {
    const where: Prisma.NoticeWhereInput = {};
    if (params?.published !== undefined) where.published = params.published;

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const [data, total] = await Promise.all([
      this.prisma.notice.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notice.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const item = await this.prisma.notice.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Notice #${id} not found`);
    return item;
  }

  async create(dto: CreateNoticeDto) {
    return this.prisma.notice.create({ data: dto });
  }

  async update(id: number, dto: UpdateNoticeDto) {
    await this.findOne(id);
    return this.prisma.notice.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.notice.delete({ where: { id } });
  }
}
