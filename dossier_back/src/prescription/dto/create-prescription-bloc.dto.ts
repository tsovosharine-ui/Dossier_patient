import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsDateString } from 'class-validator';

export class CreatePrescriptionBlocDto {
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
    description: 'Type d\'intervention',
    example: 'chirurgie',
    enum: ['chirurgie', 'endoscopie', 'radiologie interventionnelle'],
  })
  @IsString()
  @IsNotEmpty()
  typeIntervention: string;

  @ApiProperty({
    description: 'Intervention prévue',
    example: 'Appendicectomie',
  })
  @IsString()
  @IsNotEmpty()
  intervention: string;

  @ApiPropertyOptional({
    description: 'Date prévue',
    example: '2024-01-20',
  })
  @IsOptional()
  @IsDateString()
  datePrevue?: string;

  @ApiPropertyOptional({
    description: 'Urgence',
    example: 'n',
    enum: ['n', 'o', 'urgence'],
  })
  @IsOptional()
  @IsString()
  urgence?: string;

  @ApiPropertyOptional({
    description: 'Type d\'anesthésie',
    example: 'générale',
    enum: ['générale', 'locorégionale', 'locale', 'sédation'],
  })
  @IsOptional()
  @IsString()
  typeAnesthesie?: string;

  @ApiProperty({
    description: 'Renseignements cliniques',
    example: 'Appendicite aiguë confirmée par scanner',
  })
  @IsString()
  @IsNotEmpty()
  renseignements: string;

  @ApiPropertyOptional({
    description: 'Alertes particulières',
    example: 'Patient allergique aux antibiotiques bêta-lactamines',
  })
  @IsOptional()
  @IsString()
  alertes?: string;

  @ApiPropertyOptional({
    description: 'Notes additionnelles',
    example: 'Prévoir antibioprophylaxie per-opératoire',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
