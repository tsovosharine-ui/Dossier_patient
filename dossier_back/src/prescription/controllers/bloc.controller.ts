import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BlocService } from '../services/bloc.service';
import { CreatePrescriptionBlocDto } from '../dto/create-prescription-bloc.dto';

@ApiTags('Prescriptions Bloc')
@Controller('prescriptions/bloc')
export class BlocController {
  constructor(private service: BlocService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une prescription de bloc' })
  @ApiResponse({ status: 201, description: 'Prescription de bloc créée avec succès' })
  create(@Body() dto: CreatePrescriptionBlocDto) {
    return this.service.create(dto.prescripteurId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les prescriptions de bloc' })
  @ApiResponse({ status: 200, description: 'Liste complète des prescriptions de bloc' })
  findAll() {
    return this.service.findAll();
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: "Récupérer toutes les prescriptions de bloc d'un patient" })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des prescriptions de bloc' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.service.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une prescription de bloc par ID' })
  @ApiParam({ name: 'id', description: 'ID de la prescription' })
  @ApiResponse({ status: 200, description: 'Détails de la prescription de bloc' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id/statut')
  @ApiOperation({ summary: "Mettre à jour le statut d'une prescription de bloc" })
  @ApiParam({ name: 'id', description: 'ID de la prescription' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès' })
  updateStatut(@Param('id') id: string, @Body() dto: { statut: string }) {
    return this.service.updateStatut(id, dto.statut);
  }
}
