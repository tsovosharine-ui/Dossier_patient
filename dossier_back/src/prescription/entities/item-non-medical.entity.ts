import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
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

  @Column({ name: 'intervalle_minutes', nullable: true, type: 'int' })
  intervalleMinutes: number | null;

  @Column({ name: 'duree_jours', nullable: true, type: 'int' })
  dureeJours: number | null;

  @Column({ name: 'planning_actif', default: true })
  planningActif: boolean;

  @Column({ name: 'date_debut_effective', type: 'timestamptz', nullable: true })
  dateDebutEffective: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => PrescriptionNonMedicale, prescription => prescription.items)
  @JoinColumn({ name: 'prescription_id' })
  prescription: PrescriptionNonMedicale;
}
