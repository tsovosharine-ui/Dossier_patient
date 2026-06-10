import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SurveillanceService } from '../services/surveillance.service';
import { CreatePrescriptionSurveillanceDto } from '../dto/create-prescription-surveillance.dto';

@ApiTags('Prescriptions Surveillance')
@Controller('prescriptions/surveillance')
export class SurveillanceController {
  constructor(private service: SurveillanceService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une prescription de surveillance' })
  @ApiResponse({ status: 201, description: 'Prescription de surveillance créée avec succès' })
  create(@Body() dto: CreatePrescriptionSurveillanceDto) {
    return this.service.create(dto.prescripteurId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les prescriptions de surveillance' })
  @ApiResponse({ status: 200, description: 'Liste complète des prescriptions de surveillance' })
  findAll() {
    return this.service.findAll();
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: "Récupérer toutes les prescriptions de surveillance d'un patient" })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des prescriptions de surveillance' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.service.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une prescription de surveillance par ID' })
  @ApiParam({ name: 'id', description: 'ID de la prescription' })
  @ApiResponse({ status: 200, description: 'Détails de la prescription de surveillance' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id/statut')
  @ApiOperation({ summary: "Mettre à jour le statut d'une prescription de surveillance" })
  @ApiParam({ name: 'id', description: 'ID de la prescription' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès' })
  updateStatut(@Param('id') id: string, @Body() dto: { statut: string }) {
    return this.service.updateStatut(id, dto.statut);
  }
}
