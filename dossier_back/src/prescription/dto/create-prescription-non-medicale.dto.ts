import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePrescriptionNonMedicaleDto {
  @ApiProperty({
    description: 'Identifiant du prescripteur',
    example: 'dr-dupont',
  })
  @IsString()
  @IsNotEmpty()
  prescripteurId: string;

  @ApiProperty({
    description: 'Type de prescription non médicale',
    example: ' régime',
    enum: ['régime', 'hydratation', 'repos', 'mobilisation', 'autres'],
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Détails de la prescription',
    example: 'Régime hyposodé strict (< 6g sel/jour)',
  })
  @IsString()
  @IsNotEmpty()
  details: string;

  @ApiPropertyOptional({
    description: 'Durée',
    example: 'Pendant toute l\'hospitalisation',
  })
  @IsOptional()
  @IsString()
  duree?: string;

  @ApiProperty({
    description: 'Renseignements cliniques',
    example: 'Patient insuffisant cardiaque avec rétention hydrosodée',
  })
  @IsString()
  @IsNotEmpty()
  renseignements: string;

  @ApiPropertyOptional({
    description: 'Notes additionnelles',
    example: 'Surveiller le poids quotidien',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
