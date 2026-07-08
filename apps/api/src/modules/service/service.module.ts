import { Module } from '@nestjs/common';
import { ServiceManageService } from './service.service';
import { ServiceManageController } from './service.controller';

@Module({
  providers: [ServiceManageService],
  controllers: [ServiceManageController],
})
export class ServiceManageModule {}
