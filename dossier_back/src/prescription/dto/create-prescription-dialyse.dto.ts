import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreatePrescriptionDialyseDto {
  @ApiProperty({
    description: 'Identifiant du prescripteur',
    example: 'dr-dupont',
  })
  @IsString()
  @IsNotEmpty()
  prescripteurId: string;

  @ApiPropertyOptional({
    description: 'Type de dialyse',
    example: 'hémodialyse',
    enum: ['hémodialyse', 'dialyse péritonéale'],
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Durée de la séance en heures',
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  duree?: number;

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

  @ApiPropertyOptional({
    description: 'Renseignements cliniques',
    example: 'Patient insuffisant rénal chronique',
  })
  @IsOptional()
  @IsString()
  renseignements?: string;

  @ApiPropertyOptional({
    description: 'Notes additionnelles',
    example: 'Surveiller la tension avant et après séance',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
