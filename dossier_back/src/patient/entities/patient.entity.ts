import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('patients')
export class Patient {
  @PrimaryColumn({ length: 20 })
  id: string;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 100 })
  prenom: string;

  @Column({ type: 'date', nullable: true })
  dateNaissance: Date;

  @Column({ length: 1, nullable: true })
  sexe: string;

  @Column({ length: 5, nullable: true })
  groupeSanguin: string;

  @Column({ nullable: true })
  adresse: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ length: 50, nullable: true })
  profession: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
