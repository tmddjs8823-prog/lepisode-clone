import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSupportProjectDto, UpdateSupportProjectDto, CreateProjectStatusDto, UpdateProjectStatusDto } from './dto/support.dto';

@Controller('api/v1/support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly service: SupportService) {}

  // SupportProject
  @Get('projects')
  findProjects(@Query('published') published?: string) {
    return this.service.findAllProjects(published !== undefined ? { published: published === 'true' } : undefined);
  }

  @Get('projects/:id')
  findProject(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneProject(id);
  }

  @Post('projects')
  createProject(@Body() dto: CreateSupportProjectDto) {
    return this.service.createProject(dto);
  }

  @Put('projects/:id')
  updateProject(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupportProjectDto) {
    return this.service.updateProject(id, dto);
  }

  @Delete('projects/:id')
  removeProject(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeProject(id);
  }

  // ProjectStatus
  @Get('statuses')
  findStatuses(@Query('published') published?: string) {
    return this.service.findAllStatuses(published !== undefined ? { published: published === 'true' } : undefined);
  }

  @Get('statuses/:id')
  findStatus(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneStatus(id);
  }

  @Post('statuses')
  createStatus(@Body() dto: CreateProjectStatusDto) {
    return this.service.createStatus(dto);
  }

  @Put('statuses/:id')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectStatusDto) {
    return this.service.updateStatus(id, dto);
  }

  @Delete('statuses/:id')
  removeStatus(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeStatus(id);
  }
}
