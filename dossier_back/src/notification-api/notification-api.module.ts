import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { NotificationApiService } from './notification-api.service';
import { DossierNotifierService } from './dossier-notifier.service';
import { ChuModule } from '../chu/chu.module';
import { DialyseModule } from '../dialyse/dialyse.module';

@Module({
  imports: [HttpModule, ConfigModule, ChuModule, DialyseModule],
  providers: [NotificationApiService, DossierNotifierService],
  exports: [NotificationApiService, DossierNotifierService],
})
export class NotificationApiModule {}
