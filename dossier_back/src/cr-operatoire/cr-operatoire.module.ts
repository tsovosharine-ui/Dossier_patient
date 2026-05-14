import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrOperatoire } from './cr-operatoire.entity';
import { CrOperatoireService } from './cr-operatoire.service';
import { CrOperatoireController } from './cr-operatoire.controller';
import { HistoriqueModule } from '../historique/historique.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CrOperatoire]),
    HistoriqueModule
  ],
  providers: [CrOperatoireService],
  controllers: [CrOperatoireController],
})
export class CrOperatoireModule {}
