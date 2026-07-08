import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JobService } from './job.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateJobPostingDto, UpdateJobPostingDto } from './dto/job.dto';

@Controller('api/v1/jobs')
export class JobController {
  constructor(private readonly service: JobService) {}

  @Get()
  findAll(@Query('published') published?: string) {
    const isPublished = published === 'true' ? true : published === 'false' ? false : undefined;
    return this.service.findAll({ published: isPublished });
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  adminFindAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateJobPostingDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateJobPostingDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
