import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PharmacieService } from './pharmacie.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [PharmacieService],
  exports: [PharmacieService],
})
export class PharmacieModule {}
