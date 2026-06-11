import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ItemNonMedical } from './item-non-medical.entity';

@Entity('tache_non_medicale')
export class TacheNonMedicale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'item_id' })
  itemId: string;

  @Column({ name: 'prescription_id' })
  prescriptionId: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'heure_prevue', type: 'timestamptz' })
  heurePrevue: Date;

  @Column({ default: 'EN_ATTENTE' })
  statut: string;

  @Column({ nullable: true })
  motifRefus: string;

  @Column({ name: 'confirme_at', type: 'timestamptz', nullable: true })
  confirmeAt: Date;

  @Column({ name: 'notif_envoyee_at', type: 'timestamptz', nullable: true })
  notifEnvoyeeAt: Date;

  @Column({ default: 0 })
  tentatives: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => ItemNonMedical)
  @JoinColumn({ name: 'item_id' })
  item: ItemNonMedical;
}
