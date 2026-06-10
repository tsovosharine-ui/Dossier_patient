import { Controller, Get, Post, Patch, Body, Param, Delete } from '@nestjs/common';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Prescriptions')
@Controller('patients/:patientId/prescriptions')
export class PrescriptionController {
  constructor(private readonly service: PrescriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une prescription générique' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 201, description: 'Prescription créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Param('patientId') patientId: string, @Body() createDto: CreatePrescriptionDto) {
    return this.service.create({ ...createDto, patientId });
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les prescriptions d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des prescriptions' })
  findAll(@Param('patientId') patientId: string) {
    return this.service.findAllByPatient(patientId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Récupérer les prescriptions actives d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des prescriptions actives' })
  findActive(@Param('patientId') patientId: string) {
    return this.service.findActiveByPatient(patientId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une prescription' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiParam({ name: 'id', description: 'ID de la prescription' })
  @ApiResponse({ status: 200, description: 'Prescription mise à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Prescription non trouvée' })
  update(
    @Param('patientId') patientId: string,
    @Param('id') id: string,
    @Body() updateData: Partial<CreatePrescriptionDto>,
  ) {
    return this.service.update(id, patientId, updateData);
  }

  @Patch(':id/validate')
  @ApiOperation({ summary: 'Valider une prescription' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiParam({ name: 'id', description: 'ID de la prescription' })
  @ApiResponse({ status: 200, description: 'Prescription validée avec succès' })
  @ApiResponse({ status: 404, description: 'Prescription non trouvée' })
  validate(@Param('patientId') patientId: string, @Param('id') id: string) {
    return this.service.validate(id, patientId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une prescription' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiParam({ name: 'id', description: 'ID de la prescription' })
  @ApiResponse({ status: 200, description: 'Prescription supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Prescription non trouvée' })
  remove(@Param('patientId') patientId: string, @Param('id') id: string) {
    return this.service.remove(id, patientId);
  }
}
