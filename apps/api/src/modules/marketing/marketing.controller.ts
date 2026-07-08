import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMarketingConsentDto, CreateMarketingCompanyDto, UpdateMarketingCompanyDto } from './dto/marketing.dto';

@Controller('api/v1/marketing')
export class MarketingController {
  constructor(private readonly service: MarketingService) {}

  // Consent - Public
  @Post('consent')
  @HttpCode(HttpStatus.OK)
  createConsent(@Body() dto: CreateMarketingConsentDto) {
    return this.service.createConsent(dto);
  }

  // Consent - Admin
  @UseGuards(JwtAuthGuard) @Get('consents')
  findConsents(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAllConsents({ page: page ? +page : 1, limit: limit ? +limit : 20 });
  }

  @UseGuards(JwtAuthGuard) @Put('consents/:id/revoke')
  revokeConsent(@Param('id', ParseIntPipe) id: number) {
    return this.service.revokeConsent(id);
  }

  // Company - Admin
  @UseGuards(JwtAuthGuard) @Get('companies')
  findCompanies() { return this.service.findAllCompanies(); }

  @UseGuards(JwtAuthGuard) @Post('companies')
  createCompany(@Body() dto: CreateMarketingCompanyDto) { return this.service.createCompany(dto); }

  @UseGuards(JwtAuthGuard) @Put('companies/:id')
  updateCompany(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMarketingCompanyDto) { return this.service.updateCompany(id, dto); }

  @UseGuards(JwtAuthGuard) @Delete('companies/:id')
  removeCompany(@Param('id', ParseIntPipe) id: number) { return this.service.removeCompany(id); }
}
