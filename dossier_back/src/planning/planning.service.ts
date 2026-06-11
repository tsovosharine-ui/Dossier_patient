import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicament } from '../prescription/entities/medicament.entity';
import { PriseMedicament } from '../prescription/entities/prise-medicament.entity';
import { ItemNonMedical } from '../prescription/entities/item-non-medical.entity';
import { TacheNonMedicale } from '../prescription/entities/tache-non-medicale.entity';
import { ParametreSurveillance } from '../prescription/entities/parametre-surveillance.entity';
import { SurveillanceParametre } from '../prescription/entities/surveillance-parametre.entity';

@Injectable()
export class PlanningService {
  constructor(
    @InjectRepository(Medicament)
    private medicamentRepo: Repository<Medicament>,
    @InjectRepository(PriseMedicament)
    private priseMedicamentRepo: Repository<PriseMedicament>,
    @InjectRepository(ItemNonMedical)
    private itemNonMedicalRepo: Repository<ItemNonMedical>,
    @InjectRepository(TacheNonMedicale)
    private tacheNonMedicaleRepo: Repository<TacheNonMedicale>,
    @InjectRepository(ParametreSurveillance)
    private parametreSurveillanceRepo: Repository<ParametreSurveillance>,
    @InjectRepository(SurveillanceParametre)
    private surveillanceParametreRepo: Repository<SurveillanceParametre>,
  ) {}

  // Parser la fréquence texte en intervalle en minutes
  parseFrequence(frequence: string): number | null {
    if (!frequence) return null;

    const lower = frequence.toLowerCase();

    // Patterns pour différentes fréquences
    if (lower.includes('1× par jour') || lower.includes('1 fois par jour')) return 1440;
    if (lower.includes('2× par jour') || lower.includes('2 fois par jour') || lower.includes('toutes les 12h')) return 720;
    if (lower.includes('3× par jour') || lower.includes('3 fois par jour') || lower.includes('toutes les 8h')) return 480;
    if (lower.includes('4× par jour') || lower.includes('4 fois par jour') || lower.includes('toutes les 6h')) return 360;
    if (lower.includes('toutes les 4h')) return 240;
    if (lower.includes('toutes les 3h')) return 180;
    if (lower.includes('toutes les 2h')) return 120;
    if (lower.includes('toutes les heures') || lower.includes('toutes les 1h')) return 60;
    if (lower.includes('toutes les 30 min') || lower.includes('toutes les 30 minutes')) return 30;
    if (lower.includes('en continu') || lower.includes('perfusion') || lower.includes('sos') || lower.includes('si besoin')) return null;
    if (lower.includes('dose unique') || lower.includes('unique')) return null;

    // Essayer d'extraire un nombre de minutes
    const match = frequence.match(/toutes les (\d+)\s*(h|heure|heures|min|minute|minutes)/i);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      if (unit.startsWith('h') || unit.startsWith('heure')) {
        return value * 60;
      }
      return value;
    }

    return null;
  }

  // Parser la durée texte en jours
  parseDuree(duree: string): number | null {
    if (!duree) return null;

    const lower = duree.toLowerCase();

    // Patterns pour différentes durées
    if (lower.includes('jour')) {
      const match = duree.match(/(\d+)\s*jour/i);
      if (match) return parseInt(match[1], 10);
    }
    if (lower.includes('semaine')) {
      const match = duree.match(/(\d+)\s*semaine/i);
      if (match) return parseInt(match[1], 10) * 7;
    }
    if (lower.includes('mois')) {
      const match = duree.match(/(\d+)\s*mois/i);
      if (match) return parseInt(match[1], 10) * 30;
    }

    return null;
  }

  // Générer le planning pour un médicament
  async generatePlanningMedicament(medicamentId: string) {
    const medicament = await this.medicamentRepo.findOne({ where: { id: medicamentId } });
    if (!medicament) return;

    // Parser la fréquence et la durée si non déjà définis
    if (!medicament.intervalleMinutes && medicament.frequence) {
      medicament.intervalleMinutes = this.parseFrequence(medicament.frequence);
    }
    if (!medicament.dureeJours && medicament.duree) {
      medicament.dureeJours = this.parseDuree(medicament.duree);
    }

    // Si pas d'intervalle ou de durée, pas de planning
    if (!medicament.intervalleMinutes || !medicament.dureeJours) {
      await this.medicamentRepo.save(medicament);
      return;
    }

    // Définir la date de début effective
    if (!medicament.dateDebutEffective) {
      medicament.dateDebutEffective = new Date();
    }

    await this.medicamentRepo.save(medicament);

    // Générer les prises
    const dateDebut = new Date(medicament.dateDebutEffective);
    const dateFin = new Date(dateDebut.getTime() + medicament.dureeJours * 24 * 60 * 60 * 1000);
    const intervalle = medicament.intervalleMinutes * 60 * 1000; // en ms

    let heurePrevue = dateDebut;
    while (heurePrevue < dateFin) {
      const prise = this.priseMedicamentRepo.create({
        medicamentId: medicament.id,
        prescriptionId: medicament.prescriptionId,
        patientId: medicament.prescription?.patientId || '',
        heurePrevue,
        statut: 'EN_ATTENTE',
      });
      await this.priseMedicamentRepo.save(prise);

      heurePrevue = new Date(heurePrevue.getTime() + intervalle);
    }
  }

  // Générer le planning pour un item non médical
  async generatePlanningNonMedical(itemId: string) {
    const item = await this.itemNonMedicalRepo.findOne({ where: { id: itemId } });
    if (!item) return;

    // Parser la fréquence et la durée si non déjà définis
    if (!item.intervalleMinutes && item.frequence) {
      item.intervalleMinutes = this.parseFrequence(item.frequence);
    }
    if (!item.dureeJours && item.duree) {
      item.dureeJours = this.parseDuree(item.duree);
    }

    // Si pas d'intervalle ou de durée, pas de planning
    if (!item.intervalleMinutes || !item.dureeJours) {
      await this.itemNonMedicalRepo.save(item);
      return;
    }

    // Définir la date de début effective
    if (!item.dateDebutEffective) {
      item.dateDebutEffective = item.dateDebut || new Date();
    }

    await this.itemNonMedicalRepo.save(item);

    // Générer les tâches
    const dateDebut = new Date(item.dateDebutEffective);
    const dateFin = new Date(dateDebut.getTime() + item.dureeJours * 24 * 60 * 60 * 1000);
    const intervalle = item.intervalleMinutes * 60 * 1000; // en ms

    let heurePrevue = dateDebut;
    while (heurePrevue < dateFin) {
      const tache = this.tacheNonMedicaleRepo.create({
        itemId: item.id,
        prescriptionId: item.prescriptionId,
        patientId: item.prescription?.patientId || '',
        heurePrevue,
        statut: 'EN_ATTENTE',
      });
      await this.tacheNonMedicaleRepo.save(tache);

      heurePrevue = new Date(heurePrevue.getTime() + intervalle);
    }
  }

  // Générer le planning pour un paramètre de surveillance
  async generatePlanningSurveillance(parametreId: string) {
    const parametre = await this.parametreSurveillanceRepo.findOne({ where: { id: parametreId } });
    if (!parametre) return;

    // Parser la fréquence et la durée si non déjà définis
    if (!parametre.intervalleMinutes && parametre.frequence) {
      parametre.intervalleMinutes = this.parseFrequence(parametre.frequence);
    }
    if (!parametre.dureeJours && parametre.duree) {
      parametre.dureeJours = this.parseDuree(parametre.duree);
    }

    // Si pas d'intervalle ou de durée, pas de planning
    if (!parametre.intervalleMinutes || !parametre.dureeJours) {
      await this.parametreSurveillanceRepo.save(parametre);
      return;
    }

    // Définir la date de début effective
    if (!parametre.dateDebutEffective) {
      parametre.dateDebutEffective = parametre.dateDebut || new Date();
    }

    await this.parametreSurveillanceRepo.save(parametre);

    // Générer les surveillances
    const dateDebut = new Date(parametre.dateDebutEffective);
    const dateFin = new Date(dateDebut.getTime() + parametre.dureeJours * 24 * 60 * 60 * 1000);
    const intervalle = parametre.intervalleMinutes * 60 * 1000; // en ms

    let heurePrevue = dateDebut;
    while (heurePrevue < dateFin) {
      const surveillance = this.surveillanceParametreRepo.create({
        parametreId: parametre.id,
        prescriptionId: parametre.prescriptionId,
        patientId: parametre.prescription?.patientId || '',
        heurePrevue,
        statut: 'EN_ATTENTE',
      });
      await this.surveillanceParametreRepo.save(surveillance);

      heurePrevue = new Date(heurePrevue.getTime() + intervalle);
    }
  }

  // Confirmer une prise de médicament et créer la suivante
  async confirmerPriseMedicament(priseId: string) {
    const prise = await this.priseMedicamentRepo.findOne({ where: { id: priseId } });
    if (!prise) return;

    prise.statut = 'CONFIRME';
    prise.confirmeAt = new Date();
    await this.priseMedicamentRepo.save(prise);

    // Créer la prise suivante si le planning est actif
    const medicament = await this.medicamentRepo.findOne({ where: { id: prise.medicamentId } });
    if (medicament && medicament.planningActif && medicament.intervalleMinutes) {
      const nouvelleHeure = new Date(prise.heurePrevue.getTime() + medicament.intervalleMinutes * 60 * 1000);
      const dateFin = medicament.dateDebutEffective 
        ? new Date(medicament.dateDebutEffective.getTime() + (medicament.dureeJours || 0) * 24 * 60 * 60 * 1000)
        : new Date(nouvelleHeure.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 jours par défaut

      if (nouvelleHeure < dateFin) {
        const nouvellePrise = this.priseMedicamentRepo.create({
          medicamentId: medicament.id,
          prescriptionId: prise.prescriptionId,
          patientId: prise.patientId,
          heurePrevue: nouvelleHeure,
          statut: 'EN_ATTENTE',
        });
        await this.priseMedicamentRepo.save(nouvellePrise);
      }
    }
  }

  // Refuser une prise de médicament et créer la suivante
  async refuserPriseMedicament(priseId: string, motif: string) {
    const prise = await this.priseMedicamentRepo.findOne({ where: { id: priseId } });
    if (!prise) return;

    prise.statut = 'REFUSE';
    prise.motifRefus = motif;
    prise.confirmeAt = new Date();
    await this.priseMedicamentRepo.save(prise);

    // Créer la prise suivante même en cas de refus
    const medicament = await this.medicamentRepo.findOne({ where: { id: prise.medicamentId } });
    if (medicament && medicament.planningActif && medicament.intervalleMinutes) {
      const nouvelleHeure = new Date(prise.heurePrevue.getTime() + medicament.intervalleMinutes * 60 * 1000);
      const dateFin = medicament.dateDebutEffective 
        ? new Date(medicament.dateDebutEffective.getTime() + (medicament.dureeJours || 0) * 24 * 60 * 60 * 1000)
        : new Date(nouvelleHeure.getTime() + 30 * 24 * 60 * 60 * 1000);

      if (nouvelleHeure < dateFin) {
        const nouvellePrise = this.priseMedicamentRepo.create({
          medicamentId: medicament.id,
          prescriptionId: prise.prescriptionId,
          patientId: prise.patientId,
          heurePrevue: nouvelleHeure,
          statut: 'EN_ATTENTE',
        });
        await this.priseMedicamentRepo.save(nouvellePrise);
      }
    }
  }

  // Arrêter le planning d'un médicament
  async arreterPlanningMedicament(medicamentId: string) {
    const medicament = await this.medicamentRepo.findOne({ where: { id: medicamentId } });
    if (!medicament) return;

    medicament.planningActif = false;
    await this.medicamentRepo.save(medicament);
  }

  // Méthodes similaires pour les tâches non médicales et surveillances
  async confirmerTacheNonMedicale(tacheId: string) {
    const tache = await this.tacheNonMedicaleRepo.findOne({ where: { id: tacheId } });
    if (!tache) return;

    tache.statut = 'CONFIRME';
    tache.confirmeAt = new Date();
    await this.tacheNonMedicaleRepo.save(tache);

    const item = await this.itemNonMedicalRepo.findOne({ where: { id: tache.itemId } });
    if (item && item.planningActif && item.intervalleMinutes) {
      const nouvelleHeure = new Date(tache.heurePrevue.getTime() + item.intervalleMinutes * 60 * 1000);
      const dateFin = item.dateDebutEffective 
        ? new Date(item.dateDebutEffective.getTime() + (item.dureeJours || 0) * 24 * 60 * 60 * 1000)
        : new Date(nouvelleHeure.getTime() + 30 * 24 * 60 * 60 * 1000);

      if (nouvelleHeure < dateFin) {
        const nouvelleTache = this.tacheNonMedicaleRepo.create({
          itemId: item.id,
          prescriptionId: tache.prescriptionId,
          patientId: tache.patientId,
          heurePrevue: nouvelleHeure,
          statut: 'EN_ATTENTE',
        });
        await this.tacheNonMedicaleRepo.save(nouvelleTache);
      }
    }
  }

  async refuserTacheNonMedicale(tacheId: string, motif: string) {
    const tache = await this.tacheNonMedicaleRepo.findOne({ where: { id: tacheId } });
    if (!tache) return;

    tache.statut = 'REFUSE';
    tache.motifRefus = motif;
    tache.confirmeAt = new Date();
    await this.tacheNonMedicaleRepo.save(tache);

    const item = await this.itemNonMedicalRepo.findOne({ where: { id: tache.itemId } });
    if (item && item.planningActif && item.intervalleMinutes) {
      const nouvelleHeure = new Date(tache.heurePrevue.getTime() + item.intervalleMinutes * 60 * 1000);
      const dateFin = item.dateDebutEffective 
        ? new Date(item.dateDebutEffective.getTime() + (item.dureeJours || 0) * 24 * 60 * 60 * 1000)
        : new Date(nouvelleHeure.getTime() + 30 * 24 * 60 * 60 * 1000);

      if (nouvelleHeure < dateFin) {
        const nouvelleTache = this.tacheNonMedicaleRepo.create({
          itemId: item.id,
          prescriptionId: tache.prescriptionId,
          patientId: tache.patientId,
          heurePrevue: nouvelleHeure,
          statut: 'EN_ATTENTE',
        });
        await this.tacheNonMedicaleRepo.save(nouvelleTache);
      }
    }
  }

  async arreterPlanningNonMedical(itemId: string) {
    const item = await this.itemNonMedicalRepo.findOne({ where: { id: itemId } });
    if (!item) return;

    item.planningActif = false;
    await this.itemNonMedicalRepo.save(item);
  }

  async confirmerSurveillanceParametre(surveillanceId: string) {
    const surveillance = await this.surveillanceParametreRepo.findOne({ where: { id: surveillanceId } });
    if (!surveillance) return;

    surveillance.statut = 'CONFIRME';
    surveillance.confirmeAt = new Date();
    await this.surveillanceParametreRepo.save(surveillance);

    const parametre = await this.parametreSurveillanceRepo.findOne({ where: { id: surveillance.parametreId } });
    if (parametre && parametre.planningActif && parametre.intervalleMinutes) {
      const nouvelleHeure = new Date(surveillance.heurePrevue.getTime() + parametre.intervalleMinutes * 60 * 1000);
      const dateFin = parametre.dateDebutEffective 
        ? new Date(parametre.dateDebutEffective.getTime() + (parametre.dureeJours || 0) * 24 * 60 * 60 * 1000)
        : new Date(nouvelleHeure.getTime() + 30 * 24 * 60 * 60 * 1000);

      if (nouvelleHeure < dateFin) {
        const nouvelleSurveillance = this.surveillanceParametreRepo.create({
          parametreId: parametre.id,
          prescriptionId: surveillance.prescriptionId,
          patientId: surveillance.patientId,
          heurePrevue: nouvelleHeure,
          statut: 'EN_ATTENTE',
        });
        await this.surveillanceParametreRepo.save(nouvelleSurveillance);
      }
    }
  }

  async refuserSurveillanceParametre(surveillanceId: string, motif: string) {
    const surveillance = await this.surveillanceParametreRepo.findOne({ where: { id: surveillanceId } });
    if (!surveillance) return;

    surveillance.statut = 'REFUSE';
    surveillance.motifRefus = motif;
    surveillance.confirmeAt = new Date();
    await this.surveillanceParametreRepo.save(surveillance);

    const parametre = await this.parametreSurveillanceRepo.findOne({ where: { id: surveillance.parametreId } });
    if (parametre && parametre.planningActif && parametre.intervalleMinutes) {
      const nouvelleHeure = new Date(surveillance.heurePrevue.getTime() + parametre.intervalleMinutes * 60 * 1000);
      const dateFin = parametre.dateDebutEffective 
        ? new Date(parametre.dateDebutEffective.getTime() + (parametre.dureeJours || 0) * 24 * 60 * 60 * 1000)
        : new Date(nouvelleHeure.getTime() + 30 * 24 * 60 * 60 * 1000);

      if (nouvelleHeure < dateFin) {
        const nouvelleSurveillance = this.surveillanceParametreRepo.create({
          parametreId: parametre.id,
          prescriptionId: surveillance.prescriptionId,
          patientId: surveillance.patientId,
          heurePrevue: nouvelleHeure,
          statut: 'EN_ATTENTE',
        });
        await this.surveillanceParametreRepo.save(nouvelleSurveillance);
      }
    }
  }

  async arreterPlanningSurveillance(parametreId: string) {
    const parametre = await this.parametreSurveillanceRepo.findOne({ where: { id: parametreId } });
    if (!parametre) return;

    parametre.planningActif = false;
    await this.parametreSurveillanceRepo.save(parametre);
  }

  // Récupérer les prises actives pour un patient
  async getPrisesActivesPatient(patientId: string) {
    return this.priseMedicamentRepo.find({
      where: {
        patientId,
        statut: 'EN_ATTENTE',
      },
      relations: ['medicament'],
      order: { heurePrevue: 'ASC' },
    });
  }

  // Récupérer les tâches actives pour un patient
  async getTachesActivesPatient(patientId: string) {
    return this.tacheNonMedicaleRepo.find({
      where: {
        patientId,
        statut: 'EN_ATTENTE',
      },
      relations: ['item'],
      order: { heurePrevue: 'ASC' },
    });
  }

  // Récupérer les surveillances actives pour un patient
  async getSurveillancesActivesPatient(patientId: string) {
    return this.surveillanceParametreRepo.find({
      where: {
        patientId,
        statut: 'EN_ATTENTE',
      },
      relations: ['parametre'],
      order: { heurePrevue: 'ASC' },
    });
  }
}
