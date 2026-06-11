import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';

export class CreatePrescriptionSurveillanceDto {
  @ApiProperty({
    description: 'Identifiant du prescripteur',
    example: 'dr-dupont',
  })
  @IsString()
  @IsNotEmpty()
  prescripteurId: string;

  @ApiProperty({
    description: 'Identifiant du patient',
    example: 'IP-2026-00001',
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;


  @ApiProperty({
    description: 'Type de surveillance',
    example: 'surveillance glycémique',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({
    description: 'Fréquence',
    example: 'toutes les 4 heures',
  })
  @IsOptional()
  @IsString()
  frequence?: string;

  @ApiPropertyOptional({
    description: 'Nombre de mesures par jour',
    example: 6,
  })
  @IsOptional()
  @IsNumber()
  nombreMesures?: number;

  @ApiPropertyOptional({
    description: 'Durée en jours',
    example: 7,
  })
  @IsOptional()
  @IsNumber()
  duree?: number;

  @ApiPropertyOptional({
    description: 'Seuil d\'alerte',
    example: 'Glycémie > 2.5 g/L',
  })
  @IsOptional()
  @IsString()
  seuilAlerte?: string;

  @ApiPropertyOptional({
    description: 'Notifier en cas d\'alerte',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notifierAlerte?: boolean;

  @ApiProperty({
    description: 'Renseignements cliniques',
    example: 'Patient diabétique type 2, nouvellement hospitalisé',
  })
  @IsString()
  @IsNotEmpty()
  renseignements: string;

  @ApiPropertyOptional({
    description: 'Notes additionnelles',
    example: 'Surveiller également la pression artérielle',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
