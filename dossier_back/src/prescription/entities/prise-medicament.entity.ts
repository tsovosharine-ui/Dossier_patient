import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Medicament } from './medicament.entity';

@Entity('prise_medicament')
export class PriseMedicament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medicament_id' })
  medicamentId: string;

  @Column({ name: 'prescription_id' })
  prescriptionId: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'heure_prevue', type: 'timestamptz' })
  heurePrevue: Date;

  @Column({ default: 'EN_ATTENTE' })
  statut: string;

  @Column({ name: 'motif_refus', nullable: true })
  motifRefus: string;

  @Column({ name: 'confirme_at', type: 'timestamptz', nullable: true })
  confirmeAt: Date;

  @Column({ name: 'notif_envoyee_at', type: 'timestamptz', nullable: true })
  notifEnvoyeeAt: Date;

  @Column({ default: 0 })
  tentatives: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Medicament, medicament => medicament.prisesMedicament)
  @JoinColumn({ name: 'medicament_id' })
  medicament: Medicament;
}
