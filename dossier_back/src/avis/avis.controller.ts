import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { AvisService } from './avis.service';
import { CreateDemandeAvisDto } from './dto/create-demande-avis.dto';
import { RepondreAvisDto } from './dto/repondre-avis.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Avis interservices')
@Controller('patients/:patientId/avis')
export class AvisController {
  constructor(private readonly avisService: AvisService) {}

  @Post()
  create(@Param('patientId') patientId: string, @Body() dto: CreateDemandeAvisDto) {
    return this.avisService.create(patientId, dto);
  }

  @Get()
  findAll(@Param('patientId') patientId: string) {
    return this.avisService.findByPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('patientId') patientId: string, @Param('id') id: string) {
    return this.avisService.findOne(id, patientId);
  }

  @Put(':id/repondre')
  repondre(
    @Param('patientId') patientId: string,
    @Param('id') id: string,
    @Body() dto: RepondreAvisDto,
  ) {
    return this.avisService.repondre(id, patientId, dto);
  }
}
