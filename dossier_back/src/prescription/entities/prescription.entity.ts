import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'varchar' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'text' })
  contenu: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  prescripteur: string;

  @Column({ type: 'timestamptz', nullable: true })
  datePrescription: Date;

  @Column({ type: 'boolean', default: false })
  valide: boolean;

  @Column({ type: 'varchar', default: 'ACTIVE' })
  statut: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
