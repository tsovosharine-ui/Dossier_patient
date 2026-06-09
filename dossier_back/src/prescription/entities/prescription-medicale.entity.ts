import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Medicament } from './medicament.entity';
import { Ordonnance } from './ordonnance.entity';

@Entity('prescription_medicale')
export class PrescriptionMedicale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'prescripteur_id' })
  prescripteurId: string;

  @Column({ default: 'ACTIVE' })
  statut: string;

  @Column({ nullable: true })
  remarques: string;

  @Column({ name: 'notifier_infirmier', default: false })
  notifierInfirmier: boolean;

  @Column({ name: 'statut_sync', nullable: true })
  statutSync: string;

  @Column({ name: 'sync_error', nullable: true })
  syncError: string;

  @Column({ name: 'synced_at', type: 'timestamptz', nullable: true })
  syncedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Medicament, medicament => medicament.prescription)
  medicaments: Medicament[];

  @OneToMany(() => Ordonnance, ordonnance => ordonnance.prescription)
  ordonnance: Ordonnance[];
}
