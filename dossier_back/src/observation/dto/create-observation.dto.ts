import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateObservationDto {
  @ApiPropertyOptional({
    description: 'Données de l\'observation (format JSON flexible)',
    example: { note: 'Patient stable', constantes: { TA: '120/80', FC: '72' } },
  })
  @IsOptional()
  data?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Statut de l\'observation',
    example: 'brouillon',
    enum: ['brouillon', 'valide', 'archive'],
  })
  @IsOptional()
  @IsString()
  statut?: string;

  @ApiPropertyOptional({
    description: 'Personne ayant validé l\'observation',
    example: 'Dr. Martin',
  })
  @IsOptional()
  @IsString()
  validePar?: string;

  @ApiPropertyOptional({
    description: 'Date de validation de l\'observation',
    example: '2024-01-15T14:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  dateValidation?: Date;
}
