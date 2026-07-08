import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ServiceManageService } from './service.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Controller('api/v1/services')
export class ServiceManageController {
  constructor(private readonly service: ServiceManageService) {}

  @Get()
  findAll() {
    return this.service.findAll({ published: true });
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  adminFindAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
