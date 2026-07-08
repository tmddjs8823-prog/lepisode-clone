import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: { page?: number; limit?: number; category?: string; published?: boolean }) {
    const where: Prisma.BlogPostWhereInput = {};
    if (params?.category) where.category = params.category;
    if (params?.published !== undefined) where.published = params.published;

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const item = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Blog post #${id} not found`);
    await this.prisma.blogPost.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return item;
  }

  async create(dto: CreateBlogPostDto) {
    return this.prisma.blogPost.create({ data: dto });
  }

  async update(id: number, dto: UpdateBlogPostDto) {
    await this.findOne(id);
    return this.prisma.blogPost.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.blogPost.delete({ where: { id } });
  }
}
