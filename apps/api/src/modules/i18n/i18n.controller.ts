import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards, ParseIntPipe, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { I18nManageService } from './i18n.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpsertTranslationDto, UpsertSeoConfigDto } from './dto/i18n.dto';

@ApiTags('I18n')
@Controller('api/v1/i18n')
export class I18nManageController {
  constructor(private readonly service: I18nManageService) {}

  // Translation - Public
  @ApiOperation({ summary: '번역 목록 조회' })
  @ApiQuery({ name: 'keys', required: false, description: '조회할 키 (콤마 구분)' })
  @Get('translations')
  findTranslations(@Query('keys') keys?: string) {
    if (keys) return this.service.findTranslationsByKeys(keys.split(','));
    return this.service.findAllTranslations();
  }

  // Translation - Admin
  @ApiOperation({ summary: '번역 추가/수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Put('translations')
  upsertTranslation(@Body() dto: UpsertTranslationDto) { return this.service.upsertTranslation(dto); }

  @ApiOperation({ summary: '번역 일괄 업로드 (엑셀 파일)' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @Post('translations/bulk')
  @UseInterceptors(FileInterceptor('file'))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async bulkUpload(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('파일이 필요합니다.');
    return this.service.bulkUploadTranslations(file.buffer);
  }

  @ApiOperation({ summary: '번역 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Delete('translations/:id')
  removeTranslation(@Param('id', ParseIntPipe) id: number) { return this.service.removeTranslation(id); }

  // SEO - Public
  @ApiOperation({ summary: 'SEO 설정 전체 조회' })
  @Get('seo')
  findSeoConfigs() { return this.service.findAllSeoConfigs(); }

  @ApiOperation({ summary: 'SEO 설정 경로별 조회' })
  @Get('seo/:path')
  findSeo(@Param('path') path: string) { return this.service.findSeoByPath(decodeURIComponent(path)); }

  // SEO - Admin
  @ApiOperation({ summary: 'SEO 설정 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Put('seo')
  upsertSeo(@Body() dto: UpsertSeoConfigDto) { return this.service.upsertSeoConfig(dto); }
}

