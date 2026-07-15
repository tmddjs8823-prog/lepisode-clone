import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  UpsertCompanyInfoDto,
  CreateTeamMemberDto, UpdateTeamMemberDto,
  CreateCompanyHistoryDto, UpdateCompanyHistoryDto,
} from './dto/company.dto';

@ApiTags('Company')
@Controller('api/v1/company')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  // Public
  @ApiOperation({ summary: '회사 정보 조회' })
  @Get('info')
  getInfo() {
    return this.service.getInfo();
  }

  @ApiOperation({ summary: '팀 멤버 목록 조회' })
  @Get('team')
  getTeam() {
    return this.service.getTeam();
  }

  @ApiOperation({ summary: '회사 연혁 조회' })
  @Get('history')
  getHistory() {
    return this.service.getHistory();
  }

  // Admin: Company Info
  @ApiOperation({ summary: '회사 정보 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('info/:key')
  upsertInfo(@Param('key') key: string, @Body() dto: UpsertCompanyInfoDto) {
    return this.service.upsertInfo(key, dto);
  }

  // Admin: Team Members
  @ApiOperation({ summary: '팀 멤버 추가' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('team')
  createMember(@Body() dto: CreateTeamMemberDto) {
    return this.service.createMember(dto);
  }

  @ApiOperation({ summary: '팀 멤버 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('team/:id')
  updateMember(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTeamMemberDto) {
    return this.service.updateMember(id, dto);
  }

  @ApiOperation({ summary: '팀 멤버 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('team/:id')
  removeMember(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeMember(id);
  }

  // Admin: History
  @ApiOperation({ summary: '회사 연혁 추가' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('history')
  createHistory(@Body() dto: CreateCompanyHistoryDto) {
    return this.service.createHistory(dto);
  }

  @ApiOperation({ summary: '회사 연혁 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('history/:id')
  updateHistory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCompanyHistoryDto) {
    return this.service.updateHistory(id, dto);
  }

  @ApiOperation({ summary: '회사 연혁 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('history/:id')
  removeHistory(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeHistory(id);
  }
}

