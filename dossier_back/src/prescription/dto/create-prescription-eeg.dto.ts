import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsBoolean, IsDateString, IsNumber } from 'class-validator';

export class CreatePrescriptionEegDto {
  @ApiProperty({
    description: 'Identifiant du prescripteur',
    example: 'dr-dupont',
  })
  @IsString()
  @IsNotEmpty()
  prescripteurId: string;

  @ApiProperty({
    description: 'Type d\'EEG',
    example: 'EEG standard',
    enum: ['EEG standard', 'EEG de longue durée', 'EEG vidéo', 'EEG en urgence'],
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({
    description: 'Urgence',
    example: 'n',
    enum: ['n', 'o', 'urgent'],
  })
  @IsOptional()
  @IsString()
  urgence?: string;

  @ApiPropertyOptional({
    description: 'Durée en heures',
    example: 24,
  })
  @IsOptional()
  @IsNumber()
  duree?: number;

  @ApiPropertyOptional({
    description: 'Avec vidéo',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  avecVideo?: boolean;

  @ApiPropertyOptional({
    description: 'Date souhaitée',
    example: '2024-01-16',
  })
  @IsOptional()
  @IsDateString()
  dateSouhaitee?: string;

  @ApiProperty({
    description: 'Renseignements cliniques',
    example: 'Suspicion d\'épilepsie, patient avec épisodes de perte de conscience',
  })
  @IsString()
  @IsNotEmpty()
  renseignements: string;

  @ApiPropertyOptional({
    description: 'Alertes particulières',
    example: 'Patient sous médicaments pro-convulsivants',
  })
  @IsOptional()
  @IsString()
  alertes?: string;

  @ApiPropertyOptional({
    description: 'Notes additionnelles',
    example: 'En cas de crise, enregistrer l\'heure',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
