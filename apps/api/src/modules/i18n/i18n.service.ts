import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertTranslationDto, UpsertSeoConfigDto } from './dto/i18n.dto';

@Injectable()
export class I18nManageService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Translation ────────────────────────────────────────
  async findAllTranslations() {
    return this.prisma.translation.findMany({ orderBy: { key: 'asc' } });
  }

  async findTranslationsByKeys(keys: string[]) {
    return this.prisma.translation.findMany({ where: { key: { in: keys } } });
  }

  async upsertTranslation(dto: UpsertTranslationDto) {
    const { key, ...rest } = dto;
    return this.prisma.translation.upsert({
      where: { key },
      create: { key, ...rest },
      update: rest,
    });
  }

  async removeTranslation(id: number) {
    return this.prisma.translation.delete({ where: { id } });
  }

  // ── SeoConfig ──────────────────────────────────────────
  async findAllSeoConfigs() {
    return this.prisma.seoConfig.findMany({ orderBy: { pagePath: 'asc' } });
  }

  async findSeoByPath(pagePath: string) {
    return this.prisma.seoConfig.findUnique({ where: { pagePath } });
  }

  async upsertSeoConfig(dto: UpsertSeoConfigDto) {
    const { pagePath, ...rest } = dto;
    return this.prisma.seoConfig.upsert({
      where: { pagePath },
      create: { pagePath, ...rest },
      update: rest,
    });
  }
}
