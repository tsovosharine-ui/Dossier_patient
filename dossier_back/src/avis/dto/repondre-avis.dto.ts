import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RepondreAvisDto {
  @ApiProperty({
    description: 'Réponse à la demande d\'avis',
    example: 'Recommandation: réaliser un scanner thoracique et spirométrie',
  })
  @IsString()
  @IsNotEmpty()
  reponse: string;

  @ApiProperty({
    description: 'Médecin ayant répondu à l\'avis',
    example: 'Dr. Martin',
  })
  @IsString()
  @IsNotEmpty()
  reponduPar: string;
}
