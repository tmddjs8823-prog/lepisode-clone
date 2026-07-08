import { Module } from '@nestjs/common';
import { I18nManageService } from './i18n.service';
import { I18nManageController } from './i18n.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [I18nManageService],
  controllers: [I18nManageController],
})
export class I18nManageModule {}
