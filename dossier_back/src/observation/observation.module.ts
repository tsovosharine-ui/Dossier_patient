import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObservationService } from './observation.service';
import { ObservationController } from './observation.controller';
import { Observation } from './entities/observation.entity';
import { HistoriqueModule } from '../historique/historique.module';
import { NotificationApiModule } from '../notification-api/notification-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Observation]),
    HistoriqueModule,
    NotificationApiModule
  ],
  controllers: [ObservationController],
  providers: [ObservationService],
  exports: [ObservationService],
})
export class ObservationModule {}
