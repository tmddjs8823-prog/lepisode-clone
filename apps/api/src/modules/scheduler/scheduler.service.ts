import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from '../../prisma/prisma.service';

/** 기본 시드 작업 정의 */
const DEFAULT_TASKS = [
  {
    taskKey: 'check-pending-inquiries',
    name: '미처리 문의 체크',
    description: '미확인/미처리 문의를 집계하여 현황을 기록합니다.',
    cronExpr: '0 9 * * *',
  },
  {
    taskKey: 'expire-events',
    name: '만료 이벤트 자동 비공개',
    description: 'endDate가 지난 이벤트를 자동으로 published=false 처리합니다.',
    cronExpr: '0 0 * * *',
  },
  {
    taskKey: 'expire-jobs',
    name: '마감 채용공고 자동 비공개',
    description: 'deadline이 지난 채용공고를 자동으로 published=false 처리합니다.',
    cronExpr: '0 0 * * *',
  },
  {
    taskKey: 'expire-project-statuses',
    name: '종료 프로젝트 자동 비공개',
    description: 'endDate가 지난 프로젝트 현황을 자동으로 비공개 처리합니다.',
    cronExpr: '0 1 * * *',
  },
];

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /** 서버 시작 시 DB에 기본 작업 시드 + 활성 작업 등록 */
  async onModuleInit(): Promise<void> {
    // 기존 제거된 작업 정리
    await this.prisma.schedulerTask.deleteMany({ where: { taskKey: { in: ['expire-popups', 'complete-cody-projects'] } } });

    await this.seedDefaultTasks();
    await this.registerAllEnabled();
  }

  /** 기본 작업이 DB에 없으면 생성 */
  private async seedDefaultTasks(): Promise<void> {
    for (const task of DEFAULT_TASKS) {
      const existing = await this.prisma.schedulerTask.findUnique({
        where: { taskKey: task.taskKey },
      });
      if (!existing) {
        await this.prisma.schedulerTask.create({ data: task });
        this.logger.log(`시드 작업 생성: ${task.name}`);
      }
    }
  }

  /** DB에서 enabled=true인 작업들을 Cron에 등록 */
  private async registerAllEnabled(): Promise<void> {
    const tasks = await this.prisma.schedulerTask.findMany({ where: { enabled: true } });
    for (const task of tasks) {
      this.addCronJob(task.taskKey, task.cronExpr);
    }
    this.logger.log(`${tasks.length}개 스케줄 작업 등록 완료`);
  }

  /** 전체 목록 조회 */
  async findAll() {
    return this.prisma.schedulerTask.findMany({ orderBy: { id: 'asc' } });
  }

  /** 작업 활성화/비활성화 토글 */
  async toggle(taskKey: string): Promise<{ enabled: boolean }> {
    const task = await this.prisma.schedulerTask.findUnique({ where: { taskKey } });
    if (!task) throw new Error(`Task ${taskKey} not found`);

    const newEnabled = !task.enabled;

    if (newEnabled) {
      this.addCronJob(task.taskKey, task.cronExpr);
    } else {
      this.removeCronJob(task.taskKey);
    }

    await this.prisma.schedulerTask.update({
      where: { taskKey },
      data: { enabled: newEnabled },
    });

    this.logger.log(`작업 [${task.name}] ${newEnabled ? '활성화' : '비활성화'}`);
    return { enabled: newEnabled };
  }

  /** Cron 표현식 변경 */
  async updateCron(taskKey: string, cronExpr: string): Promise<void> {
    const task = await this.prisma.schedulerTask.findUnique({ where: { taskKey } });
    if (!task) throw new Error(`Task ${taskKey} not found`);

    await this.prisma.schedulerTask.update({ where: { taskKey }, data: { cronExpr } });

    // 활성 상태면 재등록
    if (task.enabled) {
      this.removeCronJob(taskKey);
      this.addCronJob(taskKey, cronExpr);
    }
  }

  /** 수동 실행 */
  async runNow(taskKey: string): Promise<{ message: string }> {
    return this.executeTask(taskKey);
  }

  // ────────────────────────────────────────
  // Cron Job 등록/해제
  // ────────────────────────────────────────

  private addCronJob(taskKey: string, cronExpr: string): void {
    this.removeCronJob(taskKey);

    const job = new CronJob(cronExpr, async () => {
      await this.executeTask(taskKey);
    });

    this.schedulerRegistry.addCronJob(taskKey, job);
    job.start();
    this.logger.log(`Cron 등록: [${taskKey}] ${cronExpr}`);
  }

  private removeCronJob(taskKey: string): void {
    try {
      this.schedulerRegistry.deleteCronJob(taskKey);
    } catch {
      // 등록 안 되어 있으면 무시
    }
  }

  // ────────────────────────────────────────
  // 실제 작업 실행 로직
  // ────────────────────────────────────────

  private async executeTask(taskKey: string): Promise<{ message: string }> {
    this.logger.log(`작업 실행 시작: ${taskKey}`);
    let message = '';

    try {
      switch (taskKey) {
        case 'check-pending-inquiries':
          message = await this.checkPendingInquiries();
          break;
        case 'expire-events':
          message = await this.expireEvents();
          break;
        case 'expire-jobs':
          message = await this.expireJobs();
          break;
        case 'expire-project-statuses':
          message = await this.expireProjectStatuses();
          break;
        default:
          message = `알 수 없는 작업: ${taskKey}`;
      }

      await this.prisma.schedulerTask.update({
        where: { taskKey },
        data: { lastRunAt: new Date(), lastResult: 'success', lastMessage: message },
      });

      this.logger.log(`작업 완료: ${taskKey} → ${message}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      await this.prisma.schedulerTask.update({
        where: { taskKey },
        data: { lastRunAt: new Date(), lastResult: 'error', lastMessage: errMsg },
      });
      this.logger.error(`작업 실패: ${taskKey} → ${errMsg}`);
      message = errMsg;
    }

    return { message };
  }

  /** 미처리 문의 체크 */
  private async checkPendingInquiries(): Promise<string> {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // 미확인 문의 (isRead = false)
    const unread = await this.prisma.inquiry.count({
      where: { isRead: false },
    });

    // PENDING 상태 문의
    const pending = await this.prisma.inquiry.count({
      where: { status: 'PENDING' },
    });

    // 3일 넘은 미처리 문의 (긴급)
    const overdue = await this.prisma.inquiry.count({
      where: {
        status: 'PENDING',
        createdAt: { lt: threeDaysAgo },
      },
    });

    const parts: string[] = [];
    parts.push(`미확인 ${unread}건`);
    parts.push(`미처리 ${pending}건`);
    if (overdue > 0) {
      parts.push(`⚠️ 3일 초과 ${overdue}건`);
    }

    return parts.join(' · ');
  }

  /** 만료된 이벤트 비공개 처리 */
  private async expireEvents(): Promise<string> {
    const now = new Date();
    const totalPublished = await this.prisma.event.count({ where: { published: true } });
    const result = await this.prisma.event.updateMany({
      where: {
        published: true,
        endDate: { lt: now },
      },
      data: { published: false },
    });
    return `${result.count}개 비공개 처리 (공개 중 ${totalPublished - result.count}개 유지)`;
  }

  /** 마감된 채용공고 비공개 처리 */
  private async expireJobs(): Promise<string> {
    const now = new Date();
    const totalPublished = await this.prisma.jobPosting.count({ where: { published: true } });
    const result = await this.prisma.jobPosting.updateMany({
      where: {
        published: true,
        deadline: { lt: now },
      },
      data: { published: false },
    });
    return `${result.count}개 비공개 처리 (공개 중 ${totalPublished - result.count}개 유지)`;
  }

  /** 종료된 프로젝트 현황 비공개 처리 */
  private async expireProjectStatuses(): Promise<string> {
    // KST 기준 오늘 자정(00:00:00)을 기준으로 비교
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const totalPublished = await this.prisma.projectStatus.count({ where: { published: true } });
    const result = await this.prisma.projectStatus.updateMany({
      where: {
        published: true,
        endDate: { lt: todayMidnight },
      },
      data: { published: false },
    });
    return `${result.count}개 비공개 처리 (공개 중 ${totalPublished - result.count}개 유지)`;
  }
}

