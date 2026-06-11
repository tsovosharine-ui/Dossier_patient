import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DialyseService } from './dialyse.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [DialyseService],
  exports: [DialyseService],
})
export class DialyseModule {}
