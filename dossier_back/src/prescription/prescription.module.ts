import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';
import { Prescription } from './entities/prescription.entity';
import { HistoriqueModule } from '../historique/historique.module';
import { IntegrationModule } from '../integration/integration.module';
import { PlanningModule } from '../planning/planning.module';
import { MedicaleService } from './services/medicale.service';
import { NonMedicaleService } from './services/non-medicale.service';
import { SurveillanceService } from './services/surveillance.service';
import { TransfusionService } from './services/transfusion.service';
import { BlocService } from './services/bloc.service';
import { LaboService } from './services/labo.service';
import { ImagerieService } from './services/imagerie.service';
import { AnapathService } from './services/anapath.service';
import { EegService } from './services/eeg.service';
import { KineService } from './services/kine.service';
import { DialyseService } from './services/dialyse.service';
import { EndoscopieService } from './services/endoscopie.service';
import { NotificationService } from './services/notification.service';
import { NotificationApiModule } from '../notification-api/notification-api.module';
import { ChuModule } from '../chu/chu.module';
import { PharmacieModule } from '../pharmacie/pharmacie.module';
import { MedicaleController } from './controllers/medicale.controller';
import { NonMedicaleController } from './controllers/non-medicale.controller';
import { SurveillanceController } from './controllers/surveillance.controller';
import { TransfusionController } from './controllers/transfusion.controller';
import { BlocController } from './controllers/bloc.controller';
import { LaboController } from './controllers/labo.controller';
import { ImagerieController } from './controllers/imagerie.controller';
import { AnapathController } from './controllers/anapath.controller';
import { EegController } from './controllers/eeg.controller';
import { KineController } from './controllers/kine.controller';
import { DialyseController } from './controllers/dialyse.controller';
import { EndoscopieController } from './controllers/endoscopie.controller';
import { PrescriptionMedicale } from './entities/prescription-medicale.entity';
import { Medicament } from './entities/medicament.entity';
import { Ordonnance } from './entities/ordonnance.entity';
import { PrescriptionNonMedicale } from './entities/prescription-non-medicale.entity';
import { ItemNonMedical } from './entities/item-non-medical.entity';
import { PrescriptionSurveillance } from './entities/prescription-surveillance.entity';
import { ParametreSurveillance } from './entities/parametre-surveillance.entity';
import { PrescriptionTransfusion } from './entities/prescription-transfusion.entity';
import { PrescriptionBloc } from './entities/prescription-bloc.entity';
import { PrescriptionLabo } from './entities/prescription-labo.entity';
import { PrescriptionImagerie } from './entities/prescription-imagerie.entity';
import { PrescriptionAnapath } from './entities/prescription-anapath.entity';
import { PrescriptionEEG } from './entities/prescription-eeg.entity';
import { PrescriptionKine } from './entities/prescription-kine.entity';
import { PrescriptionDialyse } from './entities/prescription-dialyse.entity';
import { PrescriptionEndoscopie } from './entities/prescription-endoscopie.entity';
import { PriseMedicament } from './entities/prise-medicament.entity';
import { Notification } from './entities/notification.entity';
import { TacheNonMedicale } from './entities/tache-non-medicale.entity';
import { SurveillanceParametre } from './entities/surveillance-parametre.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Prescription,
      PrescriptionMedicale,
      Medicament,
      Ordonnance,
      PrescriptionNonMedicale,
      ItemNonMedical,
      PrescriptionSurveillance,
      ParametreSurveillance,
      PrescriptionTransfusion,
      PrescriptionBloc,
      PrescriptionLabo,
      PrescriptionImagerie,
      PrescriptionAnapath,
      PrescriptionEEG,
      PrescriptionKine,
      PrescriptionDialyse,
      PrescriptionEndoscopie,
      PriseMedicament,
      Notification,
      TacheNonMedicale,
      SurveillanceParametre,
    ]),
    HttpModule,
    HistoriqueModule,
    IntegrationModule,
    PlanningModule,
    NotificationApiModule,
    ChuModule,
    PharmacieModule,
  ],
  controllers: [
    PrescriptionController,
    MedicaleController,
    NonMedicaleController,
    SurveillanceController,
    TransfusionController,
    BlocController,
    LaboController,
    ImagerieController,
    AnapathController,
    EegController,
    KineController,
    DialyseController,
    EndoscopieController,
  ],
  providers: [
    PrescriptionService,
    MedicaleService,
    NonMedicaleService,
    SurveillanceService,
    TransfusionService,
    BlocService,
    LaboService,
    ImagerieService,
    AnapathService,
    EegService,
    KineService,
    DialyseService,
    EndoscopieService,
    NotificationService,
  ],
  exports: [
    PrescriptionService,
    MedicaleService,
    NonMedicaleService,
    SurveillanceService,
    TransfusionService,
    BlocService,
    LaboService,
    ImagerieService,
    AnapathService,
    EegService,
    KineService,
    DialyseService,
    EndoscopieService,
    NotificationService,
  ],
})
export class PrescriptionModule {}
