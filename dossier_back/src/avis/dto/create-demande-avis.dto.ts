import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDemandeAvisDto {
  @ApiProperty({
    description: 'Service demandeur de l\'avis',
    example: 'Cardiologie',
  })
  @IsString()
  @IsNotEmpty()
  serviceDemandeur: string;

  @ApiProperty({
    description: 'Service destinataire de l\'avis',
    example: 'Pneumologie',
  })
  @IsString()
  @IsNotEmpty()
  serviceDestinataire: string;

  @ApiProperty({
    description: 'Motif de la demande d\'avis',
    example: 'Patient avec dyspnée persistante nécessitant avis pneumologique',
  })
  @IsString()
  @IsNotEmpty()
  motif: string;
}
