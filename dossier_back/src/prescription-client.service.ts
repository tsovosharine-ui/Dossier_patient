import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class PrescriptionClientService {
  private client: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.client = axios.create({
      baseURL: this.configService.get<string>('PRESCRIPTION_API_URL'),
      timeout: 5000,
    });
  }

  async createPrescription(patientId: string, data: any) {
    try {
      const response = await this.client.post('/prescriptions', {
        patientId,
        ...data,
      });
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de l'appel au service Prescription: ${error.message}`,
      );
    }
  }

  async getPrescriptionsByPatient(patientId: string) {
    try {
      const response = await this.client.get(`/prescriptions`, {
        params: { patientId },
      });
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la récupération des prescriptions: ${error.message}`,
      );
    }
  }
}
