import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { SortieService } from './sortie.service';
import { Sortie } from './sortie.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Sortie')
@Controller('patients/:patientId/sortie')
export class SortieController {
  constructor(private readonly service: SortieService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer les informations de sortie d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Informations de sortie' })
  findAll(@Param('patientId') patientId: string) {
    return this.service.findByPatient(patientId);
  }

  @Post()
  @ApiOperation({ summary: 'Créer ou mettre à jour les informations de sortie' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Informations de sortie enregistrées avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  upsert(@Param('patientId') patientId: string, @Body() body: Partial<Sortie>) {
    return this.service.upsert(patientId, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour les informations de sortie' })
  @ApiParam({ name: 'id', description: 'ID de la sortie' })
  @ApiResponse({ status: 200, description: 'Informations de sortie mises à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Sortie non trouvée' })
  update(@Param('id') id: string, @Body() body: Partial<Sortie>) {
    return this.service.update(id, body);
  }

  @Put(':id/valider')
  @ApiOperation({ summary: 'Valider la sortie avec signature' })
  @ApiParam({ name: 'id', description: 'ID de la sortie' })
  @ApiResponse({ status: 200, description: 'Sortie validée avec succès' })
  @ApiResponse({ status: 404, description: 'Sortie non trouvée' })
  valider(@Param('id') id: string, @Body() body: { signatureData: string }) {
    return this.service.valider(id, body.signatureData);
  }
}
