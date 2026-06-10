import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Patients')
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau patient' })
  @ApiResponse({ status: 201, description: 'Patient créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  create(@Body() dto: CreatePatientDto) {
    return this.patientService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les patients' })
  @ApiResponse({ status: 200, description: 'Liste complète des patients' })
  findAll() {
    return this.patientService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un patient par ID' })
  @ApiParam({ name: 'id', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Détails du patient' })
  @ApiResponse({ status: 404, description: 'Patient non trouvé' })
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un patient' })
  @ApiParam({ name: 'id', description: 'ID du patient' })
  @ApiResponse({ status: 200, description: 'Patient mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Patient non trouvé' })
  update(@Param('id') id: string, @Body() dto: Partial<CreatePatientDto>) {
    return this.patientService.update(id, dto);
  }
}
