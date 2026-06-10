import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePrescriptionLaboDto {
  @ApiProperty({
    description: 'Identifiant du prescripteur',
    example: 'dr-dupont',
  })
  @IsString()
  @IsNotEmpty()
  prescripteurId: string;

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
    example: 'Patient allergique aux pénicillines',
  })
  @IsOptional()
  @IsString()
  alertes?: string;

  @ApiPropertyOptional({
    description: 'Renseignements cliniques',
    example: 'Patient hospitalisé pour suspicion d\'infection urinaire',
  })
  @IsOptional()
  @IsString()
  renseignements?: string;

  @ApiProperty({
    description: 'Liste des analyses demandées',
    example: ['NFS', 'CRP', 'Urée', 'Créatinine', 'ECBU'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  analyses: string[];

  @ApiPropertyOptional({
    description: 'Notes additionnelles',
    example: 'Prélever le matin à jeun',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
