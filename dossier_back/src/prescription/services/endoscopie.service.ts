import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionEndoscopie } from '../entities/prescription-endoscopie.entity';
import { ExternalIntegrationService, IntegrationConfig } from '../../integration/external-integration.service';
import { NotificationService } from './notification.service';

@Injectable()
export class EndoscopieService {
  constructor(
    @InjectRepository(PrescriptionEndoscopie)
    private repo: Repository<PrescriptionEndoscopie>,
    private integrationService: ExternalIntegrationService,
    private notificationService: NotificationService,
  ) {}

  async create(prescripteurId: string, dto: any) {
    const prescription = this.repo.create({ ...dto, prescripteurId });
    const savedPrescription = await this.repo.save(prescription) as unknown as PrescriptionEndoscopie;

    // Send to external endoscopy API if configured
    if (process.env.ENDOSCOPIE_API_URL) {
      const config: IntegrationConfig = {
        apiUrl: process.env.ENDOSCOPIE_API_URL,
        endpoint: '/prescriptions',
      };
      await this.integrationService.sendToExternalApi(config, {
        prescriptionId: savedPrescription.id,
        patientId: savedPrescription.patientId,
        type: dto.type,
        priorite: dto.priorite,
        indications: dto.indications,
      });
    }

    // Create notification
    await this.notificationService.create({
      type: 'PRESCRIPTION_ENDOSCOPIE',
      titre: `Nouvelle prescription endoscopie`,
      destinataire: 'ENDOSCOPIE',
      expediteurId: prescripteurId,
      patientId: savedPrescription.patientId,
      referenceId: savedPrescription.id,
      referenceType: 'PRESCRIPTION_ENDOSCOPIE',
      contenu: {
        type: dto.type,
        priorite: dto.priorite,
        indications: dto.indications,
        urgence: dto.urgence,
      },
      statut: 'EN_ATTENTE',
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
