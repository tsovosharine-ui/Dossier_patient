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
import { NotificationApiModule } from './notification-api/notification-api.module';
import { ChuModule } from './chu/chu.module';
import { PatientSyncInterceptor } from './patient/patient-sync.interceptor';
import { PatientService } from './patient/patient.service';
import { Patient } from './patient/entities/patient.entity';

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
    NotificationApiModule,
    ChuModule,
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
