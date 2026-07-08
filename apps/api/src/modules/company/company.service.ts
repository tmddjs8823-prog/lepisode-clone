import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  UpsertCompanyInfoDto,
  CreateTeamMemberDto, UpdateTeamMemberDto,
  CreateCompanyHistoryDto, UpdateCompanyHistoryDto,
} from './dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  // Company Info (key-value)
  async getInfo() {
    return this.prisma.companyInfo.findMany();
  }

  async upsertInfo(key: string, dto: UpsertCompanyInfoDto) {
    return this.prisma.companyInfo.upsert({
      where: { key },
      create: { key, ...dto },
      update: dto,
    });
  }

  // Team Members
  async getTeam() {
    return this.prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createMember(dto: CreateTeamMemberDto) {
    return this.prisma.teamMember.create({ data: dto });
  }

  async updateMember(id: number, dto: UpdateTeamMemberDto) {
    return this.prisma.teamMember.update({ where: { id }, data: dto });
  }

  async removeMember(id: number) {
    return this.prisma.teamMember.delete({ where: { id } });
  }

  // History
  async getHistory() {
    return this.prisma.companyHistory.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { sortOrder: 'asc' }],
    });
  }

  async createHistory(dto: CreateCompanyHistoryDto) {
    return this.prisma.companyHistory.create({ data: dto });
  }

  async updateHistory(id: number, dto: UpdateCompanyHistoryDto) {
    return this.prisma.companyHistory.update({ where: { id }, data: dto });
  }

  async removeHistory(id: number) {
    return this.prisma.companyHistory.delete({ where: { id } });
  }
}
