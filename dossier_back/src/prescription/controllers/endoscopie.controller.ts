import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EndoscopieService } from '../services/endoscopie.service';
import { CreatePrescriptionEndoscopieDto } from '../dto/create-prescription-endoscopie.dto';

@ApiTags('Prescriptions Endoscopie')
@Controller('prescriptions/endoscopie')
export class EndoscopieController {
  constructor(private service: EndoscopieService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une prescription d\'endoscopie' })
  @ApiResponse({ status: 201, description: 'Prescription d\'endoscopie créée avec succès' })
  create(@Body() dto: CreatePrescriptionEndoscopieDto) {
    return this.service.create(dto.prescripteurId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les prescriptions d\'endoscopie' })
  @ApiResponse({ status: 200, description: 'Liste complète des prescriptions d\'endoscopie' })
  findAll() {
    return this.service.findAll();
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: "Récupérer toutes les prescriptions d'endoscopie d'un patient" })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des prescriptions d\'endoscopie' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.service.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une prescription d\'endoscopie par ID' })
  @ApiParam({ name: 'id', description: 'ID de la prescription' })
  @ApiResponse({ status: 200, description: 'Détails de la prescription d\'endoscopie' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id/statut')
  @ApiOperation({ summary: "Mettre à jour le statut d'une prescription d'endoscopie" })
  @ApiParam({ name: 'id', description: 'ID de la prescription' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès' })
  updateStatut(@Param('id') id: string, @Body() dto: { statut: string }) {
    return this.service.updateStatut(id, dto.statut);
  }
}
