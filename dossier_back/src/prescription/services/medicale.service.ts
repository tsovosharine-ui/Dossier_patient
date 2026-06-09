import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionMedicale } from '../entities/prescription-medicale.entity';
import { Medicament } from '../entities/medicament.entity';
import { Ordonnance } from '../entities/ordonnance.entity';
import { ExternalIntegrationService, IntegrationConfig } from '../../integration/external-integration.service';
import { NotificationService } from './notification.service';

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
            ? this.calculerIntervalleMinutes(m.frequenceType, m.frequenceValeur)
            : undefined;

        return this.medicamentRepo.save({
          ...m,
          prescriptionId: savedPrescription.id,
          dateDebut: m.dateDebut ? new Date(m.dateDebut) : undefined,
          quantite: m.quantite || 1,
          intervalleMinutes,
          dateDebutEffective: m.dateDebut ? new Date(m.dateDebut) : new Date(),
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
      message: `Nouvelle prescription médicale pour le patient ${savedPrescription.patientId}`,
      patientId: savedPrescription.patientId,
      prescriptionId: savedPrescription.id,
      statut: 'PENDING',
    });

    return this.findOne(savedPrescription.id);
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
    return this.ordonnanceRepo.save(ordonnance);
  }

  async updateStatut(id: string, statut: string) {
    return this.prescriptionRepo.update(id, { statut });
  }

  private calculerIntervalleMinutes(frequenceType: string, frequenceValeur: number): number | undefined {
    switch (frequenceType) {
      case 'HEURES':
        return frequenceValeur * 60;
      case 'PAR_JOUR':
        return (24 * 60) / frequenceValeur;
      default:
        return undefined;
    }
  }
}
