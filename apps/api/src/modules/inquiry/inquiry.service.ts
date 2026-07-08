import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateInquiryDto } from './dto/inquiry.dto';

@Injectable()
export class InquiryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: { page?: number; limit?: number; status?: string }) {
    const where: Prisma.InquiryWhereInput = {};
    if (params?.status) where.status = params.status;

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const [data, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.inquiry.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const item = await this.prisma.inquiry.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Inquiry #${id} not found`);
    if (!item.isRead) {
      await this.prisma.inquiry.update({ where: { id }, data: { isRead: true } });
    }
    return item;
  }

  async create(dto: CreateInquiryDto) {
    return this.prisma.inquiry.create({ data: dto });
  }

  async updateStatus(id: number, status: string, adminMemo?: string) {
    await this.findOne(id);
    return this.prisma.inquiry.update({ where: { id }, data: { status, adminMemo } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.inquiry.delete({ where: { id } });
  }
}
