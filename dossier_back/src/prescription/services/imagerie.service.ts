import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionImagerie } from '../entities/prescription-imagerie.entity';
import { ExternalIntegrationService, IntegrationConfig } from '../../integration/external-integration.service';
import { NotificationService } from './notification.service';

@Injectable()
export class ImagerieService {
  constructor(
    @InjectRepository(PrescriptionImagerie)
    private repo: Repository<PrescriptionImagerie>,
    private integrationService: ExternalIntegrationService,
    private notificationService: NotificationService,
  ) {}

  async create(prescripteurId: string, dto: any) {
    const prescription = this.repo.create({ ...dto, prescripteurId });
    const savedPrescription = await this.repo.save(prescription) as unknown as PrescriptionImagerie;

    // Send to external imaging API if configured
    if (process.env.IMAGERIE_API_URL) {
      const config: IntegrationConfig = {
        apiUrl: process.env.IMAGERIE_API_URL,
        endpoint: '/prescriptions',
      };
      await this.integrationService.sendToExternalApi(config, {
        prescriptionId: savedPrescription.id,
        patientId: savedPrescription.patientId,
        examens: dto.examens,
      });
    }

    // Create notification
    await this.notificationService.create({
      type: 'PRESCRIPTION_IMAGERIE',
      message: `Nouvelle prescription imagerie pour le patient ${savedPrescription.patientId}`,
      patientId: savedPrescription.patientId,
      prescriptionId: savedPrescription.id,
      statut: 'PENDING',
    });

    return savedPrescription;
  }

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findByPatient(patientId: string) {
    return this.repo.find({ where: { patientId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const prescription = await this.repo.findOne({ where: { id } });
    if (!prescription) throw new NotFoundException('Prescription introuvable');
    return prescription;
  }

  async updateStatut(id: string, statut: string) {
    return this.repo.update(id, { statut });
  }
}
