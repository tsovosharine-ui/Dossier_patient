import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PrescriptionSurveillance } from './prescription-surveillance.entity';

@Entity('parametre_surveillance')
export class ParametreSurveillance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'prescription_id' })
  prescriptionId: string;

  @Column()
  parametre: string;

  @Column()
  frequence: string;

  @Column({ nullable: true })
  duree: string;

  @Column({ nullable: true })
  seuil: string;

  @Column({ type: 'json', nullable: true })
  details: any;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => PrescriptionSurveillance, prescription => prescription.parametres)
  @JoinColumn({ name: 'prescription_id' })
  prescription: PrescriptionSurveillance;
}
