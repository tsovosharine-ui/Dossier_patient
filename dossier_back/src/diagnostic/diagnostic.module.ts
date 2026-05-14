import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosticService } from './diagnostic.service';
import { DiagnosticController } from './diagnostic.controller';
import { Diagnostic } from './entities/diagnostic.entity';
import { HistoriqueModule } from '../historique/historique.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Diagnostic]),
    HistoriqueModule
  ],
  controllers: [DiagnosticController],
  providers: [DiagnosticService],
  exports: [DiagnosticService],
})
export class DiagnosticModule {}
