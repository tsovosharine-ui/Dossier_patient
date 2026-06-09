import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ParametreSurveillance } from './parametre-surveillance.entity';

@Entity('prescription_surveillance')
export class PrescriptionSurveillance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'prescripteur_id' })
  prescripteurId: string;

  @Column({ default: 'ACTIVE' })
  statut: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ name: 'notifier_infirmier', default: false })
  notifierInfirmier: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => ParametreSurveillance, parametre => parametre.prescription)
  parametres: ParametreSurveillance[];
}
