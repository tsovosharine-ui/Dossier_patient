import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suivi } from './suivi.entity';
import { SuiviService } from './suivi.service';
import { SuiviController } from './suivi.controller';
import { HistoriqueModule } from '../historique/historique.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Suivi]),
    HistoriqueModule
  ],
  providers: [SuiviService],
  controllers: [SuiviController],
  exports: [SuiviService],
})
export class SuiviModule {}
