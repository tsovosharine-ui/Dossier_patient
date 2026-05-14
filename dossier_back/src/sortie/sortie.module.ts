import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SortieController } from './sortie.controller';
import { SortieService } from './sortie.service';
import { Sortie } from './sortie.entity';
import { HistoriqueModule } from '../historique/historique.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sortie]),
    HistoriqueModule
  ],
  controllers: [SortieController],
  providers: [SortieService],
  exports: [SortieService]
})
export class SortieModule {}
