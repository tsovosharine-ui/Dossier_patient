import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionMedicale } from '../entities/prescription-medicale.entity';
import { Medicament } from '../entities/medicament.entity';
import { Ordonnance } from '../entities/ordonnance.entity';
import { ExternalIntegrationService, IntegrationConfig } from '../../integration/external-integration.service';
import { NotificationService } from './notification.service';
import { PlanningService } from './planning.service';

@Injectable()
export class MedicaleService {
  constructor(
    @InjectRepository(PrescriptionMedicale)
    private prescriptionRepo: Repository<PrescriptionMedicale>,
    @InjectRepository(Medicament)
    private medicamentRepo: Repository<Medicament>,
    @InjectRepository(Ordonnance)
    private ordonnanceRepo: Repository<Ordonnance>,
    private integrationService: ExternalIntegrationService,
    private notificationService: NotificationService,
    private planningService: PlanningService,
  ) {}

  async create(prescripteurId: string, dto: any) {
    const { medicaments, prescripteurId: _pid, ...rest } = dto;
    
    const prescription = this.prescriptionRepo.create({
      ...rest,
      prescripteurId,
    });

    const savedPrescription = await this.prescriptionRepo.save(prescription) as unknown as PrescriptionMedicale;

    await Promise.all(
      medicaments.map((m: any) => {
        const intervalleMinutes =
          m.frequenceType && m.frequenceValeur
            ? this.planningService.calculerIntervalleMinutes(m.frequenceType, m.frequenceValeur)
            : undefined;

        return this.medicamentRepo.save({
          ...m,
          prescriptionId: savedPrescription.id,
          dateDebut: m.dateDebut ? new Date(m.dateDebut) : undefined,
          quantite: m.quantite || 1,
          intervalleMinutes,
          dateDebutEffective: m.dateDebut ? new Date(m.dateDebut) : new Date(),
          planningActif: true,
        });
      }),
    );

    // Send to external pharmacy API if configured
    if (process.env.PHARMACY_API_URL) {
      const config: IntegrationConfig = {
        apiUrl: process.env.PHARMACY_API_URL,
        endpoint: '/prescriptions',
      };
      await this.integrationService.sendToExternalApi(config, {
        prescriptionId: savedPrescription.id,
        patientId: savedPrescription.patientId,
        medicaments,
      });
    }

    // Create notification
    await this.notificationService.create({
      type: 'PRESCRIPTION_MEDICALE',
      titre: `Nouvelle prescription médicale`,
      destinataire: 'INFIRMIER',
      expediteurId: prescripteurId,
      patientId: savedPrescription.patientId,
      referenceId: savedPrescription.id,
      referenceType: 'PRESCRIPTION_MEDICALE',
      contenu: {
        medicaments,
        remarques: savedPrescription.remarques,
      },
      statut: 'EN_ATTENTE',
    });

    // Generate planning for each medication
    const prescriptionWithMedicaments = await this.findOne(savedPrescription.id);
    for (const medicament of prescriptionWithMedicaments.medicaments) {
      if (medicament.intervalleMinutes && medicament.planningActif) {
        await this.planningService.genererPlanningMedicament(medicament.id);
      }
    }

    return prescriptionWithMedicaments;
  }

  async findAll() {
    return this.prescriptionRepo.find({
      relations: ['medicaments', 'ordonnance'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPatient(patientId: string) {
    return this.prescriptionRepo.find({
      where: { patientId },
      relations: ['medicaments', 'ordonnance'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const prescription = await this.prescriptionRepo.findOne({
      where: { id },
      relations: ['medicaments', 'ordonnance'],
    });
    if (!prescription) throw new NotFoundException('Prescription introuvable');
    return prescription;
  }

  async createOrdonnance(prescriptionId: string, medicaments: any[]) {
    const ordonnance = this.ordonnanceRepo.create({
      prescriptionId,
      medicaments,
    });
    const savedOrdonnance = await this.ordonnanceRepo.save(ordonnance);

    // Send to external pharmacy API if configured
    if (process.env.PHARMACY_API_URL) {
      const config: IntegrationConfig = {
        apiUrl: process.env.PHARMACY_API_URL,
        endpoint: '/ordonnances',
      };
      try {
        await this.integrationService.sendToExternalApi(config, {
          prescriptionId,
          ordonnanceId: savedOrdonnance.id,
          medicaments,
        });
        
        // Update sync status
        await this.prescriptionRepo.update(prescriptionId, {
          statutSync: 'SUCCES',
          syncedAt: new Date(),
        });
      } catch (error) {
        await this.prescriptionRepo.update(prescriptionId, {
          statutSync: 'ECHEC',
          syncError: String(error),
          syncedAt: new Date(),
        });
      }
    }

    return savedOrdonnance;
  }

  async updateStatut(id: string, statut: string) {
    return this.prescriptionRepo.update(id, { statut });
  }
}
