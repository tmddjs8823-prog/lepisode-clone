import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFaqDto, UpdateFaqDto, CreateFaqCategoryDto, UpdateFaqCategoryDto } from './dto/faq.dto';

@ApiTags('FAQ')
@Controller('api/v1/faq')
export class FaqController {
  constructor(private readonly service: FaqService) {}

  @ApiOperation({ summary: 'FAQ 카테고리 목록 조회' })
  @Get('categories')
  findCategories() {
    return this.service.findAllCategories();
  }

  @ApiOperation({ summary: 'FAQ 목록 조회 (공개)' })
  @ApiQuery({ name: 'categoryId', required: false })
  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.service.findAll({ categoryId: categoryId ? +categoryId : undefined, published: true });
  }

  @ApiOperation({ summary: 'FAQ 전체 목록 (관리자)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  adminFindAll(@Query('categoryId') categoryId?: string) {
    return this.service.findAll({ categoryId: categoryId ? +categoryId : undefined });
  }

  @ApiOperation({ summary: 'FAQ 상세 조회' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'FAQ 카테고리 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('categories')
  createCategory(@Body() dto: CreateFaqCategoryDto) {
    return this.service.createCategory(dto);
  }

  @ApiOperation({ summary: 'FAQ 카테고리 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFaqCategoryDto) {
    return this.service.updateCategory(id, dto);
  }

  @ApiOperation({ summary: 'FAQ 카테고리 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('categories/:id')
  removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.service.removeCategory(id);
  }

  @ApiOperation({ summary: 'FAQ 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateFaqDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'FAQ 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFaqDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'FAQ 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

