import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCertificateDto, UpdateCertificateDto, CreateEventDto, UpdateEventDto, CreatePopupDto, UpdatePopupDto, UpsertTermsDto, CreateQrCodeDto, UpdateQrCodeDto } from './dto/content.dto';

@Controller('api/v1/content')
export class ContentController {
  constructor(private readonly service: ContentService) {}

  // Certificate (Admin)
  @UseGuards(JwtAuthGuard) @Get('certificates')
  findCertificates() { return this.service.findCertificates(); }

  @UseGuards(JwtAuthGuard) @Post('certificates')
  createCertificate(@Body() dto: CreateCertificateDto) { return this.service.createCertificate(dto); }

  @UseGuards(JwtAuthGuard) @Put('certificates/:id')
  updateCertificate(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCertificateDto) { return this.service.updateCertificate(id, dto); }

  @UseGuards(JwtAuthGuard) @Delete('certificates/:id')
  removeCertificate(@Param('id', ParseIntPipe) id: number) { return this.service.removeCertificate(id); }

  // Event (Public list, Admin CRUD)
  @Get('events')
  findEvents() {
    return this.service.findEvents({ published: true });
  }

  @UseGuards(JwtAuthGuard) @Get('events/admin')
  adminFindEvents() {
    return this.service.findEvents();
  }

  @Get('events/:id')
  findOneEvent(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneEvent(id);
  }

  @UseGuards(JwtAuthGuard) @Post('events')
  createEvent(@Body() dto: CreateEventDto) { return this.service.createEvent(dto); }

  @UseGuards(JwtAuthGuard) @Put('events/:id')
  updateEvent(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEventDto) { return this.service.updateEvent(id, dto); }

  @UseGuards(JwtAuthGuard) @Delete('events/:id')
  removeEvent(@Param('id', ParseIntPipe) id: number) { return this.service.removeEvent(id); }

  // Popup (Public list, Admin CRUD)
  @Get('popups')
  findPopups() { return this.service.findPopups({ published: true }); }

  @UseGuards(JwtAuthGuard) @Get('popups/admin')
  findAllPopups() { return this.service.findPopups(); }

  @UseGuards(JwtAuthGuard) @Post('popups')
  createPopup(@Body() dto: CreatePopupDto) { return this.service.createPopup(dto); }

  @UseGuards(JwtAuthGuard) @Put('popups/:id')
  updatePopup(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePopupDto) { return this.service.updatePopup(id, dto); }

  @UseGuards(JwtAuthGuard) @Delete('popups/:id')
  removePopup(@Param('id', ParseIntPipe) id: number) { return this.service.removePopup(id); }

  // Terms (Public get, Admin upsert)
  @Get('terms')
  findAllTerms() { return this.service.findAllTerms(); }

  @Get('terms/:type')
  findTerms(@Param('type') type: string) { return this.service.findTermsByType(type); }

  @UseGuards(JwtAuthGuard) @Put('terms')
  upsertTerms(@Body() dto: UpsertTermsDto) { return this.service.upsertTerms(dto); }

  // QrCode
  @Get('qr/:id/scan')
  scanQr(@Param('id', ParseIntPipe) id: number) { return this.service.incrementScan(id); }

  @UseGuards(JwtAuthGuard) @Get('qr')
  findQrCodes() { return this.service.findQrCodes(); }

  @UseGuards(JwtAuthGuard) @Post('qr')
  createQrCode(@Body() dto: CreateQrCodeDto) { return this.service.createQrCode(dto); }

  @UseGuards(JwtAuthGuard) @Put('qr/:id')
  updateQrCode(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQrCodeDto) { return this.service.updateQrCode(id, dto); }

  @UseGuards(JwtAuthGuard) @Delete('qr/:id')
  removeQrCode(@Param('id', ParseIntPipe) id: number) { return this.service.removeQrCode(id); }
}
