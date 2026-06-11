import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionLabo } from '../entities/prescription-labo.entity';
import { ExternalIntegrationService, IntegrationConfig } from '../../integration/external-integration.service';
import { NotificationService } from './notification.service';

@Injectable()
export class LaboService {
  constructor(
    @InjectRepository(PrescriptionLabo)
    private repo: Repository<PrescriptionLabo>,
    private integrationService: ExternalIntegrationService,
    private notificationService: NotificationService,
  ) {}

  async create(prescripteurId: string, dto: any) {
    const prescription = this.repo.create({ ...dto, prescripteurId });
    const savedPrescription = await this.repo.save(prescription) as unknown as PrescriptionLabo;

    // Send to external lab API if configured
    if (process.env.LABO_API_URL) {
      const config: IntegrationConfig = {
        apiUrl: process.env.LABO_API_URL,
        endpoint: '/prescriptions',
      };
      this.integrationService.sendToExternalApi(config, {
        prescriptionId: savedPrescription.id,
        patientId: savedPrescription.patientId,
        analyses: dto.analyses,
      }).catch(e => console.error('Erreur integration externe:', e));
    }

    // Create notification
    await this.notificationService.create({
      type: 'PRESCRIPTION_LABO',
      titre: `Nouvelle prescription laboratoire`,
      destinataire: 'LABORATOIRE',
      expediteurId: prescripteurId,
      patientId: savedPrescription.patientId,
      referenceId: savedPrescription.id,
      referenceType: 'PRESCRIPTION_LABO',
      contenu: {
        analyses: dto.analyses,
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
