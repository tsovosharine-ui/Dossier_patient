import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreatePrescriptionDto {
  @ApiProperty({
    description: 'Identifiant du patient',
    example: 'CHU-2024-8842',
  })
  @IsString()
  patientId: string;

  @ApiProperty({
    description: 'Type de prescription (medicale, labo, imagerie, dialyse, endoscopie, etc.)',
    example: 'medicale',
    enum: ['medicale', 'labo', 'imagerie', 'dialyse', 'endoscopie', 'non-medicale', 'surveillance', 'transfusion', 'bloc', 'anapath', 'eeg', 'kine'],
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Contenu de la prescription',
    example: 'Paracétamol 1g x 3/jour pendant 5 jours',
  })
  @IsString()
  contenu: string;

  @ApiPropertyOptional({
    description: 'Prescripteur de la prescription',
    example: 'Dr. Dupont',
  })
  @IsOptional()
  @IsString()
  prescripteur?: string;

  @ApiPropertyOptional({
    description: 'Date de prescription',
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  datePrescription?: Date;

  @ApiPropertyOptional({
    description: 'Statut de validation de la prescription',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  valide?: boolean;
}
