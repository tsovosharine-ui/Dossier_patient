import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CrOperatoireService } from './cr-operatoire.service';
import { CrOperatoire } from './cr-operatoire.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('CR Opératoire')
@Controller('patients/:patientId/cr-operatoire')
export class CrOperatoireController {
  constructor(private readonly service: CrOperatoireService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les comptes rendus opératoires d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des comptes rendus opératoires' })
  findAll(@Param('patientId') patientId: string) {
    return this.service.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un compte rendu opératoire par ID' })
  @ApiParam({ name: 'id', description: 'ID du compte rendu opératoire' })
  @ApiResponse({ status: 200, description: 'Détails du compte rendu opératoire' })
  @ApiResponse({ status: 404, description: 'Compte rendu opératoire non trouvé' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un compte rendu opératoire' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 201, description: 'Compte rendu opératoire créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Param('patientId') patientId: string, @Body() body: Partial<CrOperatoire>) {
    return this.service.create(patientId, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un compte rendu opératoire' })
  @ApiParam({ name: 'id', description: 'ID du compte rendu opératoire' })
  @ApiResponse({ status: 200, description: 'Compte rendu opératoire mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Compte rendu opératoire non trouvé' })
  update(@Param('id') id: string, @Body() body: Partial<CrOperatoire>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un compte rendu opératoire' })
  @ApiParam({ name: 'id', description: 'ID du compte rendu opératoire' })
  @ApiResponse({ status: 200, description: 'Compte rendu opératoire supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Compte rendu opératoire non trouvé' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
