import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionDialyse } from '../entities/prescription-dialyse.entity';
import { ExternalIntegrationService, IntegrationConfig } from '../../integration/external-integration.service';
import { NotificationService } from './notification.service';
import { DialyseService as DialyseApiService } from '../../dialyse/dialyse.service';

@Injectable()
export class DialyseService {
  constructor(
    @InjectRepository(PrescriptionDialyse)
    private repo: Repository<PrescriptionDialyse>,
    private integrationService: ExternalIntegrationService,
    private notificationService: NotificationService,
    private dialyseApiService: DialyseApiService,
  ) {}

  async create(prescripteurId: string, dto: any) {
    const prescription = this.repo.create({ ...dto, prescripteurId });
    const savedPrescription = await this.repo.save(prescription) as unknown as PrescriptionDialyse;

    // Send to external dialysis API if configured
    if (process.env.DIALYSE_API_URL) {
      try {
        // First, try to find or create the patient in the dialyse system
        let dialysePatient = await this.dialyseApiService.getPatientByExternalId(savedPrescription.patientId);
        
        if (!dialysePatient) {
          // Create patient if not found
          dialysePatient = await this.dialyseApiService.createPatient({
            nom: dto.patientNom || 'Patient',
            prenom: dto.patientPrenom || '',
            dateNaissance: dto.patientDateNaissance,
            telephone: dto.patientTelephone,
            notes: dto.patientNotes,
            external_patient_id: savedPrescription.patientId,
          });
        }

        // Create prescription in dialyse system
        await this.dialyseApiService.createPrescription({
          patientId: dialysePatient.id,
          medicament: dto.type || 'Dialyse',
          dosage: dto.frequence || '',
          frequence: dto.duree || '',
          date_prescription: new Date().toISOString().split('T')[0],
          workflow_statut: 'actif',
        });
      } catch (error) {
        console.error('Erreur lors de l\'envoi à l\'API dialyse:', error);
      }
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
