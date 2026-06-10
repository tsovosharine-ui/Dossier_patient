import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DialyseService } from '../services/dialyse.service';
import { CreatePrescriptionDialyseDto } from '../dto/create-prescription-dialyse.dto';

@ApiTags('Prescriptions Dialyse')
@Controller('prescriptions/dialyse')
export class DialyseController {
  constructor(private service: DialyseService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une prescription de dialyse' })
  @ApiResponse({ status: 201, description: 'Prescription de dialyse créée avec succès' })
  create(@Body() dto: CreatePrescriptionDialyseDto) {
    return this.service.create(dto.prescripteurId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les prescriptions de dialyse' })
  @ApiResponse({ status: 200, description: 'Liste complète des prescriptions de dialyse' })
  findAll() {
    return this.service.findAll();
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: "Récupérer toutes les prescriptions de dialyse d'un patient" })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des prescriptions de dialyse' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.service.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une prescription de dialyse par ID' })
  @ApiParam({ name: 'id', description: 'ID de la prescription' })
  @ApiResponse({ status: 200, description: 'Détails de la prescription de dialyse' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id/statut')
  @ApiOperation({ summary: "Mettre à jour le statut d'une prescription de dialyse" })
  @ApiParam({ name: 'id', description: 'ID de la prescription' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès' })
  updateStatut(@Param('id') id: string, @Body() dto: { statut: string }) {
    return this.service.updateStatut(id, dto.statut);
  }
}
