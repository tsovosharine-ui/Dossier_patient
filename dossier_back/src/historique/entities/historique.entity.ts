import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';

export enum TypeAction {
  CREATION = 'creation',
  MODIFICATION = 'modification',
  CONSULTATION = 'consultation',
  SUPPRESSION = 'suppression',
  SORTIE = 'sortie',
  TRANSFERT = 'transfert',
  VALIDATION = 'validation', // Ajouté pour les validations de prescription
}

@Entity('historiques')
export class Historique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'varchar' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'enum', enum: TypeAction, default: TypeAction.CONSULTATION })
  action: TypeAction;

  @Column({ type: 'varchar', length: 255, nullable: true })
  module: string;

  @Column({ type: 'jsonb', nullable: true })
  anciennesValeurs: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  nouvellesValeurs: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utilisateur: string;

  @Column({ type: 'text', nullable: true })
  commentaire: string;

  @CreateDateColumn({ name: 'date_action', type: 'timestamptz' })
  dateAction: Date;
}
