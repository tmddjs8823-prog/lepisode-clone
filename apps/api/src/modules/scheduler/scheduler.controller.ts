import { Controller, Get, Post, Put, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SchedulerService } from './scheduler.service';

class UpdateCronDto {
  @ApiProperty({ description: 'Cron 표현식', example: '0 0 * * *' })
  @IsString()
  @IsNotEmpty()
  cronExpr!: string;
}

@ApiTags('Scheduler')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/scheduler')
export class SchedulerController {
  constructor(private readonly service: SchedulerService) {}

  @ApiOperation({ summary: '스케줄 작업 목록 조회' })
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: '작업 활성화/비활성화 토글' })
  @Post(':taskKey/toggle')
  @HttpCode(HttpStatus.OK)
  toggle(@Param('taskKey') taskKey: string) {
    return this.service.toggle(taskKey);
  }

  @ApiOperation({ summary: '실행 주기 변경' })
  @Put(':taskKey/cron')
  updateCron(@Param('taskKey') taskKey: string, @Body() dto: UpdateCronDto) {
    return this.service.updateCron(taskKey, dto.cronExpr);
  }

  @ApiOperation({ summary: '수동 즉시 실행' })
  @Post(':taskKey/run')
  @HttpCode(HttpStatus.OK)
  runNow(@Param('taskKey') taskKey: string) {
    return this.service.runNow(taskKey);
  }
}
