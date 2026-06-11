import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionMedicale } from '../entities/prescription-medicale.entity';
import { Medicament } from '../entities/medicament.entity';
import { Ordonnance } from '../entities/ordonnance.entity';
import { ExternalIntegrationService, IntegrationConfig } from '../../integration/external-integration.service';
import { NotificationService } from './notification.service';
import { PlanningService } from '../../planning/planning.service';
import { PharmacieService } from '../../pharmacie/pharmacie.service';

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
    private pharmacieService: PharmacieService,
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
        const intervalleMinutes = this.planningService.parseFrequence(m.frequence);
        const dureeJours = this.planningService.parseDuree(m.duree);

        return this.medicamentRepo.save({
          ...m,
          prescriptionId: savedPrescription.id,
          dateDebut: m.dateDebut ? new Date(m.dateDebut) : undefined,
          quantite: m.quantite || 1,
          intervalleMinutes,
          dureeJours,
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
        await this.planningService.generatePlanningMedicament(medicament.id);
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

    // Récupérer la prescription pour obtenir les informations nécessaires
    const prescription = await this.findOne(prescriptionId);

    // Envoyer l'ordonnance à l'API pharmacie
    try {
      await this.pharmacieService.createOrdonnance(prescriptionId, {
        patientId: prescription.patientId,
        prescriptionId: prescriptionId,
        medicaments: medicaments,
        dateOrdonnance: new Date(),
        prescripteur: prescription.prescripteurId,
      });

      // Envoyer une notification à l'API pharmacie
      await this.pharmacieService.sendNotification({
        type: 'ORDONNANCE',
        motif: `Nouvelle ordonnance pour le patient ${prescription.patientId}`,
        destinataireId: 'pharmacie',
        scope: 'pharmacie',
        data: {
          prescriptionId: prescriptionId,
          ordonnanceId: savedOrdonnance.id,
          patientId: prescription.patientId,
        },
      });

      // Update sync status
      await this.prescriptionRepo.update(prescriptionId, {
        statutSync: 'SUCCES',
        syncedAt: new Date(),
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi à l\'API pharmacie:', error);
      await this.prescriptionRepo.update(prescriptionId, {
        statutSync: 'ECHEC',
        syncError: String(error),
        syncedAt: new Date(),
      });
    }

    return savedOrdonnance;
  }

  async updateStatut(id: string, statut: string) {
    // Mettre à jour le statut localement
    await this.prescriptionRepo.update(id, { statut });

    // Synchroniser avec l'API pharmacie
    try {
      await this.pharmacieService.updatePrescriptionStatus(id, statut);
    } catch (error) {
      console.error('Erreur lors de la synchronisation du statut avec l\'API pharmacie:', error);
    }

    return this.prescriptionRepo.update(id, { statut });
  }

  // Rechercher des médicaments via l'API pharmacie
  async searchMedicaments(query: string): Promise<any[]> {
    try {
      return await this.pharmacieService.searchMedicaments(query);
    } catch (error) {
      console.error('Erreur lors de la recherche de médicaments dans l\'API pharmacie:', error);
      // En cas d'erreur, retourner un tableau vide
      return [];
    }
  }

  // Vérifier le stock d'un médicament
  async checkStock(articleId: string): Promise<any[]> {
    try {
      return await this.pharmacieService.getStockLots(articleId);
    } catch (error) {
      console.error('Erreur lors de la vérification du stock:', error);
      return [];
    }
  }
}
