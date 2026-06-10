import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreatePrescriptionEndoscopieDto {
  @ApiProperty({
    description: 'Identifiant du prescripteur',
    example: 'dr-dupont',
  })
  @IsString()
  @IsNotEmpty()
  prescripteurId: string;

  @ApiProperty({
    description: 'Type d\'endoscopie',
    example: 'gastroscopie',
    enum: ['gastroscopie', 'coloscopie', 'bronchoscopie', 'cystoscopie'],
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({
    description: 'Urgence de la prescription',
    example: 'n',
    enum: ['n', 'o'],
  })
  @IsOptional()
  @IsString()
  urgence?: string;

  @ApiPropertyOptional({
    description: 'Anesthésie requise',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  anesthesie?: boolean;

  @ApiProperty({
    description: 'Renseignements cliniques',
    example: 'Douleurs abdominales, perte de poids',
  })
  @IsString()
  @IsNotEmpty()
  renseignements: string;

  @ApiPropertyOptional({
    description: 'Alertes particulières',
    example: 'Patient sous anticoagulants',
  })
  @IsOptional()
  @IsString()
  alertes?: string;

  @ApiPropertyOptional({
    description: 'Notes additionnelles',
    example: 'Préparation colique nécessaire',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
