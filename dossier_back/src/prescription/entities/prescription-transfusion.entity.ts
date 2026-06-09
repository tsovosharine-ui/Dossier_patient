import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('prescription_transfusion')
export class PrescriptionTransfusion {
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

  @Column({ name: 'atcd_transfusion', default: false })
  atcdTransfusion: boolean;

  @Column({ nullable: true })
  incident: string;

  @Column()
  groupage: string;

  @Column({ nullable: true, type: 'float' })
  hb: number;

  @Column()
  produit: string;

  @Column({ nullable: true, type: 'float' })
  plaquettes: number;

  @Column({ nullable: true })
  quantite: string;

  @Column({ name: 'date_prevue', type: 'timestamptz', nullable: true })
  datePrevue: Date;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: 'ENVOYEE' })
  statut: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
