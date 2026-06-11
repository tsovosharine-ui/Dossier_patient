import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suivi } from './suivi.entity';
import { SuiviService } from './suivi.service';
import { SuiviController } from './suivi.controller';
import { HistoriqueModule } from '../historique/historique.module';
import { NotificationApiModule } from '../notification-api/notification-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Suivi]),
    HistoriqueModule,
    NotificationApiModule
  ],
  providers: [SuiviService],
  controllers: [SuiviController],
  exports: [SuiviService],
})
export class SuiviModule {}
