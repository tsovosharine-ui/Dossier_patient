import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreatePrescriptionMedicaleDto {
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
    description: 'Statut de la prescription',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'ARCHIVEE'],
  })
  @IsOptional()
  @IsString()
  statut?: string;

  @ApiPropertyOptional({
    description: 'Remarques sur la prescription',
    example: 'Adapter en fonction de la fonction rénale',
  })
  @IsOptional()
  @IsString()
  remarques?: string;

  @ApiPropertyOptional({
    description: 'Notifier l\'infirmier',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  notifierInfirmier?: boolean;
}
