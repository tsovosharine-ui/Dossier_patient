import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ChuService } from './chu.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [ChuService],
  exports: [ChuService],
})
export class ChuModule {}
