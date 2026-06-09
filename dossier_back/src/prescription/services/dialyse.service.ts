import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionDialyse } from '../entities/prescription-dialyse.entity';
import { ExternalIntegrationService, IntegrationConfig } from '../../integration/external-integration.service';
import { NotificationService } from './notification.service';

@Injectable()
export class DialyseService {
  constructor(
    @InjectRepository(PrescriptionDialyse)
    private repo: Repository<PrescriptionDialyse>,
    private integrationService: ExternalIntegrationService,
    private notificationService: NotificationService,
  ) {}

  async create(prescripteurId: string, dto: any) {
    const prescription = this.repo.create({ ...dto, prescripteurId });
    const savedPrescription = await this.repo.save(prescription) as unknown as PrescriptionDialyse;

    // Send to external dialysis API if configured
    if (process.env.DIALYSE_API_URL) {
      const config: IntegrationConfig = {
        apiUrl: process.env.DIALYSE_API_URL,
        endpoint: '/prescriptions',
      };
      await this.integrationService.sendToExternalApi(config, {
        prescriptionId: savedPrescription.id,
        patientId: savedPrescription.patientId,
        type: dto.type,
        frequence: dto.frequence,
        duree: dto.duree,
      });
    }

    // Create notification
    await this.notificationService.create({
      type: 'PRESCRIPTION_DIALYSE',
      titre: `Nouvelle prescription dialyse`,
      destinataire: 'DIALYSE',
      expediteurId: prescripteurId,
      patientId: savedPrescription.patientId,
      referenceId: savedPrescription.id,
      referenceType: 'PRESCRIPTION_DIALYSE',
      contenu: {
        type: dto.type,
        frequence: dto.frequence,
        duree: dto.duree,
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
