import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PlanningService } from './planning.service';

@ApiTags('Planning')
@Controller('planning')
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  // Prises de médicaments
  @Post('prises/:id/confirmer')
  @ApiOperation({ summary: 'Confirmer une prise de médicament' })
  @ApiParam({ name: 'id', description: 'ID de la prise' })
  @ApiResponse({ status: 200, description: 'Prise confirmée avec succès' })
  async confirmerPrise(@Param('id') id: string) {
    return this.planningService.confirmerPriseMedicament(id);
  }

  @Post('prises/:id/refuser')
  @ApiOperation({ summary: 'Refuser une prise de médicament' })
  @ApiParam({ name: 'id', description: 'ID de la prise' })
  @ApiResponse({ status: 200, description: 'Prise refusée avec succès' })
  async refuserPrise(@Param('id') id: string, @Body() body: { motif: string }) {
    return this.planningService.refuserPriseMedicament(id, body.motif);
  }

  @Post('medicaments/:id/arreter')
  @ApiOperation({ summary: 'Arrêter le planning d\'un médicament' })
  @ApiParam({ name: 'id', description: 'ID du médicament' })
  @ApiResponse({ status: 200, description: 'Planning arrêté avec succès' })
  async arreterPlanningMedicament(@Param('id') id: string) {
    return this.planningService.arreterPlanningMedicament(id);
  }

  @Get('prises/patient/:patientId/actives')
  @ApiOperation({ summary: 'Récupérer les prises actives d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des prises actives' })
  async getPrisesActives(@Param('patientId') patientId: string) {
    return this.planningService.getPrisesActivesPatient(patientId);
  }

  // Tâches non médicales
  @Post('taches/:id/confirmer')
  @ApiOperation({ summary: 'Confirmer une tâche non médicale' })
  @ApiParam({ name: 'id', description: 'ID de la tâche' })
  @ApiResponse({ status: 200, description: 'Tâche confirmée avec succès' })
  async confirmerTache(@Param('id') id: string) {
    return this.planningService.confirmerTacheNonMedicale(id);
  }

  @Post('taches/:id/refuser')
  @ApiOperation({ summary: 'Refuser une tâche non médicale' })
  @ApiParam({ name: 'id', description: 'ID de la tâche' })
  @ApiResponse({ status: 200, description: 'Tâche refusée avec succès' })
  async refuserTache(@Param('id') id: string, @Body() body: { motif: string }) {
    return this.planningService.refuserTacheNonMedicale(id, body.motif);
  }

  @Post('items-non-medicaux/:id/arreter')
  @ApiOperation({ summary: 'Arrêter le planning d\'un item non médical' })
  @ApiParam({ name: 'id', description: 'ID de l\'item' })
  @ApiResponse({ status: 200, description: 'Planning arrêté avec succès' })
  async arreterPlanningNonMedical(@Param('id') id: string) {
    return this.planningService.arreterPlanningNonMedical(id);
  }

  @Get('taches/patient/:patientId/actives')
  @ApiOperation({ summary: 'Récupérer les tâches actives d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des tâches actives' })
  async getTachesActives(@Param('patientId') patientId: string) {
    return this.planningService.getTachesActivesPatient(patientId);
  }

  // Surveillances de paramètres
  @Post('surveillances/:id/confirmer')
  @ApiOperation({ summary: 'Confirmer une surveillance de paramètre' })
  @ApiParam({ name: 'id', description: 'ID de la surveillance' })
  @ApiResponse({ status: 200, description: 'Surveillance confirmée avec succès' })
  async confirmerSurveillance(@Param('id') id: string) {
    return this.planningService.confirmerSurveillanceParametre(id);
  }

  @Post('surveillances/:id/refuser')
  @ApiOperation({ summary: 'Refuser une surveillance de paramètre' })
  @ApiParam({ name: 'id', description: 'ID de la surveillance' })
  @ApiResponse({ status: 200, description: 'Surveillance refusée avec succès' })
  async refuserSurveillance(@Param('id') id: string, @Body() body: { motif: string }) {
    return this.planningService.refuserSurveillanceParametre(id, body.motif);
  }

  @Post('parametres-surveillance/:id/arreter')
  @ApiOperation({ summary: 'Arrêter le planning d\'un paramètre de surveillance' })
  @ApiParam({ name: 'id', description: 'ID du paramètre' })
  @ApiResponse({ status: 200, description: 'Planning arrêté avec succès' })
  async arreterPlanningSurveillance(@Param('id') id: string) {
    return this.planningService.arreterPlanningSurveillance(id);
  }

  @Get('surveillances/patient/:patientId/actives')
  @ApiOperation({ summary: 'Récupérer les surveillances actives d\'un patient' })
  @ApiParam({ name: 'patientId', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Liste des surveillances actives' })
  async getSurveillancesActives(@Param('patientId') patientId: string) {
    return this.planningService.getSurveillancesActivesPatient(patientId);
  }
}
