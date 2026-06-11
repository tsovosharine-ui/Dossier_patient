import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface CreateNotificationDto {
  type: string;
  motif: string;
  sourceServiceId: string;
  targetServiceId: string;
  sourceServiceName?: string;
  targetServiceName?: string;
  emitterId?: string;
  emitterName?: string;
  recipientName?: string;
  departmentSource?: string;
  departmentTarget?: string;
  patientId?: string;
  sentAt?: string;
  entiteRefType?: string;
  entiteRefId?: string;
  payload?: Record<string, any>;
  ringtone?: string;
  channels?: string[];
  urgence?: number;
}

@Injectable()
export class NotificationApiService {
  private readonly logger = new Logger(NotificationApiService.name);
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('NOTIFICATION_API_URL') || 'https://service-notification.onrender.com/api';
  }

  async createNotification(dto: CreateNotificationDto): Promise<any> {
    try {
      const notificationData = {
        ...dto,
        sentAt: dto.sentAt || new Date().toISOString(),
      };

      this.logger.log(`Envoi de notification au service externe: ${JSON.stringify(notificationData)}`);

      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/notifications`, notificationData),
      );

      this.logger.log(`Notification envoyée avec succès: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de la notification: ${error.message}`);
      throw error;
    }
  }

  async getNotificationTypes(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/notifications/types`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des types de notification: ${error.message}`);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/notifications/${notificationId}/read`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors du marquage comme lu: ${error.message}`);
      throw error;
    }
  }

  async acknowledge(notificationId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/notifications/${notificationId}/ack`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de l'acquittement: ${error.message}`);
      throw error;
    }
  }
}
