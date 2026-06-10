import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateDiagnosticDto {
  @ApiPropertyOptional({
    description: 'Diagnostic principal du patient',
    example: 'Insuffisance cardiaque congestive',
  })
  @IsOptional()
  @IsString()
  diagnosticPrincipal?: string;

  @ApiPropertyOptional({
    description: 'Diagnostics secondaires associés',
    example: 'Hypertension artérielle, Diabète type 2',
  })
  @IsOptional()
  @IsString()
  diagnosticsSecondaires?: string;

  @ApiPropertyOptional({
    description: 'Justification clinique du diagnostic',
    example: 'Présence de dyspnée, œdèmes des membres inférieurs, B3 à l\'auscultation',
  })
  @IsOptional()
  @IsString()
  justificationClinique?: string;

  @ApiPropertyOptional({
    description: 'Diagnostics différentiels envisagés',
    example: 'Insuffisance respiratoire, BPCO',
  })
  @IsOptional()
  @IsString()
  diagnosticsDifferentiels?: string;

  @ApiPropertyOptional({
    description: 'Gravité ou stade de la pathologie',
    example: 'Stade III NYHA',
  })
  @IsOptional()
  @IsString()
  graviteStade?: string;

  @ApiPropertyOptional({
    description: 'Statut actif du diagnostic',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Médecin responsable du diagnostic',
    example: 'Dr. Dupont',
  })
  @IsOptional()
  @IsString()
  medecinResponsable?: string;
}
