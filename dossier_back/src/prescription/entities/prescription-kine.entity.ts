import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('prescription_kine')
export class PrescriptionKine {
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

  @Column({ name: 'type_kine' })
  typeKine: string;

  @Column({ name: 'autre_kine', nullable: true })
  autreKine: string;

  @Column({ nullable: true })
  diagnostic: string;

  @Column({ type: 'text', array: true })
  contreIndications: string[];

  @Column({ name: 'autre_contre_indic', nullable: true })
  autreContreIndic: string;

  @Column({ nullable: true })
  objectifs: string;

  @Column({ nullable: true })
  remarques: string;

  @Column({ default: 'CREEE' })
  statut: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
