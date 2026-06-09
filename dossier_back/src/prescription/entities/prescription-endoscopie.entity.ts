import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('prescription_endoscopie')
export class PrescriptionEndoscopie {
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

  @Column({ name: 'type_examen' })
  typeExamen: string;

  @Column({ name: 'autre_examen', nullable: true })
  autreExamen: string;

  @Column({ nullable: true })
  remarques: string;

  @Column({ default: 'CREEE' })
  statut: string;

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
}
