import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCertificateDto, UpdateCertificateDto, CreateEventDto, UpdateEventDto, CreatePopupDto, UpdatePopupDto, UpsertTermsDto, CreateQrCodeDto, UpdateQrCodeDto } from './dto/content.dto';

@ApiTags('Content')
@Controller('api/v1/content')
export class ContentController {
  constructor(private readonly service: ContentService) {}

  // Certificate (Admin)
  @ApiOperation({ summary: '인증서 목록 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Get('certificates')
  findCertificates() { return this.service.findCertificates(); }

  @ApiOperation({ summary: '인증서 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Post('certificates')
  createCertificate(@Body() dto: CreateCertificateDto) { return this.service.createCertificate(dto); }

  @ApiOperation({ summary: '인증서 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Put('certificates/:id')
  updateCertificate(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCertificateDto) { return this.service.updateCertificate(id, dto); }

  @ApiOperation({ summary: '인증서 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Delete('certificates/:id')
  removeCertificate(@Param('id', ParseIntPipe) id: number) { return this.service.removeCertificate(id); }

  // Event (Public list, Admin CRUD)
  @ApiOperation({ summary: '이벤트 목록 조회 (공개)' })
  @Get('events')
  findEvents() {
    return this.service.findEvents({ published: true });
  }

  @ApiOperation({ summary: '이벤트 전체 목록 (관리자)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Get('events/admin')
  adminFindEvents() {
    return this.service.findEvents();
  }

  @ApiOperation({ summary: '이벤트 상세 조회' })
  @Get('events/:id')
  findOneEvent(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOneEvent(id);
  }

  @ApiOperation({ summary: '이벤트 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Post('events')
  createEvent(@Body() dto: CreateEventDto) { return this.service.createEvent(dto); }

  @ApiOperation({ summary: '이벤트 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Put('events/:id')
  updateEvent(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEventDto) { return this.service.updateEvent(id, dto); }

  @ApiOperation({ summary: '이벤트 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Delete('events/:id')
  removeEvent(@Param('id', ParseIntPipe) id: number) { return this.service.removeEvent(id); }

  // Popup (Public list, Admin CRUD)
  @ApiOperation({ summary: '팝업 목록 조회 (공개)' })
  @Get('popups')
  findPopups() { return this.service.findPopups({ published: true }); }

  @ApiOperation({ summary: '팝업 전체 목록 (관리자)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Get('popups/admin')
  findAllPopups() { return this.service.findPopups(); }

  @ApiOperation({ summary: '팝업 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Post('popups')
  createPopup(@Body() dto: CreatePopupDto) { return this.service.createPopup(dto); }

  @ApiOperation({ summary: '팝업 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Put('popups/:id')
  updatePopup(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePopupDto) { return this.service.updatePopup(id, dto); }

  @ApiOperation({ summary: '팝업 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Delete('popups/:id')
  removePopup(@Param('id', ParseIntPipe) id: number) { return this.service.removePopup(id); }

  // Terms (Public get, Admin upsert)
  @ApiOperation({ summary: '이용약관 전체 목록 조회' })
  @Get('terms')
  findAllTerms() { return this.service.findAllTerms(); }

  @ApiOperation({ summary: '이용약관 타입별 조회' })
  @Get('terms/:type')
  findTerms(@Param('type') type: string) { return this.service.findTermsByType(type); }

  @ApiOperation({ summary: '이용약관 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Put('terms')
  upsertTerms(@Body() dto: UpsertTermsDto) { return this.service.upsertTerms(dto); }

  // QrCode
  @ApiOperation({ summary: 'QR코드 스캔 (조회수 증가)' })
  @Get('qr/:id/scan')
  scanQr(@Param('id', ParseIntPipe) id: number) { return this.service.incrementScan(id); }

  @ApiOperation({ summary: 'QR코드 목록 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Get('qr')
  findQrCodes() { return this.service.findQrCodes(); }

  @ApiOperation({ summary: 'QR코드 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Post('qr')
  createQrCode(@Body() dto: CreateQrCodeDto) { return this.service.createQrCode(dto); }

  @ApiOperation({ summary: 'QR코드 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Put('qr/:id')
  updateQrCode(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQrCodeDto) { return this.service.updateQrCode(id, dto); }

  @ApiOperation({ summary: 'QR코드 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) @Delete('qr/:id')
  removeQrCode(@Param('id', ParseIntPipe) id: number) { return this.service.removeQrCode(id); }
}

