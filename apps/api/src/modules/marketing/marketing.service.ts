import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMarketingConsentDto, CreateMarketingCompanyDto, UpdateMarketingCompanyDto } from './dto/marketing.dto';

@Injectable()
export class MarketingService {
  constructor(private readonly prisma: PrismaService) {}

  // ── MarketingConsent ───────────────────────────────────
  async findAllConsents(params?: { page?: number; limit?: number }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const [data, total] = await Promise.all([
      this.prisma.marketingConsent.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.marketingConsent.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createConsent(dto: CreateMarketingConsentDto) {
    return this.prisma.marketingConsent.upsert({
      where: { email: dto.email } as never,
      create: { ...dto, isConsented: true, consentedAt: new Date() },
      update: { isConsented: true, consentedAt: new Date(), revokedAt: null },
    });
  }

  async revokeConsent(id: number) {
    return this.prisma.marketingConsent.update({
      where: { id },
      data: { isConsented: false, revokedAt: new Date() },
    });
  }

  // ── MarketingCompany ───────────────────────────────────
  async findAllCompanies() {
    return this.prisma.marketingCompany.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createCompany(dto: CreateMarketingCompanyDto) {
    return this.prisma.marketingCompany.create({ data: dto });
  }

  async updateCompany(id: number, dto: UpdateMarketingCompanyDto) {
    return this.prisma.marketingCompany.update({ where: { id }, data: dto });
  }

  async removeCompany(id: number) {
    return this.prisma.marketingCompany.delete({ where: { id } });
  }
}
