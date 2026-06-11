import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { NotificationApiService } from './notification-api.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [NotificationApiService],
  exports: [NotificationApiService],
})
export class NotificationApiModule {}
