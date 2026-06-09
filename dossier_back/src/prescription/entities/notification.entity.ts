import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  destinataire: string;

  @Column({ name: 'expediteur_id' })
  expediteurId: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'reference_id' })
  referenceId: string;

  @Column({ name: 'reference_type' })
  referenceType: string;

  @Column()
  titre: string;

  @Column({ type: 'json' })
  contenu: any;

  @Column({ default: 'EN_ATTENTE' })
  statut: string;

  @Column({ default: 0 })
  tentatives: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'lu_at', type: 'timestamptz', nullable: true })
  luAt: Date;
}
