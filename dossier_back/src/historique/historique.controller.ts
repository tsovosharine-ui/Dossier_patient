import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { HistoriqueService } from './historique.service';
import { CreateHistoriqueDto } from './dto/create-historique.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Historique')
@Controller('patients/:patientId/historique')
export class HistoriqueController {
  constructor(private readonly service: HistoriqueService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un événement dans l\'historique médical' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 201, description: 'Événement créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Param('patientId') patientId: string, @Body() createDto: CreateHistoriqueDto) {
    return this.service.create({ ...createDto, patientId });
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer l\'historique médical d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Historique médical du patient' })
  findAll(@Param('patientId') patientId: string) {
    return this.service.findAllByPatient(patientId);
  }
}
