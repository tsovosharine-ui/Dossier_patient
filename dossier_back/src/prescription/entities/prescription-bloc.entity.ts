import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('prescription_bloc')
export class PrescriptionBloc {
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
  libelle: string;

  @Column({ nullable: true })
  cote: string;

  @Column({ name: 'date_intervention', type: 'timestamptz', nullable: true })
  dateIntervention: Date;

  @Column({ name: 'risque_hemorragique', nullable: true })
  risqueHemorragique: string;

  @Column({ name: 'type_chirurgie', nullable: true })
  typeChirurgie: string;

  @Column({ nullable: true })
  consignes: string;

  @Column({ nullable: true })
  chirurgien: string;

  @Column({ default: 'DEMANDE_CPA' })
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
