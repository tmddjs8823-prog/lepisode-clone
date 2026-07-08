import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateJobPostingDto, UpdateJobPostingDto } from './dto/job.dto';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: { published?: boolean; page?: number; limit?: number }) {
    const { published, page = 1, limit = 10 } = params || {};
    const where: Prisma.JobPostingWhereInput = {};
    if (published !== undefined) where.published = published;

    const [data, total] = await Promise.all([
      this.prisma.jobPosting.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.jobPosting.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: number) {
    const item = await this.prisma.jobPosting.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Job posting #${id} not found`);
    return item;
  }

  private toData(dto: CreateJobPostingDto | UpdateJobPostingDto) {
    // Prisma DateTime 필드는 Date 객체가 필요
    const data: Record<string, unknown> = { ...dto as Record<string, unknown> };
    if (dto.startDate) data['startDate'] = new Date(dto.startDate);
    else if (dto.startDate === null) data['startDate'] = null;
    if (dto.deadline) data['deadline'] = new Date(dto.deadline);
    else if (dto.deadline === null) data['deadline'] = null;
    return data;
  }

  async create(dto: CreateJobPostingDto) {
    return this.prisma.jobPosting.create({ data: this.toData(dto) as never });
  }

  async update(id: number, dto: UpdateJobPostingDto) {
    await this.findOne(id);
    return this.prisma.jobPosting.update({ where: { id }, data: this.toData(dto) as never });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.jobPosting.delete({ where: { id } });
  }
}
