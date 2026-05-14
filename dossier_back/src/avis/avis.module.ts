import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandeAvis } from './entities/demande-avis.entity';
import { AvisService } from './avis.service';
import { AvisController } from './avis.controller';
import { HistoriqueModule } from '../historique/historique.module';

@Module({
  imports: [TypeOrmModule.forFeature([DemandeAvis]), HistoriqueModule],
  providers: [AvisService],
  controllers: [AvisController],
  exports: [AvisService],
})
export class AvisModule {}
