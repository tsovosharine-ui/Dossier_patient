import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
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

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}
