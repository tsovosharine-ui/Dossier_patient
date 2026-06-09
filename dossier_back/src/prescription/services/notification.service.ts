import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private readonly httpService: HttpService,
  ) {}

  async create(dto: any) {
    const notification = this.notificationRepo.create(dto);
    const saved = await this.notificationRepo.save(notification);

    // Send notification via Render if configured
    if (process.env.RENDER_WEBHOOK_URL) {
      await this.sendToRender(saved);
    }

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
          message: notification.message,
          patientId: notification.patientId,
          prescriptionId: notification.prescriptionId,
          createdAt: notification.createdAt,
        }),
      );

      await this.markAsSent(notification.id);
      this.logger.log(`Notification ${notification.id} envoyée à Render`);
    } catch (error) {
      this.logger.error(`Erreur envoi notification à Render: ${error}`);
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
