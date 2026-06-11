import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ChuInfo {
  chuId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  responsable?: string;
}

export interface ServiceInfo {
  serviceId: string;
  name: string;
  description?: string;
  type?: string;
  chuId: string;
}

@Injectable()
export class ChuService {
  private readonly logger = new Logger(ChuService.name);
  private readonly apiUrl: string;
  private readonly chuId: string;
  private readonly chuName: string;
  private readonly serviceId: string;
  private readonly serviceName: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('CHU_API_URL') || 'https://service-chu-back-production-77d5.up.railway.app';
    this.chuId = this.configService.get<string>('CHU_ID') || '';
    this.chuName = this.configService.get<string>('CHU_NAME') || 'CHU Fianarantsoa';
    this.serviceId = this.configService.get<string>('CHU_SERVICE_ID') || '';
    this.serviceName = this.configService.get<string>('CHU_SERVICE_NAME') || 'Chirurgie';
  }

  // Récupérer les informations du CHU
  async getChuInfo(): Promise<ChuInfo> {
    try {
      if (!this.chuId) {
        this.logger.warn('CHU_ID non configuré, utilisation des valeurs par défaut');
        return {
          chuId: 'default',
          name: this.chuName,
        };
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/chu/${this.chuId}`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des informations du CHU: ${error.message}`);
      // Retourner les valeurs par défaut en cas d'erreur
      return {
        chuId: this.chuId || 'default',
        name: this.chuName,
      };
    }
  }

  // Récupérer les informations du service
  async getServiceInfo(): Promise<ServiceInfo> {
    try {
      if (!this.serviceId) {
        this.logger.warn('CHU_SERVICE_ID non configuré, utilisation des valeurs par défaut');
        return {
          serviceId: 'default',
          name: this.serviceName,
          chuId: this.chuId || 'default',
        };
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/service/${this.serviceId}`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des informations du service: ${error.message}`);
      // Retourner les valeurs par défaut en cas d'erreur
      return {
        serviceId: this.serviceId || 'default',
        name: this.serviceName,
        chuId: this.chuId || 'default',
      };
    }
  }

  // Récupérer un service par son nom (pour adapter selon le contexte)
  async getServiceByName(serviceName: string): Promise<ServiceInfo | null> {
    try {
      if (!this.chuId) {
        this.logger.warn('CHU_ID non configuré, impossible de rechercher le service');
        return null;
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/service`, { params: { chuId: this.chuId } }),
      );
      const services = response.data;
      return services.find((s: any) => s.name === serviceName) || null;
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche du service: ${error.message}`);
      return null;
    }
  }

  // Récupérer tous les services du CHU
  async getServices(): Promise<ServiceInfo[]> {
    try {
      if (!this.chuId) {
        this.logger.warn('CHU_ID non configuré, impossible de récupérer les services');
        return [];
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/service`, { params: { chuId: this.chuId } }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des services: ${error.message}`);
      return [];
    }
  }

  // Méthode utilitaire pour obtenir les informations d'identification complètes
  async getIdentificationInfo(serviceName?: string): Promise<{
    chu: ChuInfo;
    service: ServiceInfo;
  }> {
    const chu = await this.getChuInfo();
    
    let service: ServiceInfo;
    if (serviceName) {
      const foundService = await this.getServiceByName(serviceName);
      service = foundService || await this.getServiceInfo();
    } else {
      service = await this.getServiceInfo();
    }

    return { chu, service };
  }
}
