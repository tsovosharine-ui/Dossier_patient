import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePrescriptionTransfusionDto {
  @ApiProperty({
    description: 'Identifiant du prescripteur',
    example: 'dr-dupont',
  })
  @IsString()
  @IsNotEmpty()
  prescripteurId: string;

  @ApiProperty({
    description: 'Type de produit sanguin',
    example: 'Culot globulaire',
    enum: ['Culot globulaire', 'Plaquettes', 'Plasma frais congelé', 'Sang total'],
  })
  @IsString()
  @IsNotEmpty()
  typeProduit: string;

  @ApiPropertyOptional({
    description: 'Groupe sanguin requis',
    example: 'O+',
  })
  @IsOptional()
  @IsString()
  groupeSanguin?: string;

  @ApiPropertyOptional({
    description: 'Rhésus requis',
    example: '+',
  })
  @IsOptional()
  @IsString()
  rhesus?: string;

  @ApiProperty({
    description: 'Nombre d\'unités',
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  nombreUnites: number;

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
    example: 'Anémie sévère Hb à 6.5 g/dL, patient symptomatique',
  })
  @IsString()
  @IsNotEmpty()
  renseignements: string;

  @ApiPropertyOptional({
    description: 'Alertes particulières',
    example: 'Patient avec antécédents de réaction transfusionnelle',
  })
  @IsOptional()
  @IsString()
  alertes?: string;

  @ApiPropertyOptional({
    description: 'Notes additionnelles',
    example: 'Effectuer groupage et RAI avant transfusion',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
