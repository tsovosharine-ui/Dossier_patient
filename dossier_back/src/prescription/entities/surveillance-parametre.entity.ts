import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ParametreSurveillance } from './parametre-surveillance.entity';

@Entity('surveillance_parametre')
export class SurveillanceParametre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parametre_id' })
  parametreId: string;

  @Column({ name: 'prescription_id' })
  prescriptionId: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'heure_prevue', type: 'timestamptz' })
  heurePrevue: Date;

  @Column({ default: 'EN_ATTENTE' })
  statut: string;

  @Column({ nullable: true })
  motifRefus: string;

  @Column({ name: 'confirme_at', type: 'timestamptz', nullable: true })
  confirmeAt: Date;

  @Column({ name: 'notif_envoyee_at', type: 'timestamptz', nullable: true })
  notifEnvoyeeAt: Date;

  @Column({ default: 0 })
  tentatives: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => ParametreSurveillance)
  @JoinColumn({ name: 'parametre_id' })
  parametre: ParametreSurveillance;
}
