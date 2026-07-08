import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CodyService } from './cody.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateCodyCompanyDto, UpdateCodyCompanyDto,
  CreateCodyProjectDto, UpdateCodyProjectDto,
  CreateCodyCreditDto,
  CreateCodyNotificationDto, UpdateCodyNotificationStatusDto,
  CreateCodyWeeklyReportDto, UpdateCodyWeeklyReportDto,
} from './dto/cody.dto';

@Controller('api/v1/cody')
@UseGuards(JwtAuthGuard)
export class CodyController {
  constructor(private readonly service: CodyService) {}

  // Company
  @Get('companies')
  findCompanies(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAllCompanies({ page: page ? +page : 1, limit: limit ? +limit : 20 });
  }

  @Get('companies/:id')
  findCompany(@Param('id', ParseIntPipe) id: number) { return this.service.findOneCompany(id); }

  @Post('companies')
  createCompany(@Body() dto: CreateCodyCompanyDto) { return this.service.createCompany(dto); }

  @Put('companies/:id')
  updateCompany(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCodyCompanyDto) { return this.service.updateCompany(id, dto); }

  @Delete('companies/:id')
  removeCompany(@Param('id', ParseIntPipe) id: number) { return this.service.removeCompany(id); }

  // Project
  @Get('projects')
  findProjects(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAllProjects({ page: page ? +page : 1, limit: limit ? +limit : 20, companyId: companyId ? +companyId : undefined, status });
  }

  @Get('projects/:id')
  findProject(@Param('id', ParseIntPipe) id: number) { return this.service.findOneProject(id); }

  @Post('projects')
  createProject(@Body() dto: CreateCodyProjectDto) { return this.service.createProject(dto); }

  @Put('projects/:id')
  updateProject(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCodyProjectDto) { return this.service.updateProject(id, dto); }

  @Delete('projects/:id')
  removeProject(@Param('id', ParseIntPipe) id: number) { return this.service.removeProject(id); }

  // Credit
  @Get('credits')
  findCredits(@Query('page') page?: string, @Query('limit') limit?: string, @Query('companyId') companyId?: string) {
    return this.service.findAllCredits({ page: page ? +page : 1, limit: limit ? +limit : 20, companyId: companyId ? +companyId : undefined });
  }

  @Post('credits')
  createCredit(@Body() dto: CreateCodyCreditDto) { return this.service.createCredit(dto); }

  // Notification
  @Get('notifications')
  findNotifications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAllNotifications({ page: page ? +page : 1, limit: limit ? +limit : 20, companyId: companyId ? +companyId : undefined, status });
  }

  @Post('notifications')
  createNotification(@Body() dto: CreateCodyNotificationDto) { return this.service.createNotification(dto); }

  @Put('notifications/:id/status')
  updateNotificationStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCodyNotificationStatusDto) {
    return this.service.updateNotificationStatus(id, dto);
  }

  // WeeklyReport
  @Get('reports')
  findReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.service.findAllReports({ page: page ? +page : 1, limit: limit ? +limit : 20, companyId: companyId ? +companyId : undefined, projectId: projectId ? +projectId : undefined });
  }

  @Get('reports/:id')
  findReport(@Param('id', ParseIntPipe) id: number) { return this.service.findOneReport(id); }

  @Post('reports')
  createReport(@Body() dto: CreateCodyWeeklyReportDto) { return this.service.createReport(dto); }

  @Put('reports/:id')
  updateReport(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCodyWeeklyReportDto) { return this.service.updateReport(id, dto); }

  @Delete('reports/:id')
  removeReport(@Param('id', ParseIntPipe) id: number) { return this.service.removeReport(id); }
}
