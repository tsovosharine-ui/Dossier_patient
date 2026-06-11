import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsObject } from 'class-validator';

export class CreatePrescriptionImagerieDto {
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


  @ApiPropertyOptional({
    description: 'Urgence de la prescription',
    example: 'n',
    enum: ['n', 'o'],
  })
  @IsOptional()
  @IsString()
  urgence?: string;

  @ApiPropertyOptional({
    description: 'Alertes particulières',
    example: 'Patient porteur d\'un pacemaker',
  })
  @IsOptional()
  @IsString()
  alertes?: string;

  @ApiProperty({
    description: 'Renseignements cliniques',
    example: 'Douleur thoracique depuis 24h, suspicion d\'embolie pulmonaire',
  })
  @IsString()
  @IsNotEmpty()
  renseignements: string;

  @ApiPropertyOptional({
    description: 'Statut du patient',
    example: 'Ambulatoire',
  })
  @IsOptional()
  @IsString()
  statutPatient?: string;

  @ApiProperty({
    description: 'Examens demandés (format JSON)',
    example: [
      { type: 'TDM', region: 'Thorax', avec_contraste: true },
      { type: 'Radiographie', region: 'Thorax', incidences: ['Face', 'Profil'] }
    ],
    type: Array,
  })
  @IsObject()
  examens: any;

  @ApiPropertyOptional({
    description: 'Notes additionnelles',
    example: 'Réaliser en priorité',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
