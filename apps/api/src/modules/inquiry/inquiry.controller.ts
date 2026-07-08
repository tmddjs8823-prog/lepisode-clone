import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateInquiryDto, UpdateInquiryStatusDto } from './dto/inquiry.dto';

@Controller('api/v1/inquiries')
export class InquiryController {
  constructor(private readonly service: InquiryService) {}

  @Post()
  create(@Body() dto: CreateInquiryDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('status') status?: string) {
    return this.service.findAll({ page: page ? +page : 1, limit: limit ? +limit : 10, status });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInquiryStatusDto) {
    return this.service.updateStatus(id, dto.status, dto.adminMemo);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
