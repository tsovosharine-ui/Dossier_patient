import { TypeExamen, StatutResultat } from '../entities/resultat-paraclinique.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class UpdateResultatParacliniqueDto {
  @ApiPropertyOptional({
    description: 'Type d\'examen',
    example: 'LABORATOIRE',
    enum: ['LABORATOIRE', 'IMAGERIE', 'ECHOGRAPHIE', 'ENDOSCOPIE', 'AUTRE'],
  })
  @IsOptional()
  @IsString()
  type?: TypeExamen;

  @ApiPropertyOptional({
    description: 'Nom de l\'examen',
    example: 'NFS, CRP, Ionogramme',
  })
  @IsOptional()
  @IsString()
  examen?: string;

  @ApiPropertyOptional({
    description: 'Date de demande de l\'examen',
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  dateDemande?: Date;

  @ApiPropertyOptional({
    description: 'Date de réception du résultat',
    example: '2024-01-16T14:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  dateResultat?: Date | null;

  @ApiPropertyOptional({
    description: 'Résultat sous forme texte',
    example: 'NFS: Hb 12.5 g/dL, Plaquettes 250 G/L, CRP 15 mg/L',
  })
  @IsOptional()
  @IsString()
  resultatTexte?: string | null;

  @ApiPropertyOptional({
    description: 'Fichiers de résultats (URLs)',
    example: ['https://storage.example.com/resultat1.pdf'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resultatFichiers?: string[] | null;

  @ApiPropertyOptional({
    description: 'Prescripteur de l\'examen',
    example: 'Dr. Dupont',
  })
  @IsOptional()
  @IsString()
  prescripteur?: string | null;

  @ApiPropertyOptional({
    description: 'Statut du résultat',
    example: 'NORMAL',
    enum: ['NORMAL', 'PATHOLOGIQUE', 'EN_ATTENTE', 'ANNULE'],
  })
  @IsOptional()
  statut?: StatutResultat;

  @ApiPropertyOptional({
    description: 'Commentaire sur le résultat',
    example: 'Résultats dans les limites normales',
  })
  @IsOptional()
  @IsString()
  commentaire?: string | null;
}
