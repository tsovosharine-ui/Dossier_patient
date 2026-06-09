import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriseMedicament } from '../entities/prise-medicament.entity';
import { Medicament } from '../entities/medicament.entity';

@Injectable()
export class PlanningService {
  constructor(
    @InjectRepository(PriseMedicament)
    private priseRepo: Repository<PriseMedicament>,
    @InjectRepository(Medicament)
    private medicamentRepo: Repository<Medicament>,
  ) {}

  calculerIntervalleMinutes(frequenceType: string, frequenceValeur: number): number | undefined {
    switch (frequenceType) {
      case 'HEURES':
        return frequenceValeur * 60;
      case 'PAR_JOUR':
        return (24 * 60) / frequenceValeur;
      default:
        return undefined;
    }
  }

  async genererPlanningMedicament(medicamentId: string) {
    const medicament = await this.medicamentRepo.findOne({ where: { id: medicamentId } });
    if (!medicament) return null;

    const now = new Date();
    const plannedDoses: any[] = [];
    
    if (medicament.intervalleMinutes) {
      const dosesPerDay = Math.floor((24 * 60) / medicament.intervalleMinutes);
      for (let i = 0; i < dosesPerDay; i++) {
        const heurePrevue = new Date(now);
        heurePrevue.setMinutes(now.getMinutes() + (i * medicament.intervalleMinutes));
        
        plannedDoses.push({
          medicamentId,
          prescriptionId: medicament.prescriptionId,
          patientId: medicament.prescriptionId, // Will be updated when we have patient data
          heurePrevue,
          statut: 'EN_ATTENTE',
        });
      }
    }

    return this.priseRepo.save(plannedDoses);
  }
}
