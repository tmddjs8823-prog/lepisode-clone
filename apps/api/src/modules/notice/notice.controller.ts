import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NoticeService } from './notice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notice.dto';

@ApiTags('Notice')
@Controller('api/v1/notices')
export class NoticeController {
  constructor(private readonly service: NoticeService) {}

  @ApiOperation({ summary: '공지사항 목록 조회 (공개)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ page: page ? +page : 1, limit: limit ? +limit : 10, published: true });
  }

  @ApiOperation({ summary: '공지사항 전체 목록 (관리자)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  adminFindAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ page: page ? +page : 1, limit: limit ? +limit : 10 });
  }

  @ApiOperation({ summary: '공지사항 상세 조회' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: '공지사항 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateNoticeDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: '공지사항 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNoticeDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: '공지사항 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

