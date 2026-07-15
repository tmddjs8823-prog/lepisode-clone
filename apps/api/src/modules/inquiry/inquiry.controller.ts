import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InquiryService } from './inquiry.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateInquiryDto, UpdateInquiryStatusDto } from './dto/inquiry.dto';

@ApiTags('Inquiry')
@Controller('api/v1/inquiries')
export class InquiryController {
  constructor(private readonly service: InquiryService) {}

  @ApiOperation({ summary: '문의 등록 (공개)' })
  @Post()
  create(@Body() dto: CreateInquiryDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: '문의 목록 조회' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('status') status?: string) {
    return this.service.findAll({ page: page ? +page : 1, limit: limit ? +limit : 10, status });
  }

  @ApiOperation({ summary: '문의 상세 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: '문의 상태 변경' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInquiryStatusDto) {
    return this.service.updateStatus(id, dto.status, dto.adminMemo);
  }

  @ApiOperation({ summary: '문의 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

