import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultatParacliniqueController } from './resultat-paraclinique.controller';
import { ResultatParacliniqueService } from './resultat-paraclinique.service';
import { ResultatParaclinique } from './entities/resultat-paraclinique.entity';
import { HistoriqueModule } from '../historique/historique.module';
import { NotificationApiModule } from '../notification-api/notification-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResultatParaclinique]),
    HistoriqueModule,
    NotificationApiModule,
  ],
  controllers: [ResultatParacliniqueController],
  providers: [ResultatParacliniqueService],
  exports: [ResultatParacliniqueService],
})
export class ResultatParacliniqueModule {}
