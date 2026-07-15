import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JobService } from './job.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateJobPostingDto, UpdateJobPostingDto } from './dto/job.dto';

@ApiTags('Job')
@Controller('api/v1/jobs')
export class JobController {
  constructor(private readonly service: JobService) {}

  @ApiOperation({ summary: '채용공고 목록 조회 (공개)' })
  @ApiQuery({ name: 'published', required: false })
  @Get()
  findAll(@Query('published') published?: string) {
    const isPublished = published === 'true' ? true : published === 'false' ? false : undefined;
    return this.service.findAll({ published: isPublished });
  }

  @ApiOperation({ summary: '채용공고 전체 목록 (관리자)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  adminFindAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
    });
  }

  @ApiOperation({ summary: '채용공고 상세 조회' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: '채용공고 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateJobPostingDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: '채용공고 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateJobPostingDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: '채용공고 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

