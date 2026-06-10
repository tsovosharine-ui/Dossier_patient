import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DiagnosticService } from './diagnostic.service';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';

@ApiTags('Diagnostics')
@Controller('patients/:patientId/diagnostics')
export class DiagnosticController {
  constructor(private readonly service: DiagnosticService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les diagnostics d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des diagnostics' })
  findAll(@Param('patientId') patientId: string) {
    return this.service.findAllByPatient(patientId);
  }

  @Get('actif')
  @ApiOperation({ summary: 'Récupérer le diagnostic actif d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Diagnostic actif' })
  findActive(@Param('patientId') patientId: string) {
    return this.service.findActiveByPatient(patientId);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un diagnostic' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 201, description: 'Diagnostic créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Param('patientId') patientId: string, @Body() dto: CreateDiagnosticDto) {
    return this.service.create(patientId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un diagnostic' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiParam({ name: 'id', description: 'ID du diagnostic' })
  @ApiResponse({ status: 200, description: 'Diagnostic mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Diagnostic non trouvé' })
  update(
    @Param('patientId') patientId: string,
    @Param('id') id: string,
    @Body() dto: CreateDiagnosticDto,
  ) {
    return this.service.update(patientId, id, dto);
  }
}
