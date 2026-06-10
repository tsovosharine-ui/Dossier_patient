import { Controller, Get, Post, Put, Delete, Patch, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ResultatParacliniqueService } from './resultat-paraclinique.service';
import { CreateResultatParacliniqueDto } from './dto/create-resultat-paraclinique.dto';
import { UpdateResultatParacliniqueDto } from './dto/update-resultat-paraclinique.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Résultats paracliniques')
@Controller('patients/:patientId/resultats')
export class ResultatParacliniqueController {
  constructor(private readonly service: ResultatParacliniqueService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un résultat paraclinique' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 201, description: 'Résultat créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Param('patientId') patientId: string, @Body() createDto: CreateResultatParacliniqueDto) {
    return this.service.create({ ...createDto, patientId });
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les résultats paracliniques d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des résultats paracliniques' })
  findAll(@Param('patientId') patientId: string) {
    return this.service.findAllByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un résultat paraclinique par ID' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiParam({ name: 'id', description: 'ID du résultat' })
  @ApiResponse({ status: 200, description: 'Détails du résultat paraclinique' })
  @ApiResponse({ status: 404, description: 'Résultat non trouvé' })
  findOne(@Param('patientId') patientId: string, @Param('id') id: string) {
    return this.service.findOne(id, patientId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un résultat paraclinique' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiParam({ name: 'id', description: 'ID du résultat' })
  @ApiResponse({ status: 200, description: 'Résultat mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Résultat non trouvé' })
  update(@Param('patientId') patientId: string, @Param('id') id: string, @Body() updateDto: UpdateResultatParacliniqueDto) {
    return this.service.update(id, patientId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un résultat paraclinique' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiParam({ name: 'id', description: 'ID du résultat' })
  @ApiResponse({ status: 204, description: 'Résultat supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Résultat non trouvé' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('patientId') patientId: string, @Param('id') id: string) {
    return this.service.remove(id, patientId);
  }

  @Patch(':id/lu')
  @ApiOperation({ summary: 'Marquer un résultat comme lu' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiParam({ name: 'id', description: 'ID du résultat' })
  @ApiResponse({ status: 200, description: 'Résultat marqué comme lu' })
  @ApiResponse({ status: 404, description: 'Résultat non trouvé' })
  marquerLu(@Param('patientId') patientId: string, @Param('id') id: string) {
    return this.service.marquerLu(id, patientId);
  }
}
