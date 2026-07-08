import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FaqService } from './faq.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFaqDto, UpdateFaqDto, CreateFaqCategoryDto, UpdateFaqCategoryDto } from './dto/faq.dto';

@Controller('api/v1/faq')
export class FaqController {
  constructor(private readonly service: FaqService) {}

  @Get('categories')
  findCategories() {
    return this.service.findAllCategories();
  }

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.service.findAll({ categoryId: categoryId ? +categoryId : undefined, published: true });
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  adminFindAll(@Query('categoryId') categoryId?: string) {
    return this.service.findAll({ categoryId: categoryId ? +categoryId : undefined });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('categories')
  createCategory(@Body() dto: CreateFaqCategoryDto) {
    return this.service.createCategory(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFaqCategoryDto) {
    return this.service.updateCategory(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('categories/:id')
  removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeCategory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateFaqDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFaqDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
