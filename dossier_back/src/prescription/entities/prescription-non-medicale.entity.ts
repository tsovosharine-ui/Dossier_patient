import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ItemNonMedical } from './item-non-medical.entity';

@Entity('prescription_non_medicale')
export class PrescriptionNonMedicale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'prescripteur_id' })
  prescripteurId: string;

  @Column({ default: 'ACTIVE' })
  statut: string;

  @Column({ name: 'notifier_infirmier', default: false })
  notifierInfirmier: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => ItemNonMedical, item => item.prescription)
  items: ItemNonMedical[];
}
