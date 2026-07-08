import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto/portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: {
    page?: number;
    limit?: number;
    category?: string;
    published?: boolean;
  }) {
    const where: Prisma.PortfolioWhereInput = {};
    if (params?.category) where.category = params.category;
    if (params?.published !== undefined) where.published = params.published;

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const [data, total] = await Promise.all([
      this.prisma.portfolio.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.portfolio.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const item = await this.prisma.portfolio.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Portfolio #${id} not found`);
    return item;
  }

  async create(dto: CreatePortfolioDto) {
    return this.prisma.portfolio.create({ data: dto });
  }

  async update(id: number, dto: UpdatePortfolioDto) {
    await this.findOne(id);
    return this.prisma.portfolio.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.portfolio.delete({ where: { id } });
  }
}
