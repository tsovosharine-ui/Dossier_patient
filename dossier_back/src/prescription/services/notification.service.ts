import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Notification } from '../entities/notification.entity';
import { DossierNotifierService } from '../../notification-api/dossier-notifier.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  private readonly targetWebhooks: Record<string, string> = {
    dialyse: 'https://chu-dialyse.onrender.com/notifications/receive',
    endoscopie: 'https://endoscopie-api.onrender.com/api/notifications/receive',
  };

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private readonly httpService: HttpService,
    private dossierNotifierService: DossierNotifierService,
  ) {}

  async create(dto: any) {
    const notification = this.notificationRepo.create(dto);
    const saved = await this.notificationRepo.save(notification) as unknown as Notification;

    // Send notification via Render if configured (fire-and-forget)
    if (process.env.RENDER_WEBHOOK_URL) {
      this.sendToRender(saved).catch(e => this.logger.error(e));
    }

    // Send to direct webhooks for specific services (fire-and-forget)
    const serviceType = dto.type?.replace('PRESCRIPTION_', '').toLowerCase();
    if (this.targetWebhooks[serviceType]) {
      this.sendToDirectWebhook(saved, this.targetWebhooks[serviceType]).catch(e => this.logger.error(e));
    }

    // Send to Central Notification API via DossierNotifierService (fire-and-forget)
    this.dossierNotifierService.notifySpecificPrescription(dto);

    return saved;
  }

  async sendToRender(notification: Notification) {
    try {
      const webhookUrl = process.env.RENDER_WEBHOOK_URL;
      if (!webhookUrl) return;

      await firstValueFrom(
        this.httpService.post(webhookUrl, {
          id: notification.id,
          type: notification.type,
          titre: notification.titre,
          contenu: notification.contenu,
          patientId: notification.patientId,
          referenceId: notification.referenceId,
          referenceType: notification.referenceType,
          createdAt: notification.createdAt,
        }),
      );

      await this.markAsSent(notification.id);
      this.logger.log(`Notification ${notification.id} envoyée à Render`);
    } catch (error) {
      this.logger.error(`Erreur envoi notification à Render: ${error}`);
    }
  }

  async sendToDirectWebhook(notification: Notification, webhookUrl: string) {
    try {
      await firstValueFrom(
        this.httpService.post(webhookUrl, {
          id: notification.id,
          type: notification.type,
          titre: notification.titre,
          contenu: notification.contenu,
          patientId: notification.patientId,
          referenceId: notification.referenceId,
          referenceType: notification.referenceType,
          destinataire: notification.destinataire,
          expediteurId: notification.expediteurId,
          statut: notification.statut,
          createdAt: notification.createdAt,
        }),
      );

      this.logger.log(`Notification ${notification.id} envoyée à webhook direct ${webhookUrl}`);
    } catch (error) {
      this.logger.error(`Erreur envoi notification à webhook direct: ${error}`);
    }
  }

  async markAsSent(id: string) {
    return this.notificationRepo.update(id, { statut: 'ENVOYE' });
  }

  async findByPatient(patientId: string) {
    return this.notificationRepo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }
}
