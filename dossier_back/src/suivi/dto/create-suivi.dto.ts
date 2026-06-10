import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSuiviDto {
  @ApiPropertyOptional({
    description: 'Jour d\'hospitalisation',
    example: 'J+3',
  })
  @IsString()
  @IsOptional()
  jourHospitalisation?: string;

  @ApiPropertyOptional({
    description: 'Température corporelle en °C',
    example: 37.5,
  })
  @IsNumber()
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional({
    description: 'Tension artérielle systolique en mmHg',
    example: '120',
  })
  @IsString()
  @IsOptional()
  taSystolique?: string;

  @ApiPropertyOptional({
    description: 'Tension artérielle diastolique en mmHg',
    example: '80',
  })
  @IsString()
  @IsOptional()
  taDiastolique?: string;

  @ApiPropertyOptional({
    description: 'Fréquence cardiaque en battements/minute',
    example: '72',
  })
  @IsString()
  @IsOptional()
  frequenceCardiaque?: string;

  @ApiPropertyOptional({
    description: 'Fréquence respiratoire en cycles/minute',
    example: '16',
  })
  @IsString()
  @IsOptional()
  frequenceRespiratoire?: string;

  @ApiPropertyOptional({
    description: 'Échelle visuelle analogique de la douleur (0-10)',
    example: 3,
  })
  @IsNumber()
  @IsOptional()
  evaDouleur?: number;

  @ApiPropertyOptional({
    description: 'État général du patient',
    example: 'Stable',
  })
  @IsString()
  @IsOptional()
  etatGeneral?: string;

  @ApiPropertyOptional({
    description: 'Résultats de l\'examen clinique',
    example: 'Auscultation pulmonaire normale, abdomen souple',
  })
  @IsString()
  @IsOptional()
  examenClinique?: string;

  @ApiPropertyOptional({
    description: 'Évolution de l\'état du patient',
    example: 'Amélioration depuis l\'admission',
  })
  @IsString()
  @IsOptional()
  evolution?: string;

  @ApiPropertyOptional({
    description: 'Présence de signes d\'alerte',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  signesAlerte?: boolean;

  @ApiPropertyOptional({
    description: 'Auteur du suivi',
    example: 'Infirmier(e) Chef Martin',
  })
  @IsString()
  @IsOptional()
  auteur?: string;
}
