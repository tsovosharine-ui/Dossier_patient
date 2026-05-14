import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AvisService } from './avis.service';

// Service simple de notification (log + alerte console)
// À remplacer par un vrai service d'envoi d'email / notification interne
@Injectable()
export class AvisNotificationService {
  private readonly logger = new Logger(AvisNotificationService.name);

  constructor(private readonly avisService: AvisService) {}

  @Cron('*/5 * * * *') // toutes les 5 minutes
  async envoyerNotifications() {
    const services = ['Cardiologie', 'Neurologie', 'Pneumologie', 'Gastro-entérologie', 'Imagerie', 'Laboratoire'];
    for (const service of services) {
      const demandes = await this.avisService.getDemandesNonLues(service);
      for (const demande of demandes) {
        this.logger.warn(`Notification pour le service ${service} : Demande d'avis pour patient ${demande.patientId} (motif: ${demande.motif})`);
        // Ici, vous pouvez intégrer un vrai système de notification (WebSocket, email, base de données)
      }
    }
  }
}
