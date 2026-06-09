import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { PrescriptionMedicale } from './prescription-medicale.entity';
import { PriseMedicament } from './prise-medicament.entity';

@Entity('medicament')
export class Medicament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'prescription_id' })
  prescriptionId: string;

  @Column()
  nom: string;

  @Column()
  dose: string;

  @Column({ default: 1 })
  quantite: number;

  @Column({ nullable: true })
  voie: string;

  @Column({ nullable: true })
  frequence: string;

  @Column({ nullable: true })
  duree: string;

  @Column({ name: 'frequence_type', nullable: true })
  frequenceType: string;

  @Column({ name: 'frequence_valeur', nullable: true, type: 'int' })
  frequenceValeur: number;

  @Column({ name: 'intervalle_minutes', nullable: true, type: 'int' })
  intervalleMinutes: number;

  @Column({ name: 'duree_jours', nullable: true, type: 'int' })
  dureeJours: number;

  @Column({ name: 'date_debut', type: 'timestamptz', nullable: true })
  dateDebut: Date;

  @Column({ name: 'heure_debut', nullable: true })
  heureDebut: string;

  @Column({ nullable: true })
  instructions: string;

  @Column({ nullable: true })
  remarques: string;

  @Column({ name: 'planning_actif', default: true })
  planningActif: boolean;

  @Column({ name: 'date_debut_effective', type: 'timestamptz', nullable: true })
  dateDebutEffective: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => PrescriptionMedicale, prescription => prescription.medicaments)
  @JoinColumn({ name: 'prescription_id' })
  prescription: PrescriptionMedicale;

  @OneToMany(() => PriseMedicament, prise => prise.medicament)
  prisesMedicament: PriseMedicament[];
}
