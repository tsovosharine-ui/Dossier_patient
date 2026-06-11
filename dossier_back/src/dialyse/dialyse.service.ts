import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DialyseService {
  private readonly logger = new Logger(DialyseService.name);
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('DIALYSE_API_URL') || 'https://chu-dialyse.onrender.com/api';
  }

  // Créer un patient dans le système dialyse
  async createPatient(patientData: any): Promise<any> {
    try {
      this.logger.log(`Création d'un patient dans le système dialyse: ${patientData.nom} ${patientData.prenom}`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/patients`, {
          nom: patientData.nom,
          prenom: patientData.prenom,
          dateNaissance: patientData.dateNaissance,
          telephone: patientData.telephone,
          notes: patientData.notes,
          external_patient_id: patientData.external_patient_id,
        }),
      );
      this.logger.log(`Patient créé avec succès dans le système dialyse`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la création du patient dans le système dialyse: ${error.message}`);
      throw error;
    }
  }

  // Créer une prescription dans le système dialyse
  async createPrescription(prescriptionData: any): Promise<any> {
    try {
      this.logger.log(`Création d'une prescription dans le système dialyse pour le patient ${prescriptionData.patientId}`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/prescriptions`, {
          patient: { id: prescriptionData.patientId },
          medicament: prescriptionData.medicament,
          dosage: prescriptionData.dosage,
          frequence: prescriptionData.frequence,
          date_prescription: prescriptionData.date_prescription || new Date().toISOString().split('T')[0],
          workflow_statut: prescriptionData.workflow_statut || 'actif',
        }),
      );
      this.logger.log(`Prescription créée avec succès dans le système dialyse`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la création de la prescription dans le système dialyse: ${error.message}`);
      throw error;
    }
  }

  // Créer une demande d'avis dans le système dialyse
  async createDemandeAvis(demandeAvisData: any): Promise<any> {
    try {
      this.logger.log(`Création d'une demande d'avis dans le système dialyse pour le patient ${demandeAvisData.patientId}`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/demandes-avis`, {
          patient: { id: demandeAvisData.patientId },
          description_cas: demandeAvisData.description_cas,
          priorite: demandeAvisData.priorite || 'moyenne',
          date_envoi: demandeAvisData.date_envoi || new Date().toISOString(),
        }),
      );
      this.logger.log(`Demande d'avis créée avec succès dans le système dialyse`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la création de la demande d'avis dans le système dialyse: ${error.message}`);
      throw error;
    }
  }

  // Récupérer un patient par external_patient_id
  async getPatientByExternalId(externalPatientId: string): Promise<any> {
    try {
      this.logger.log(`Recherche du patient avec external_patient_id: ${externalPatientId}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/patients`, {
          params: { search: externalPatientId },
        }),
      );
      const patients = Array.isArray(response.data) ? response.data : [];
      const patient = patients.find((p: any) => p.external_patient_id === externalPatientId);
      this.logger.log(`Patient trouvé: ${patient ? 'Oui' : 'Non'}`);
      return patient || null;
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche du patient: ${error.message}`);
      throw error;
    }
  }

  // Envoyer une notification au système dialyse
  async sendNotification(notificationData: any): Promise<any> {
    try {
      this.logger.log(`Envoi d'une notification au système dialyse: ${notificationData.type}`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/notifications`, notificationData),
      );
      this.logger.log(`Notification envoyée avec succès au système dialyse`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de la notification au système dialyse: ${error.message}`);
      throw error;
    }
  }

  // Récupérer tous les rendez-vous
  async getRendezVous(): Promise<any[]> {
    try {
      this.logger.log(`Récupération de tous les rendez-vous`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/rendezvous`),
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des rendez-vous: ${error.message}`);
      throw error;
    }
  }

  // Récupérer les rendez-vous par date
  async getRendezVousByDate(date: string): Promise<any[]> {
    try {
      this.logger.log(`Récupération des rendez-vous pour la date: ${date}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/rendezvous`),
      );
      const allRendezVous = Array.isArray(response.data) ? response.data : [];
      return allRendezVous.filter((rdv: any) => {
        const rdvDate = new Date(rdv.date_heure).toISOString().split('T')[0];
        return rdvDate === date;
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des rendez-vous par date: ${error.message}`);
      throw error;
    }
  }

  // Créer un rendez-vous
  async createRendezVous(rendezVousData: any): Promise<any> {
    try {
      this.logger.log(`Création d'un rendez-vous dans le système dialyse`);
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/rendezvous/creer`, rendezVousData),
      );
      this.logger.log(`Rendez-vous créé avec succès dans le système dialyse`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erreur lors de la création du rendez-vous: ${error.message}`);
      throw error;
    }
  }
}
