import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  UpsertCompanyInfoDto,
  CreateTeamMemberDto, UpdateTeamMemberDto,
  CreateCompanyHistoryDto, UpdateCompanyHistoryDto,
} from './dto/company.dto';

@Controller('api/v1/company')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  // Public
  @Get('info')
  getInfo() {
    return this.service.getInfo();
  }

  @Get('team')
  getTeam() {
    return this.service.getTeam();
  }

  @Get('history')
  getHistory() {
    return this.service.getHistory();
  }

  // Admin: Company Info
  @UseGuards(JwtAuthGuard)
  @Put('info/:key')
  upsertInfo(@Param('key') key: string, @Body() dto: UpsertCompanyInfoDto) {
    return this.service.upsertInfo(key, dto);
  }

  // Admin: Team Members
  @UseGuards(JwtAuthGuard)
  @Post('team')
  createMember(@Body() dto: CreateTeamMemberDto) {
    return this.service.createMember(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('team/:id')
  updateMember(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTeamMemberDto) {
    return this.service.updateMember(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('team/:id')
  removeMember(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeMember(id);
  }

  // Admin: History
  @UseGuards(JwtAuthGuard)
  @Post('history')
  createHistory(@Body() dto: CreateCompanyHistoryDto) {
    return this.service.createHistory(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('history/:id')
  updateHistory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCompanyHistoryDto) {
    return this.service.updateHistory(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('history/:id')
  removeHistory(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeHistory(id);
  }
}
