import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CodyService } from './cody.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateCodyCompanyDto, UpdateCodyCompanyDto,
  CreateCodyProjectDto, UpdateCodyProjectDto,
  CreateCodyCreditDto,
  CreateCodyNotificationDto, UpdateCodyNotificationStatusDto,
  CreateCodyWeeklyReportDto, UpdateCodyWeeklyReportDto,
} from './dto/cody.dto';

@ApiTags('Cody')
@ApiBearerAuth()
@Controller('api/v1/cody')
@UseGuards(JwtAuthGuard)
export class CodyController {
  constructor(private readonly service: CodyService) {}

  // Company
  @ApiOperation({ summary: '코디 업체 목록 조회' })
  @Get('companies')
  findCompanies(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAllCompanies({ page: page ? +page : 1, limit: limit ? +limit : 20 });
  }

  @ApiOperation({ summary: '코디 업체 상세 조회' })
  @Get('companies/:id')
  findCompany(@Param('id', ParseIntPipe) id: number) { return this.service.findOneCompany(id); }

  @ApiOperation({ summary: '코디 업체 생성' })
  @Post('companies')
  createCompany(@Body() dto: CreateCodyCompanyDto) { return this.service.createCompany(dto); }

  @ApiOperation({ summary: '코디 업체 수정' })
  @Put('companies/:id')
  updateCompany(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCodyCompanyDto) { return this.service.updateCompany(id, dto); }

  @ApiOperation({ summary: '코디 업체 삭제' })
  @Delete('companies/:id')
  removeCompany(@Param('id', ParseIntPipe) id: number) { return this.service.removeCompany(id); }

  // Project
  @ApiOperation({ summary: '코디 프로젝트 목록 조회' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @Get('projects')
  findProjects(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAllProjects({ page: page ? +page : 1, limit: limit ? +limit : 20, companyId: companyId ? +companyId : undefined, status });
  }

  @ApiOperation({ summary: '코디 프로젝트 상세 조회' })
  @Get('projects/:id')
  findProject(@Param('id', ParseIntPipe) id: number) { return this.service.findOneProject(id); }

  @ApiOperation({ summary: '코디 프로젝트 생성' })
  @Post('projects')
  createProject(@Body() dto: CreateCodyProjectDto) { return this.service.createProject(dto); }

  @ApiOperation({ summary: '코디 프로젝트 수정' })
  @Put('projects/:id')
  updateProject(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCodyProjectDto) { return this.service.updateProject(id, dto); }

  @ApiOperation({ summary: '코디 프로젝트 삭제' })
  @Delete('projects/:id')
  removeProject(@Param('id', ParseIntPipe) id: number) { return this.service.removeProject(id); }

  // Credit
  @ApiOperation({ summary: '코디 크레딧 목록 조회' })
  @ApiQuery({ name: 'companyId', required: false })
  @Get('credits')
  findCredits(@Query('page') page?: string, @Query('limit') limit?: string, @Query('companyId') companyId?: string) {
    return this.service.findAllCredits({ page: page ? +page : 1, limit: limit ? +limit : 20, companyId: companyId ? +companyId : undefined });
  }

  @ApiOperation({ summary: '코디 크레딧 생성' })
  @Post('credits')
  createCredit(@Body() dto: CreateCodyCreditDto) { return this.service.createCredit(dto); }

  @ApiOperation({ summary: '코디 크레딧 삭제' })
  @Delete('credits/:id')
  removeCredit(@Param('id', ParseIntPipe) id: number) { return this.service.removeCredit(id); }

  // Notification
  @ApiOperation({ summary: '코디 알림 목록 조회' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @Get('notifications')
  findNotifications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAllNotifications({ page: page ? +page : 1, limit: limit ? +limit : 20, companyId: companyId ? +companyId : undefined, status });
  }

  @ApiOperation({ summary: '코디 알림 생성' })
  @Post('notifications')
  createNotification(@Body() dto: CreateCodyNotificationDto) { return this.service.createNotification(dto); }

  @ApiOperation({ summary: '코디 알림 상태 변경' })
  @Put('notifications/:id/status')
  updateNotificationStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCodyNotificationStatusDto) {
    return this.service.updateNotificationStatus(id, dto);
  }

  // WeeklyReport
  @ApiOperation({ summary: '코디 주간보고서 목록 조회' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'projectId', required: false })
  @Get('reports')
  findReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.service.findAllReports({ page: page ? +page : 1, limit: limit ? +limit : 20, companyId: companyId ? +companyId : undefined, projectId: projectId ? +projectId : undefined });
  }

  @ApiOperation({ summary: '코디 주간보고서 상세 조회' })
  @Get('reports/:id')
  findReport(@Param('id', ParseIntPipe) id: number) { return this.service.findOneReport(id); }

  @ApiOperation({ summary: '코디 주간보고서 생성' })
  @Post('reports')
  createReport(@Body() dto: CreateCodyWeeklyReportDto) { return this.service.createReport(dto); }

  @ApiOperation({ summary: '코디 주간보고서 수정' })
  @Put('reports/:id')
  updateReport(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCodyWeeklyReportDto) { return this.service.updateReport(id, dto); }

  @ApiOperation({ summary: '코디 주간보고서 삭제' })
  @Delete('reports/:id')
  removeReport(@Param('id', ParseIntPipe) id: number) { return this.service.removeReport(id); }
}

