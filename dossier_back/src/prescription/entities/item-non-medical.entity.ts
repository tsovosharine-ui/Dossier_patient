import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PrescriptionNonMedicale } from './prescription-non-medicale.entity';

@Entity('item_non_medical')
export class ItemNonMedical {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'prescription_id' })
  prescriptionId: string;

  @Column()
  type: string;

  @Column({ name: 'type_label', nullable: true })
  typeLabel: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  duree: string;

  @Column({ nullable: true })
  frequence: string;

  @Column({ name: 'date_debut', type: 'timestamptz', nullable: true })
  dateDebut: Date;

  @Column({ name: 'heure_debut', nullable: true })
  heureDebut: string;

  @Column({ nullable: true })
  instructions: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => PrescriptionNonMedicale, prescription => prescription.items)
  @JoinColumn({ name: 'prescription_id' })
  prescription: PrescriptionNonMedicale;
}
