import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PrescriptionMedicale } from './prescription-medicale.entity';

@Entity('ordonnance')
export class Ordonnance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'prescription_id', unique: true })
  prescriptionId: string;

  @Column({ type: 'json' })
  medicaments: any;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => PrescriptionMedicale, prescription => prescription.ordonnance)
  @JoinColumn({ name: 'prescription_id' })
  prescription: PrescriptionMedicale;
}
