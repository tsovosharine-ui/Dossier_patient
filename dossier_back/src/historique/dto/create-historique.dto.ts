import { TypeAction } from '../entities/historique.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateHistoriqueDto {
  @ApiProperty({
    description: 'Identifiant du patient',
    example: 'CHU-2024-8842',
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Type d\'action effectuée',
    example: 'CREATION',
    enum: ['CREATION', 'MODIFICATION', 'SUPPRESSION', 'VALIDATION'],
  })
  @IsString()
  @IsNotEmpty()
  action: TypeAction;

  @ApiPropertyOptional({
    description: 'Module concerné par l\'action',
    example: 'prescriptions',
  })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({
    description: 'Anciennes valeurs avant modification',
    example: { statut: 'brouillon' },
  })
  @IsOptional()
  anciennesValeurs?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Nouvelles valeurs après modification',
    example: { statut: 'valide' },
  })
  @IsOptional()
  nouvellesValeurs?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Utilisateur ayant effectué l\'action',
    example: 'Dr. Dupont',
  })
  @IsOptional()
  @IsString()
  utilisateur?: string;

  @ApiPropertyOptional({
    description: 'Commentaire sur l\'action',
    example: 'Validation de la prescription suite à avis pharmacologique',
  })
  @IsOptional()
  @IsString()
  commentaire?: string;
}
