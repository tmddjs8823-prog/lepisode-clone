import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards, ParseIntPipe, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { I18nManageService } from './i18n.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpsertTranslationDto, UpsertSeoConfigDto } from './dto/i18n.dto';

@Controller('api/v1/i18n')
export class I18nManageController {
  constructor(private readonly service: I18nManageService) {}

  // Translation - Public
  @Get('translations')
  findTranslations(@Query('keys') keys?: string) {
    if (keys) return this.service.findTranslationsByKeys(keys.split(','));
    return this.service.findAllTranslations();
  }

  // Translation - Admin
  @UseGuards(JwtAuthGuard) @Put('translations')
  upsertTranslation(@Body() dto: UpsertTranslationDto) { return this.service.upsertTranslation(dto); }

  @UseGuards(JwtAuthGuard)
  @Post('translations/bulk')
  @UseInterceptors(FileInterceptor('file'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async bulkUpload(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('파일이 필요합니다.');
    return this.service.bulkUploadTranslations(file.buffer);
  }

  @UseGuards(JwtAuthGuard) @Delete('translations/:id')
  removeTranslation(@Param('id', ParseIntPipe) id: number) { return this.service.removeTranslation(id); }

  // SEO - Public
  @Get('seo')
  findSeoConfigs() { return this.service.findAllSeoConfigs(); }

  @Get('seo/:path')
  findSeo(@Param('path') path: string) { return this.service.findSeoByPath(decodeURIComponent(path)); }

  // SEO - Admin
  @UseGuards(JwtAuthGuard) @Put('seo')
  upsertSeo(@Body() dto: UpsertSeoConfigDto) { return this.service.upsertSeoConfig(dto); }
}
