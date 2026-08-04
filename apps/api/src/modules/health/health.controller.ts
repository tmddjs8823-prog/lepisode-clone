import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Health')
@Controller('api/v1/health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: '서버 상태 확인 (Health Check)' })
  @Get()
  @HealthCheck()
  async check() {
    const startTime = process.uptime();

    const result = await this.health.check([
      // DB 연결 확인 (Prisma raw query)
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return { database: { status: 'up' as const } };
        } catch {
          return { database: { status: 'down' as const, message: 'DB 연결 실패' } };
        }
      },

      // 메모리 사용량 (RSS 512MB 이하)
      () => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),

      // 힙 메모리 (512MB 이하 — max-old-space-size와 동일)
      () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),

      // 디스크 사용량 (90% 이하)
      () => this.disk.checkStorage('disk', {
        thresholdPercent: 0.9,
        path: process.platform === 'win32' ? 'C:\\' : '/',
      }),
    ]);

    // 추가 서버 정보 덧붙이기
    const memUsage = process.memoryUsage();

    return {
      ...result,
      info: {
        ...result.info,
        server: {
          status: 'up' as const,
          uptime: Math.floor(startTime),
          nodeVersion: process.version,
          platform: process.platform,
          pid: process.pid,
          memoryUsage: {
            rss: Math.round(memUsage.rss / 1024 / 1024),
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024),
          },
        },
      },
    };
  }
}
