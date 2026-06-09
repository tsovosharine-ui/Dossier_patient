import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicament } from '../entities/medicament.entity';
import { PriseMedicament } from '../entities/prise-medicament.entity';
import { PrescriptionMedicale } from '../entities/prescription-medicale.entity';

@Injectable()
export class PlanningService {
  constructor(
    @InjectRepository(Medicament)
    private medicamentRepo: Repository<Medicament>,
    @InjectRepository(PriseMedicament)
    private priseMedicamentRepo: Repository<PriseMedicament>,
    @InjectRepository(PrescriptionMedicale)
    private prescriptionMedicaleRepo: Repository<PrescriptionMedicale>,
  ) {}

  /**
   * Calcule l'intervalle en minutes à partir du type et de la valeur de fréquence
   */
  calculerIntervalleMinutes(
    frequenceType: string,
    frequenceValeur?: number,
  ): number | null {
    switch (frequenceType) {
      case 'HEURES':
        return frequenceValeur ? frequenceValeur * 60 : null;
      case 'PAR_JOUR':
        return frequenceValeur ? Math.floor((24 * 60) / frequenceValeur) : null;
      case 'SOS':
      case 'CONTINU':
        return null;
      default:
        return null;
    }
  }

  /**
   * Génère le planning des prises pour un médicament
   */
  async genererPlanningMedicament(medicamentId: string) {
    const medicament = await this.medicamentRepo.findOne({
      where: { id: medicamentId },
      relations: ['prescription'],
    });

    if (!medicament) {
      throw new Error('Médicament introuvable');
    }

    if (!medicament.intervalleMinutes || !medicament.planningActif) {
      return;
    }

    const dateDebut = medicament.dateDebutEffective || new Date();

    if (!medicament.dureeJours) {
      await this.creerPrise(medicament, dateDebut);
      return;
    }

    const dateFin = new Date(dateDebut);
    dateFin.setDate(dateFin.getDate() + medicament.dureeJours);

    const heureCourante = new Date(dateDebut);

    if (medicament.heureDebut) {
      const [heures, minutes] = medicament.heureDebut.split(':').map(Number);
      heureCourante.setHours(heures, minutes, 0, 0);
    }

    while (heureCourante < dateFin) {
      await this.creerPrise(medicament, new Date(heureCourante));
      heureCourante.setMinutes(
        heureCourante.getMinutes() + medicament.intervalleMinutes,
      );
    }
  }

  /**
   * Crée une prise médicament
   */
  private async creerPrise(medicament: Medicament, heurePrevue: Date) {
    const prise = this.priseMedicamentRepo.create({
      medicamentId: medicament.id,
      prescriptionId: medicament.prescriptionId,
      patientId: medicament.prescription.patientId,
      heurePrevue,
      statut: 'EN_ATTENTE',
    });
    return this.priseMedicamentRepo.save(prise);
  }

  /**
   * Confirme une prise et génère la suivante si nécessaire
   */
  async confirmerPrise(priseId: string) {
    const prise = await this.priseMedicamentRepo.findOne({
      where: { id: priseId },
      relations: ['medicament'],
    });

    if (!prise) {
      throw new Error('Prise introuvable');
    }

    prise.statut = 'CONFIRME';
    prise.confirmeAt = new Date();
    await this.priseMedicamentRepo.save(prise);

    if (prise.medicament.planningActif && prise.medicament.intervalleMinutes) {
      const prochaineHeure = new Date(prise.heurePrevue);
      prochaineHeure.setMinutes(
        prochaineHeure.getMinutes() + prise.medicament.intervalleMinutes,
      );

      if (prise.medicament.dureeJours) {
        const dateDebut = prise.medicament.dateDebutEffective || new Date();
        const dateFin = new Date(dateDebut);
        dateFin.setDate(dateFin.getDate() + prise.medicament.dureeJours);

        if (prochaineHeure < dateFin) {
          await this.creerPrise(prise.medicament, prochaineHeure);
        }
      } else {
        await this.creerPrise(prise.medicament, prochaineHeure);
      }
    }

    return prise;
  }

  /**
   * Refuse une prise avec motif et génère la suivante
   */
  async refuserPrise(priseId: string, motif: string) {
    const prise = await this.priseMedicamentRepo.findOne({
      where: { id: priseId },
      relations: ['medicament'],
    });

    if (!prise) {
      throw new Error('Prise introuvable');
    }

    prise.statut = 'REFUSE';
    prise.motifRefus = motif;
    prise.confirmeAt = new Date();
    await this.priseMedicamentRepo.save(prise);

    if (prise.medicament.planningActif && prise.medicament.intervalleMinutes) {
      const prochaineHeure = new Date(prise.heurePrevue);
      prochaineHeure.setMinutes(
        prochaineHeure.getMinutes() + prise.medicament.intervalleMinutes,
      );

      if (prise.medicament.dureeJours) {
        const dateDebut = prise.medicament.dateDebutEffective || new Date();
        const dateFin = new Date(dateDebut);
        dateFin.setDate(dateFin.getDate() + prise.medicament.dureeJours);

        if (prochaineHeure < dateFin) {
          await this.creerPrise(prise.medicament, prochaineHeure);
        }
      } else {
        await this.creerPrise(prise.medicament, prochaineHeure);
      }
    }

    return prise;
  }

  /**
   * Arrête le planning d'un médicament
   */
  async arreterPlanning(medicamentId: string) {
    const medicament = await this.medicamentRepo.findOne({ where: { id: medicamentId } });
    if (!medicament) {
      throw new Error('Médicament introuvable');
    }
    medicament.planningActif = false;
    return this.medicamentRepo.save(medicament);
  }

  /**
   * Récupère les prises actives pour un patient
   */
  async getPrisesActives(patientId: string) {
    return this.priseMedicamentRepo.find({
      where: {
        patientId,
        statut: 'EN_ATTENTE',
      },
      relations: ['medicament'],
      order: { heurePrevue: 'ASC' },
    });
  }
}
