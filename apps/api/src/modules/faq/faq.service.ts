import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateFaqDto, UpdateFaqDto, CreateFaqCategoryDto, UpdateFaqCategoryDto } from './dto/faq.dto';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  // FAQ Categories
  async findAllCategories() {
    return this.prisma.faqCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { faqs: { where: { published: true }, orderBy: { sortOrder: 'asc' } } },
    });
  }

  async createCategory(dto: CreateFaqCategoryDto) {
    return this.prisma.faqCategory.create({ data: dto });
  }

  async updateCategory(id: number, dto: UpdateFaqCategoryDto) {
    return this.prisma.faqCategory.update({ where: { id }, data: dto });
  }

  async removeCategory(id: number) {
    return this.prisma.faqCategory.delete({ where: { id } });
  }

  // FAQs
  async findAll(params?: { categoryId?: number; published?: boolean }) {
    const where: Prisma.FaqWhereInput = {};
    if (params?.categoryId) where.categoryId = params.categoryId;
    if (params?.published !== undefined) where.published = params.published;
    return this.prisma.faq.findMany({ where, orderBy: { sortOrder: 'asc' }, include: { category: true } });
  }

  async findOne(id: number) {
    const item = await this.prisma.faq.findUnique({ where: { id }, include: { category: true } });
    if (!item) throw new NotFoundException(`FAQ #${id} not found`);
    return item;
  }

  async create(dto: CreateFaqDto) {
    const { categoryId, ...rest } = dto;
    return this.prisma.faq.create({
      data: { ...rest, category: { connect: { id: categoryId } } },
      include: { category: true },
    });
  }

  async update(id: number, dto: UpdateFaqDto) {
    await this.findOne(id);
    const { categoryId, ...rest } = dto;
    const data: Prisma.FaqUpdateInput = { ...rest };
    if (categoryId !== undefined) {
      data.category = { connect: { id: categoryId } };
    }
    return this.prisma.faq.update({ where: { id }, data, include: { category: true } });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.faq.delete({ where: { id } });
  }
}
