import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSupportProjectDto, UpdateSupportProjectDto, CreateProjectStatusDto, UpdateProjectStatusDto } from './dto/support.dto';

@ApiTags('Support')
@Controller('api/v1/support')
export class SupportController {
  constructor(private readonly service: SupportService) {}

  // ── 공개: 프로젝트 현황 목록 ──
  @ApiOperation({ summary: '프로젝트 현황 목록 (공개)' })
  @Get('statuses/public')
  findPublicStatuses() {
    return this.service.findAllStatuses();
  }

  // SupportProject
  @ApiOperation({ summary: '지원 프로젝트 목록 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'published', required: false })
  @Get('projects')
  findProjects(@Query('published') published?: string) {
    return this.service.findAllProjects(published !== undefined ? { published: published === 'true' } : undefined);
  }

  @ApiOperation({ summary: '지원 프로젝트 상세 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('projects/:id')
  findProject(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneProject(id);
  }

  @ApiOperation({ summary: '지원 프로젝트 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('projects')
  createProject(@Body() dto: CreateSupportProjectDto) {
    return this.service.createProject(dto);
  }

  @ApiOperation({ summary: '지원 프로젝트 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('projects/:id')
  updateProject(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupportProjectDto) {
    return this.service.updateProject(id, dto);
  }

  @ApiOperation({ summary: '지원 프로젝트 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('projects/:id')
  removeProject(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeProject(id);
  }

  // ProjectStatus (관리자)
  @ApiOperation({ summary: '프로젝트 상태 목록 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'published', required: false })
  @Get('statuses')
  findStatuses(@Query('published') published?: string) {
    return this.service.findAllStatuses(published !== undefined ? { published: published === 'true' } : undefined);
  }

  @ApiOperation({ summary: '프로젝트 상태 상세 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('statuses/:id')
  findStatus(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneStatus(id);
  }

  @ApiOperation({ summary: '프로젝트 상태 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('statuses')
  createStatus(@Body() dto: CreateProjectStatusDto) {
    return this.service.createStatus(dto);
  }

  @ApiOperation({ summary: '프로젝트 상태 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('statuses/:id')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @ApiOperation({ summary: '프로젝트 상태 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('statuses/:id')
  removeStatus(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeStatus(id);
  }
}
