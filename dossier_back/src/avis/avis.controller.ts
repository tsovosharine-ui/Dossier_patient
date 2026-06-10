import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { AvisService } from './avis.service';
import { CreateDemandeAvisDto } from './dto/create-demande-avis.dto';
import { RepondreAvisDto } from './dto/repondre-avis.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Avis interservices')
@Controller('patients/:patientId/avis')
export class AvisController {
  constructor(private readonly avisService: AvisService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une demande d\'avis interservices' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 201, description: 'Demande d\'avis créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Param('patientId') patientId: string, @Body() dto: CreateDemandeAvisDto) {
    return this.avisService.create(patientId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les demandes d\'avis d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des demandes d\'avis' })
  findAll(@Param('patientId') patientId: string) {
    return this.avisService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une demande d\'avis par ID' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiParam({ name: 'id', description: 'ID de la demande d\'avis' })
  @ApiResponse({ status: 200, description: 'Détails de la demande d\'avis' })
  @ApiResponse({ status: 404, description: 'Demande d\'avis non trouvée' })
  findOne(@Param('patientId') patientId: string, @Param('id') id: string) {
    return this.avisService.findOne(id, patientId);
  }

  @Put(':id/repondre')
  @ApiOperation({ summary: 'Répondre à une demande d\'avis' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiParam({ name: 'id', description: 'ID de la demande d\'avis' })
  @ApiResponse({ status: 200, description: 'Réponse enregistrée avec succès' })
  @ApiResponse({ status: 404, description: 'Demande d\'avis non trouvée' })
  repondre(
    @Param('patientId') patientId: string,
    @Param('id') id: string,
    @Body() dto: RepondreAvisDto,
  ) {
    return this.avisService.repondre(id, patientId, dto);
  }
}
