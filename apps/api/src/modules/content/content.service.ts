import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCertificateDto, UpdateCertificateDto,
  CreateEventDto, UpdateEventDto,
  CreatePopupDto, UpdatePopupDto,
  UpsertTermsDto,
  CreateQrCodeDto, UpdateQrCodeDto,
} from './dto/content.dto';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  /** DTO의 날짜 문자열을 Prisma DateTime(Date 객체)로 변환 */
  private convertDates(dto: object, dateFields: string[]): Record<string, unknown> {
    const data: Record<string, unknown> = { ...dto as Record<string, unknown> };
    for (const field of dateFields) {
      const val = (dto as Record<string, unknown>)[field];
      if (typeof val === 'string' && val) data[field] = new Date(val);
      else if (val === null) data[field] = null;
    }
    return data;
  }

  // ── Certificate ────────────────────────────────────────
  async findCertificates() {
    return this.prisma.certificate.findMany({ orderBy: { sortOrder: 'asc' } });
  }
  async createCertificate(dto: CreateCertificateDto) {
    return this.prisma.certificate.create({ data: this.convertDates(dto, ['issueDate']) as never });
  }
  async updateCertificate(id: number, dto: UpdateCertificateDto) {
    return this.prisma.certificate.update({ where: { id }, data: this.convertDates(dto, ['issueDate']) as never });
  }
  async removeCertificate(id: number) {
    return this.prisma.certificate.delete({ where: { id } });
  }

  // ── Event ──────────────────────────────────────────────
  async findEvents(params?: { published?: boolean }) {
    const where = params?.published !== undefined ? { published: params.published } : {};
    return this.prisma.event.findMany({ where, orderBy: { startDate: 'desc' } });
  }
  async findOneEvent(id: number) {
    const item = await this.prisma.event.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Event #${id} not found`);
    return item;
  }
  async createEvent(dto: CreateEventDto) {
    return this.prisma.event.create({ data: this.convertDates(dto, ['startDate', 'endDate', 'selectedDate']) as never });
  }
  async updateEvent(id: number, dto: UpdateEventDto) {
    await this.findOneEvent(id);
    return this.prisma.event.update({ where: { id }, data: this.convertDates(dto, ['startDate', 'endDate', 'selectedDate']) as never });
  }
  async removeEvent(id: number) {
    await this.findOneEvent(id);
    return this.prisma.event.delete({ where: { id } });
  }

  // ── Popup ──────────────────────────────────────────────
  async findPopups(params?: { published?: boolean }) {
    const where = params?.published !== undefined ? { published: params.published } : {};
    return this.prisma.popup.findMany({ where, orderBy: { createdAt: 'desc' } });
  }
  async findOnePopup(id: number) {
    const item = await this.prisma.popup.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Popup #${id} not found`);
    return item;
  }
  async createPopup(dto: CreatePopupDto) {
    return this.prisma.popup.create({ data: this.convertDates(dto, ['startDate', 'endDate']) as never });
  }
  async updatePopup(id: number, dto: UpdatePopupDto) {
    await this.findOnePopup(id);
    return this.prisma.popup.update({ where: { id }, data: this.convertDates(dto, ['startDate', 'endDate']) as never });
  }
  async removePopup(id: number) {
    await this.findOnePopup(id);
    return this.prisma.popup.delete({ where: { id } });
  }

  // ── Terms ──────────────────────────────────────────────
  async findAllTerms() {
    return this.prisma.terms.findMany({ orderBy: { type: 'asc' } });
  }
  async findTermsByType(type: string) {
    return this.prisma.terms.findUnique({ where: { type } });
  }
  async upsertTerms(dto: UpsertTermsDto) {
    const { type, ...rest } = dto;
    return this.prisma.terms.upsert({
      where: { type },
      create: { type, ...rest },
      update: rest,
    });
  }

  // ── QrCode ────────────────────────────────────────────
  async findQrCodes() {
    return this.prisma.qrCode.findMany({ orderBy: { createdAt: 'desc' } });
  }
  async findOneQrCode(id: number) {
    const item = await this.prisma.qrCode.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`QrCode #${id} not found`);
    return item;
  }
  async createQrCode(dto: CreateQrCodeDto) {
    return this.prisma.qrCode.create({ data: dto });
  }
  async updateQrCode(id: number, dto: UpdateQrCodeDto) {
    await this.findOneQrCode(id);
    return this.prisma.qrCode.update({ where: { id }, data: dto });
  }
  async removeQrCode(id: number) {
    await this.findOneQrCode(id);
    return this.prisma.qrCode.delete({ where: { id } });
  }
  async incrementScan(id: number) {
    return this.prisma.qrCode.update({
      where: { id },
      data: { scanCount: { increment: 1 } },
    });
  }
}
