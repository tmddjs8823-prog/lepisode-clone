import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMarketingConsentDto, CreateMarketingCompanyDto, UpdateMarketingCompanyDto } from './dto/marketing.dto';

@ApiTags('Marketing')
@Controller('api/v1/marketing')
export class MarketingController {
  constructor(private readonly service: MarketingService) {}

  // Consent - Public
  @ApiOperation({ summary: '마케팅 동의 등록 (공개)' })
  @Post('consent')
  @HttpCode(HttpStatus.OK)
  createConsent(@Body() dto: CreateMarketingConsentDto) {
    return this.service.createConsent(dto);
  }

  // Consent - Admin
  @ApiOperation({ summary: '마케팅 동의 목록 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Get('consents')
  findConsents(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAllConsents({ page: page ? +page : 1, limit: limit ? +limit : 20 });
  }

  @ApiOperation({ summary: '마케팅 동의 철회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Put('consents/:id/revoke')
  revokeConsent(@Param('id', ParseIntPipe) id: number) {
    return this.service.revokeConsent(id);
  }

  // Company - Admin
  @ApiOperation({ summary: '마케팅 업체 목록 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Get('companies')
  findCompanies() { return this.service.findAllCompanies(); }

  @ApiOperation({ summary: '마케팅 업체 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Post('companies')
  createCompany(@Body() dto: CreateMarketingCompanyDto) { return this.service.createCompany(dto); }

  @ApiOperation({ summary: '마케팅 업체 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Put('companies/:id')
  updateCompany(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMarketingCompanyDto) { return this.service.updateCompany(id, dto); }

  @ApiOperation({ summary: '마케팅 업체 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Delete('companies/:id')
  removeCompany(@Param('id', ParseIntPipe) id: number) { return this.service.removeCompany(id); }
}

