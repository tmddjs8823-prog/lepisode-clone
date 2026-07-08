import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNoticeDto, UpdateNoticeDto } from './dto/notice.dto';

@Controller('api/v1/notices')
export class NoticeController {
  constructor(private readonly service: NoticeService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ page: page ? +page : 1, limit: limit ? +limit : 10, published: true });
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  adminFindAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ page: page ? +page : 1, limit: limit ? +limit : 10 });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateNoticeDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNoticeDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
