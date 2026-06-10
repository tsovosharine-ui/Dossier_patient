import { Controller, Get, Put, Post, Param, Body } from '@nestjs/common';
import { ObservationService } from './observation.service';
import { UpsertObservationDto } from './dto/upsert-observation.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Observations')
@Controller('patients/:patientId/observation')
export class ObservationController {
  constructor(private readonly observationService: ObservationService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer les observations d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Observations du patient' })
  get(@Param('patientId') patientId: string) {
    return this.observationService.getByPatient(patientId);
  }

  @Put()
  @ApiOperation({ summary: 'Créer ou mettre à jour les observations d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Observations mises à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  upsert(
    @Param('patientId') patientId: string,
    @Body() dto: UpsertObservationDto,
  ) {
    return this.observationService.upsert(patientId, dto);
  }

  @Post('valider')
  @ApiOperation({ summary: 'Valider les observations d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Observations validées avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  valider(
    @Param('patientId') patientId: string,
    @Body() dto: UpsertObservationDto,
  ) {
    return this.observationService.valider(patientId, dto);
  }
}
