import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PatientModule } from './patient/patient.module';
import { ObservationModule } from './observation/observation.module';
import { DiagnosticModule } from './diagnostic/diagnostic.module';
import { SortieModule } from './sortie/sortie.module';
import { CrOperatoireModule } from './cr-operatoire/cr-operatoire.module';
import { SuiviModule } from './suivi/suivi.module';
import { ResultatParacliniqueModule } from './resultat-paraclinique/resultat-paraclinique.module';
import { HistoriqueModule } from './historique/historique.module';
import { AvisModule } from './avis/avis.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { IntegrationModule } from './integration/integration.module';
import { PatientSyncInterceptor } from './patient/patient-sync.interceptor';
import { PatientService } from './patient/patient.service';
import { Patient } from './patient/entities/patient.entity';
import { PrescriptionMedicale } from './prescription/entities/prescription-medicale.entity';
import { Medicament } from './prescription/entities/medicament.entity';
import { Ordonnance } from './prescription/entities/ordonnance.entity';
import { PrescriptionNonMedicale } from './prescription/entities/prescription-non-medicale.entity';
import { ItemNonMedical } from './prescription/entities/item-non-medical.entity';
import { PrescriptionSurveillance } from './prescription/entities/prescription-surveillance.entity';
import { ParametreSurveillance } from './prescription/entities/parametre-surveillance.entity';
import { PrescriptionTransfusion } from './prescription/entities/prescription-transfusion.entity';
import { PrescriptionBloc } from './prescription/entities/prescription-bloc.entity';
import { PrescriptionLabo } from './prescription/entities/prescription-labo.entity';
import { PrescriptionImagerie } from './prescription/entities/prescription-imagerie.entity';
import { PrescriptionAnapath } from './prescription/entities/prescription-anapath.entity';
import { PrescriptionEEG } from './prescription/entities/prescription-eeg.entity';
import { PrescriptionKine } from './prescription/entities/prescription-kine.entity';
import { PrescriptionDialyse } from './prescription/entities/prescription-dialyse.entity';
import { PrescriptionEndoscopie } from './prescription/entities/prescription-endoscopie.entity';
import { PriseMedicament } from './prescription/entities/prise-medicament.entity';
import { Notification } from './prescription/entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: { rejectUnauthorized: false },
      }),
    }),
    TypeOrmModule.forFeature([
      Patient,
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
    ]),
    PatientModule,
    ObservationModule,
    DiagnosticModule,
    SortieModule,
    CrOperatoireModule,
    SuiviModule,
    ResultatParacliniqueModule,
    HistoriqueModule,
    AvisModule,
    PrescriptionModule,
    IntegrationModule,
  ],
  providers: [
    PatientService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PatientSyncInterceptor,
    },
  ],
})
export class AppModule {}
