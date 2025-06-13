import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FlowsService } from './flows.service';
import { FlowsController } from './flows.controller';
import { ScreensRouter } from './screens-router.provider';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [EncryptionModule, ConfigModule],
  controllers: [FlowsController],
  providers: [FlowsService, ScreensRouter],
})
export class FlowsModule {}
