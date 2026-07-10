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

  async bulkUploadTranslations(buffer: Buffer) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const XLSX = require('xlsx');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    // 헤더 매핑 (한글 → DB 필드)
    const headerMap: Record<string, string> = {
      '순번': 'id', 'id': 'id',
      '키': 'key', 'key': 'key',
      '한국어': 'ko', 'ko': 'ko',
      '영어': 'en', 'en': 'en',
      '일본어': 'ja', 'ja': 'ja',
    };

    // 기존 데이터 전체 삭제 및 시퀀스 리셋
    await this.prisma.translation.deleteMany();
    await this.prisma.$executeRawUnsafe(
      `ALTER SEQUENCE "translations_id_seq" RESTART WITH 1`,
    );

    let count = 0;
    for (const row of rows) {
      const mapped: Record<string, string> = {};
      for (const [header, value] of Object.entries(row)) {
        const field = headerMap[header.trim()];
        if (field) mapped[field] = String(value).trim();
      }
      if (!mapped['key'] || !mapped['ko']) continue;

      const id = mapped['id'] ? Number(mapped['id']) : undefined;

      await this.prisma.translation.create({
        data: {
          ...(id ? { id } : {}),
          key: mapped['key'],
          ko: mapped['ko'],
          en: mapped['en'] || null,
          ja: mapped['ja'] || null,
        },
      });
      count++;
    }

    // 시퀀스를 마지막 id 다음으로 맞춤
    await this.prisma.$executeRawUnsafe(
      `SELECT setval('"translations_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "translations"))`,
    );

    return { count };
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
