import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SuiviService } from './suivi.service';
import { CreateSuiviDto } from './dto/create-suivi.dto';

@ApiTags('Suivi')
@Controller('patients/:patientId/suivis')
export class SuiviController {
  constructor(private readonly service: SuiviService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les observations de suivi d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des observations de suivi' })
  findAll(@Param('patientId') patientId: string) {
    return this.service.findAllByPatient(patientId);
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter une observation de suivi' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 201, description: 'Observation de suivi créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Param('patientId') patientId: string, @Body() dto: CreateSuiviDto) {
    return this.service.create(patientId, dto);
  }
}
