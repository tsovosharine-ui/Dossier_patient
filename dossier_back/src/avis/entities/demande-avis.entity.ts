import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum StatutDemande {
  EN_ATTENTE = 'en_attente',
  REPONDUE = 'repondue',
  ANNULEE = 'annulee',
}

@Entity('demandes_avis')
export class DemandeAvis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'varchar' })
  patientId: string;

  @Column({ name: 'service_demandeur', type: 'varchar' })
  serviceDemandeur: string;

  @Column({ name: 'service_destinataire', type: 'varchar' })
  serviceDestinataire: string;

  @Column({ type: 'text' })
  motif: string;

  @Column({ type: 'text', nullable: true })
  reponse: string | null;

  @Column({ name: 'repondu_par', type: 'varchar', nullable: true })
  reponduPar: string | null;

  @Column({ name: 'date_reponse', type: 'timestamp', nullable: true })
  dateReponse: Date | null;

  @Column({ type: 'enum', enum: StatutDemande, default: StatutDemande.EN_ATTENTE })
  statut: StatutDemande;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
