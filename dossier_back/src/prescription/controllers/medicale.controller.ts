import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MedicaleService } from '../services/medicale.service';
import { CreatePrescriptionMedicaleDto } from '../dto/create-prescription-medicale.dto';

@ApiTags('Prescriptions Médicales')
@Controller('prescriptions/medicale')
export class MedicaleController {
  constructor(private service: MedicaleService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une prescription médicale' })
  @ApiResponse({ status: 201, description: 'Prescription médicale créée avec succès' })
  create(@Body() dto: CreatePrescriptionMedicaleDto) {
    return this.service.create(dto.prescripteurId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les prescriptions médicales' })
  @ApiResponse({ status: 200, description: 'Liste complète des prescriptions médicales' })
  findAll() {
    return this.service.findAll();
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: "Récupérer toutes les prescriptions médicales d'un patient" })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des prescriptions médicales' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.service.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une prescription médicale par ID' })
  @ApiParam({ name: 'id', description: 'ID de la prescription' })
  @ApiResponse({ status: 200, description: 'Détails de la prescription médicale' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/ordonnance')
  @ApiOperation({ summary: 'Créer une ordonnance pour une prescription médicale' })
  @ApiParam({ name: 'id', description: 'ID de la prescription' })
  @ApiResponse({ status: 201, description: 'Ordonnance créée avec succès' })
  createOrdonnance(@Param('id') id: string, @Body() dto: { medicaments: any[] }) {
    return this.service.createOrdonnance(id, dto.medicaments);
  }

  @Put(':id/statut')
  @ApiOperation({ summary: "Mettre à jour le statut d'une prescription médicale" })
  @ApiParam({ name: 'id', description: 'ID de la prescription' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès' })
  updateStatut(@Param('id') id: string, @Body() dto: { statut: string }) {
    return this.service.updateStatut(id, dto.statut);
  }
}
