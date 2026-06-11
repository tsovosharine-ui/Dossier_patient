import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePrescriptionAnapathDto {
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
    description: 'Type de prélèvement',
    example: 'biopsie',
    enum: ['biopsie', 'pièce opératoire', 'cytologie', 'autopsie'],
  })
  @IsString()
  @IsNotEmpty()
  typePrelevement: string;

  @ApiProperty({
    description: 'Organe ou tissu concerné',
    example: 'Foie',
  })
  @IsString()
  @IsNotEmpty()
  organe: string;

  @ApiPropertyOptional({
    description: 'Urgence',
    example: 'n',
    enum: ['n', 'o', 'urgent'],
  })
  @IsOptional()
  @IsString()
  urgence?: string;

  @ApiProperty({
    description: 'Renseignements cliniques',
    example: 'Suspicion de tumeur hépatique, bilan d\'extension',
  })
  @IsString()
  @IsNotEmpty()
  renseignements: string;

  @ApiPropertyOptional({
    description: 'Contexte clinique',
    example: 'Patient avec cirrhose connue',
  })
  @IsOptional()
  @IsString()
  contexteClinique?: string;

  @ApiPropertyOptional({
    description: 'Questions spécifiques',
    example: 'Recherche de malignité, type tumoral',
  })
  @IsOptional()
  @IsString()
  questionsSpecifiques?: string;

  @ApiPropertyOptional({
    description: 'Notes additionnelles',
    example: 'Congeler une partie du prélèvement',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
