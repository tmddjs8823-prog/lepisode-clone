import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ServiceManageService } from './service.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@ApiTags('Service')
@Controller('api/v1/services')
export class ServiceManageController {
  constructor(private readonly service: ServiceManageService) {}

  @ApiOperation({ summary: '서비스 목록 조회 (공개)' })
  @Get()
  findAll() {
    return this.service.findAll({ published: true });
  }

  @ApiOperation({ summary: '서비스 전체 목록 (관리자)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  adminFindAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: '서비스 상세 조회' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: '서비스 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: '서비스 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: '서비스 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

