import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('prescription_imagerie')
export class PrescriptionImagerie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'prescripteur_id' })
  prescripteurId: string;

  @Column({ default: 'n' })
  urgence: string;

  @Column({ nullable: true })
  alertes: string;

  @Column()
  renseignements: string;

  @Column({ name: 'statut_patient', nullable: true })
  statutPatient: string;

  @Column({ type: 'json' })
  examens: any;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: 'CREEE' })
  statut: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
