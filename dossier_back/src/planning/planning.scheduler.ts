import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriseMedicament } from '../prescription/entities/prise-medicament.entity';
import { TacheNonMedicale } from '../prescription/entities/tache-non-medicale.entity';
import { SurveillanceParametre } from '../prescription/entities/surveillance-parametre.entity';
import { Medicament } from '../prescription/entities/medicament.entity';
import { ItemNonMedical } from '../prescription/entities/item-non-medical.entity';
import { ParametreSurveillance } from '../prescription/entities/parametre-surveillance.entity';

@Injectable()
export class PlanningScheduler {
  constructor(
    @InjectRepository(PriseMedicament)
    private priseMedicamentRepo: Repository<PriseMedicament>,
    @InjectRepository(TacheNonMedicale)
    private tacheNonMedicaleRepo: Repository<TacheNonMedicale>,
    @InjectRepository(SurveillanceParametre)
    private surveillanceParametreRepo: Repository<SurveillanceParametre>,
    @InjectRepository(Medicament)
    private medicamentRepo: Repository<Medicament>,
    @InjectRepository(ItemNonMedical)
    private itemNonMedicalRepo: Repository<ItemNonMedical>,
    @InjectRepository(ParametreSurveillance)
    private parametreSurveillanceRepo: Repository<ParametreSurveillance>,
  ) {}

  // Exécuter toutes les minutes
  @Cron(CronExpression.EVERY_MINUTE)
  async handleNotifications() {
    const maintenant = new Date();

    // Traiter les prises de médicaments
    await this.handlePrisesMedicaments(maintenant);

    // Traiter les tâches non médicales
    await this.handleTachesNonMedicales(maintenant);

    // Traiter les surveillances de paramètres
    await this.handleSurveillancesParametres(maintenant);
  }

  private async handlePrisesMedicaments(maintenant: Date) {
    // Chercher les prises EN_ATTENTE dont l'heure est arrivée
    const prisesEnAttente = await this.priseMedicamentRepo.find({
      where: {
        statut: 'EN_ATTENTE',
      },
      relations: ['medicament'],
    });

    for (const prise of prisesEnAttente) {
      if (prise.heurePrevue <= maintenant && prise.medicament?.planningActif) {
        // Envoyer notification
        await this.envoyerNotificationPrise(prise);
        
        // Mettre à jour le statut
        prise.statut = 'NOTIFIE';
        prise.notifEnvoyeeAt = maintenant;
        prise.tentatives = 1;
        await this.priseMedicamentRepo.save(prise);
      }
    }

    // Chercher les prises NOTIFIE depuis plus de 5 minutes pour relance
    const cinqMinutesAgo = new Date(maintenant.getTime() - 5 * 60 * 1000);
    const prisesNotifiees = await this.priseMedicamentRepo.find({
      where: {
        statut: 'NOTIFIE',
        notifEnvoyeeAt: cinqMinutesAgo,
      },
      relations: ['medicament'],
    });

    for (const prise of prisesNotifiees) {
      if (prise.medicament?.planningActif) {
        // Renvoyer notification (relance)
        await this.envoyerNotificationPrise(prise);
        
        // Incrémenter les tentatives
        prise.tentatives++;
        prise.notifEnvoyeeAt = maintenant;
        await this.priseMedicamentRepo.save(prise);
      }
    }
  }

  private async handleTachesNonMedicales(maintenant: Date) {
    // Chercher les tâches EN_ATTENTE dont l'heure est arrivée
    const tachesEnAttente = await this.tacheNonMedicaleRepo.find({
      where: {
        statut: 'EN_ATTENTE',
      },
      relations: ['item'],
    });

    for (const tache of tachesEnAttente) {
      if (tache.heurePrevue <= maintenant && tache.item?.planningActif) {
        // Envoyer notification
        await this.envoyerNotificationTache(tache);
        
        // Mettre à jour le statut
        tache.statut = 'NOTIFIE';
        tache.notifEnvoyeeAt = maintenant;
        tache.tentatives = 1;
        await this.tacheNonMedicaleRepo.save(tache);
      }
    }

    // Chercher les tâches NOTIFIE depuis plus de 5 minutes pour relance
    const cinqMinutesAgo = new Date(maintenant.getTime() - 5 * 60 * 1000);
    const tachesNotifiees = await this.tacheNonMedicaleRepo.find({
      where: {
        statut: 'NOTIFIE',
        notifEnvoyeeAt: cinqMinutesAgo,
      },
      relations: ['item'],
    });

    for (const tache of tachesNotifiees) {
      if (tache.item?.planningActif) {
        // Renvoyer notification (relance)
        await this.envoyerNotificationTache(tache);
        
        // Incrémenter les tentatives
        tache.tentatives++;
        tache.notifEnvoyeeAt = maintenant;
        await this.tacheNonMedicaleRepo.save(tache);
      }
    }
  }

  private async handleSurveillancesParametres(maintenant: Date) {
    // Chercher les surveillances EN_ATTENTE dont l'heure est arrivée
    const surveillancesEnAttente = await this.surveillanceParametreRepo.find({
      where: {
        statut: 'EN_ATTENTE',
      },
      relations: ['parametre'],
    });

    for (const surveillance of surveillancesEnAttente) {
      if (surveillance.heurePrevue <= maintenant && surveillance.parametre?.planningActif) {
        // Envoyer notification
        await this.envoyerNotificationSurveillance(surveillance);
        
        // Mettre à jour le statut
        surveillance.statut = 'NOTIFIE';
        surveillance.notifEnvoyeeAt = maintenant;
        surveillance.tentatives = 1;
        await this.surveillanceParametreRepo.save(surveillance);
      }
    }

    // Chercher les surveillances NOTIFIE depuis plus de 5 minutes pour relance
    const cinqMinutesAgo = new Date(maintenant.getTime() - 5 * 60 * 1000);
    const surveillancesNotifiees = await this.surveillanceParametreRepo.find({
      where: {
        statut: 'NOTIFIE',
        notifEnvoyeeAt: cinqMinutesAgo,
      },
      relations: ['parametre'],
    });

    for (const surveillance of surveillancesNotifiees) {
      if (surveillance.parametre?.planningActif) {
        // Renvoyer notification (relance)
        await this.envoyerNotificationSurveillance(surveillance);
        
        // Incrémenter les tentatives
        surveillance.tentatives++;
        surveillance.notifEnvoyeeAt = maintenant;
        await this.surveillanceParametreRepo.save(surveillance);
      }
    }
  }

  private async envoyerNotificationPrise(prise: PriseMedicament) {
    // TODO: Implémenter l'envoi de notification WebSocket
    // Pour l'instant, on log la notification
    console.log(`🔔 Notification prise médicament: Patient ${prise.patientId}, Médicament ${prise.medicament?.nom}, Heure ${prise.heurePrevue}`);
    
    // Format de la notification à envoyer via WebSocket:
    const notification = {
      type: 'prise_medicament',
      titre: `🔔 Donner médicament — Patient ${prise.patientId}`,
      contenu: {
        medicament: prise.medicament?.nom,
        dose: prise.medicament?.dose,
        voie: prise.medicament?.voie,
        patientId: prise.patientId,
        priseMedicamentId: prise.id,
        heurePrevue: prise.heurePrevue,
        tentative: prise.tentatives,
      },
    };
    
    // TODO: Envoyer via WebSocket Gateway
    // this.webSocketGateway.broadcastToService('infirmier', notification);
  }

  private async envoyerNotificationTache(tache: TacheNonMedicale) {
    // TODO: Implémenter l'envoi de notification WebSocket
    console.log(`🔔 Notification tâche non médicale: Patient ${tache.patientId}, Tâche ${tache.item?.description}, Heure ${tache.heurePrevue}`);
    
    const notification = {
      type: 'tache_non_medicale',
      titre: `🔔 Effectuer soin — Patient ${tache.patientId}`,
      contenu: {
        type: tache.item?.type,
        typeLabel: tache.item?.typeLabel,
        description: tache.item?.description,
        instructions: tache.item?.instructions,
        patientId: tache.patientId,
        tacheId: tache.id,
        heurePrevue: tache.heurePrevue,
        tentative: tache.tentatives,
      },
    };
    
    // TODO: Envoyer via WebSocket Gateway
  }

  private async envoyerNotificationSurveillance(surveillance: SurveillanceParametre) {
    // TODO: Implémenter l'envoi de notification WebSocket
    console.log(`🔔 Notification surveillance: Patient ${surveillance.patientId}, Paramètre ${surveillance.parametre?.parametre}, Heure ${surveillance.heurePrevue}`);
    
    const notification = {
      type: 'surveillance_parametre',
      titre: `🔔 Surveiller paramètre — Patient ${surveillance.patientId}`,
      contenu: {
        parametre: surveillance.parametre?.parametre,
        seuil: surveillance.parametre?.seuil,
        details: surveillance.parametre?.details,
        patientId: surveillance.patientId,
        surveillanceId: surveillance.id,
        heurePrevue: surveillance.heurePrevue,
        tentative: surveillance.tentatives,
      },
    };
    
    // TODO: Envoyer via WebSocket Gateway
  }
}
