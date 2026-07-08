import { Module } from '@nestjs/common';
import { CodyService } from './cody.service';
import { CodyController } from './cody.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CodyService],
  controllers: [CodyController],
})
export class CodyModule {}
