import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';

@ApiTags('Blog')
@Controller('api/v1/blog')
export class BlogController {
  constructor(private readonly service: BlogService) {}

  @ApiOperation({ summary: '블로그 목록 조회 (공개)' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  @ApiQuery({ name: 'category', required: false })
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('category') category?: string) {
    return this.service.findAll({ page: page ? +page : 1, limit: limit ? +limit : 10, category, published: true });
  }

  // admin/list 는 반드시 :id 라우트보다 앞에 선언해야 NestJS가 올바르게 매핑합니다
  @ApiOperation({ summary: '블로그 전체 목록 (관리자)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  adminFindAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ page: page ? +page : 1, limit: limit ? +limit : 100 });
  }

  @ApiOperation({ summary: '블로그 상세 조회' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: '블로그 글 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBlogPostDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: '블로그 글 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBlogPostDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: '블로그 글 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

