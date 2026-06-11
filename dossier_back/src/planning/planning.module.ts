import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { PlanningService } from './planning.service';
import { PlanningScheduler } from './planning.scheduler';
import { PlanningController } from './planning.controller';
import { Medicament } from '../prescription/entities/medicament.entity';
import { PriseMedicament } from '../prescription/entities/prise-medicament.entity';
import { ItemNonMedical } from '../prescription/entities/item-non-medical.entity';
import { TacheNonMedicale } from '../prescription/entities/tache-non-medicale.entity';
import { ParametreSurveillance } from '../prescription/entities/parametre-surveillance.entity';
import { SurveillanceParametre } from '../prescription/entities/surveillance-parametre.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Medicament,
      PriseMedicament,
      ItemNonMedical,
      TacheNonMedicale,
      ParametreSurveillance,
      SurveillanceParametre,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [PlanningController],
  providers: [PlanningService, PlanningScheduler],
  exports: [PlanningService],
})
export class PlanningModule {}
