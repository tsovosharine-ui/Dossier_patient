import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AvisService } from './avis.service';
import { DialyseService } from '../dialyse/dialyse.service';

// Service simple de notification (log + alerte console)
// À remplacer par un vrai service d'envoi d'email / notification interne
@Injectable()
export class AvisNotificationService {
  private readonly logger = new Logger(AvisNotificationService.name);

  constructor(
    private readonly avisService: AvisService,
    private readonly dialyseApiService: DialyseService,
  ) {}

  @Cron('*/5 * * * *') // toutes les 5 minutes
  async envoyerNotifications() {
    const services = ['Cardiologie', 'Neurologie', 'Pneumologie', 'Gastro-entérologie', 'Imagerie', 'Laboratoire', 'Dialyse'];
    for (const service of services) {
      const demandes = await this.avisService.getDemandesNonLues(service);
      for (const demande of demandes) {
        if (service === 'Dialyse') {
          await this.handleDialyseDemande(demande);
        } else {
          this.logger.warn(`Notification pour le service ${service} : Demande d'avis pour patient ${demande.patientId} (motif: ${demande.motif})`);
          // Ici, vous pouvez intégrer un vrai système de notification (WebSocket, email, base de données)
        }
      }
    }
  }

  private async handleDialyseDemande(demande: any): Promise<void> {
    this.logger.warn(`Relance Dialyse : Demande d'avis pour patient ${demande.patientId} (motif: ${demande.motif})`);

    try {
      let dialysePatient = await this.dialyseApiService.getPatientByExternalId(demande.patientId);
      if (!dialysePatient) {
        dialysePatient = await this.dialyseApiService.createPatient({
          nom: 'Patient',
          prenom: '',
          dateNaissance: null,
          telephone: null,
          notes: `Patient ID: ${demande.patientId}`,
          external_patient_id: demande.patientId,
        });
      }

      const existingDemandes = await this.dialyseApiService.findDemandesAvis(dialysePatient.id, demande.motif);
      const alreadySent = Array.isArray(existingDemandes) && existingDemandes.some((existing: any) => {
        const description = existing.description_cas?.trim?.().toLowerCase();
        const motif = demande.motif?.trim?.().toLowerCase();
        const patientMatch = existing.patient?.id === dialysePatient.id;
        return patientMatch && description === motif;
      });

      if (alreadySent) {
        this.logger.log(`Demande Dialyse déjà existante pour patient ${demande.patientId} et motif '${demande.motif}', pas de doublon.`);
        return;
      }

      await this.dialyseApiService.createDemandeAvis({
        patientId: dialysePatient.id,
        description_cas: demande.motif,
        priorite: 'moyenne',
        date_envoi: new Date().toISOString(),
      });
      this.logger.log(`Relance envoyée au module Dialyse pour le patient ${demande.patientId}.`);
    } catch (error) {
      this.logger.error(`Erreur lors de la relance Dialyse pour patient ${demande.patientId}: ${error.message}`);
    }
  }
}
