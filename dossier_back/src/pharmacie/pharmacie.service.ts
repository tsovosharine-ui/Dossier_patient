import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface CreateOrdonnanceDto {
  patientId: string;
  prescriptionId: string;
  medicaments: any[];
  dateOrdonnance: Date;
  prescripteur: string;
}

export interface NotificationDto {
  type: string;
  motif: string;
  destinataireId: string;
  scope: string;
  data?: any;
}

@Injectable()
export class PharmacieService {
  private readonly logger = new Logger(PharmacieService.name);
  private readonly apiUrl: string;
  private readonly category: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('PHARMACIE_API_URL') || 'https://chupharmacie.onrender.com/api';
    this.category = this.configService.get<string>('PHARMACIE_CATEGORY') || 'chu-fianarantsoa';
  }

  // Créer une ordonnance externe via les dispensations
  async createOrdonnance(prescriptionId: string, ordonnanceData: CreateOrdonnanceDto): Promise<any> {
    try {
      this.logger.log(`Création d'une ordonnance externe pour la prescription ${prescriptionId}`);
      const dispensationData = {
        patient_name: `Patient ${ordonnanceData.patientId}`,
        patient_record: ordonnanceData.patientId,
        prescription_number: prescriptionId,
        payment_mode: 'PAYANT',
        status: 'EN_ATTENTE',
        lines: ordonnanceData.medicaments.map((med: any) => ({
          article_id: null,
          article_name: med.nom,
          dosage: med.dose,
          quantity: med.quantite || 1,
        })),
      };
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/dispensations`, dispensationData),
      );
      this.logger.log(`Ordonnance créée avec succès via dispensations`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la création de l'ordonnance: ${error.message}`);
      throw error;
    }
  }

  // Mettre à jour le statut d'une dispensation externe
  async updatePrescriptionStatus(prescriptionId: string, statut: string): Promise<any> {
    try {
      this.logger.log(`Mise à jour du statut de la dispensation ${prescriptionId} à ${statut}`);
      const response = await firstValueFrom(
        this.httpService.patch(`${this.apiUrl}/dispensations/${prescriptionId}/status`, { status: statut }),
      );
      this.logger.log(`Statut mis à jour avec succès`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du statut: ${error.message}`);
      throw error;
    }
  }

  // Envoyer une notification à l'API pharmacie
  async sendNotification(notificationData: NotificationDto): Promise<any> {
    try {
      this.logger.log(`Envoi d'une notification: ${notificationData.type}`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/notifications`, notificationData),
      );
      this.logger.log(`Notification envoyée avec succès`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de la notification: ${error.message}`);
      throw error;
    }
  }

  // Recevoir une notification de l'API pharmacie
  async receiveNotification(notificationData: any): Promise<any> {
    try {
      this.logger.log(`Réception d'une notification`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/notifications/receive`, notificationData),
      );
      this.logger.log(`Notification reçue avec succès`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la réception de la notification: ${error.message}`);
      throw error;
    }
  }

  // Rechercher des médicaments via l'API pharmacie
  async searchMedicaments(query: string): Promise<any[]> {
    try {
      this.logger.log(`Recherche de médicaments: ${query}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/articles`, { params: { q: query } }),
      );
      this.logger.log(`${response.data.length} médicaments trouvés`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche de médicaments: ${error.message}`);
      throw error;
    }
  }

  // Obtenir les détails d'un médicament
  async getMedicament(articleId: string): Promise<any> {
    try {
      this.logger.log(`Récupération du médicament ${articleId}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/articles/${articleId}`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du médicament: ${error.message}`);
      throw error;
    }
  }

  // Vérifier le stock global
  async getStock(): Promise<any[]> {
    try {
      this.logger.log(`Récupération du stock global`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/stock`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération du stock: ${error.message}`);
      throw error;
    }
  }

  // Vérifier le stock d'un médicament spécifique (lots)
  async getStockLots(articleId: string): Promise<any[]> {
    try {
      this.logger.log(`Récupération des lots du médicament ${articleId}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/stock/lots`, { params: { articleId } }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des lots: ${error.message}`);
      throw error;
    }
  }

  // Obtenir les catégories d'articles
  async getCategories(): Promise<any[]> {
    try {
      this.logger.log(`Récupération des catégories`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/categories`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des catégories: ${error.message}`);
      throw error;
    }
  }

  // Lister les prescriptions externes
  async listExternalPrescriptions(): Promise<any[]> {
    try {
      this.logger.log(`Récupération des prescriptions externes`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/prescriptions/${this.category}`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des prescriptions externes: ${error.message}`);
      throw error;
    }
  }

  // Lister les prescriptions externes d'un patient
  async listExternalPrescriptionsByPatient(patientId: string): Promise<any[]> {
    try {
      this.logger.log(`Récupération des prescriptions externes du patient ${patientId}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/prescriptions/${this.category}/patient/${patientId}`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des prescriptions du patient: ${error.message}`);
      throw error;
    }
  }

  // Obtenir une prescription externe spécifique
  async getExternalPrescription(prescriptionId: string): Promise<any> {
    try {
      this.logger.log(`Récupération de la prescription externe ${prescriptionId}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/prescriptions/${this.category}/${prescriptionId}`),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de la prescription: ${error.message}`);
      throw error;
    }
  }
}
