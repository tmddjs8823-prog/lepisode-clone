import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';

@Controller('api/v1/blog')
export class BlogController {
  constructor(private readonly service: BlogService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('category') category?: string) {
    return this.service.findAll({ page: page ? +page : 1, limit: limit ? +limit : 10, category, published: true });
  }

  // admin/list 는 반드시 :id 라우트보다 앞에 선언해야 NestJS가 올바르게 매핑합니다
  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  adminFindAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll({ page: page ? +page : 1, limit: limit ? +limit : 100 });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBlogPostDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBlogPostDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
