import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PrescriptionSurveillance } from './prescription-surveillance.entity';

@Entity('parametre_surveillance')
export class ParametreSurveillance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'prescription_id' })
  prescriptionId: string;

  @Column()
  parametre: string;

  @Column()
  frequence: string;

  @Column({ nullable: true })
  duree: string;

  @Column({ nullable: true })
  seuil: string;

  @Column({ type: 'json', nullable: true })
  details: any;

  @Column({ name: 'date_debut', type: 'timestamptz', nullable: true })
  dateDebut: Date;

  @Column({ name: 'heure_debut', nullable: true })
  heureDebut: string;

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

  @ManyToOne(() => PrescriptionSurveillance, prescription => prescription.parametres)
  @JoinColumn({ name: 'prescription_id' })
  prescription: PrescriptionSurveillance;
}
