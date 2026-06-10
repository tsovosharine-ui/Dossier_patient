import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreatePrescriptionKineDto {
  @ApiProperty({
    description: 'Identifiant du prescripteur',
    example: 'dr-dupont',
  })
  @IsString()
  @IsNotEmpty()
  prescripteurId: string;

  @ApiProperty({
    description: 'Type de kinésithérapie',
    example: 'rééducation motrice',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({
    description: 'Localisation',
    example: 'Membre inférieur droit',
  })
  @IsOptional()
  @IsString()
  localisation?: string;

  @ApiPropertyOptional({
    description: 'Nombre de séances',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  nombreSeances?: number;

  @ApiPropertyOptional({
    description: 'Fréquence par semaine',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  frequence?: number;

  @ApiPropertyOptional({
    description: 'Date de début',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiProperty({
    description: 'Renseignements cliniques',
    example: 'Post-opératoire prothèse totale de genou',
  })
  @IsString()
  @IsNotEmpty()
  renseignements: string;

  @ApiPropertyOptional({
    description: 'Notes additionnelles',
    example: 'Travail sur la mobilité et le renforcement',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
