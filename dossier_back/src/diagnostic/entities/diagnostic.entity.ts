import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';

@Entity('diagnostics')
export class Diagnostic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'varchar' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'text', nullable: true })
  diagnosticPrincipal: string;

  @Column({ type: 'text', nullable: true })
  diagnosticsSecondaires: string;

  @Column({ type: 'text', nullable: true })
  justificationClinique: string;

  @Column({ type: 'text', nullable: true })
  diagnosticsDifferentiels: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  graviteStade: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  medecinResponsable: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
