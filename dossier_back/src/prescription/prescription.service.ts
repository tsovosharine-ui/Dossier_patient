import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { HistoriqueService } from '../historique/historique.service';
import { TypeAction } from '../historique/entities/historique.entity';
import { NotificationApiService } from '../notification-api/notification-api.service';
import { ChuService } from '../chu/chu.service';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionRepo: Repository<Prescription>,
    private historiqueService: HistoriqueService,
    private notificationApiService: NotificationApiService,
    private chuService: ChuService,
  ) {}

  async create(createDto: CreatePrescriptionDto, serviceName?: string): Promise<Prescription> {
    if (!createDto.patientId) {
      throw new Error('patientId est requis');
    }
    const prescription = this.prescriptionRepo.create({
      ...createDto,
      statut: "ACTIVE",
      datePrescription: new Date(),
    });
    const saved = await this.prescriptionRepo.save(prescription);

    await this.historiqueService.create({
      patientId: createDto.patientId,
      action: TypeAction.CREATION,
      module: 'Prescription',
      nouvellesValeurs: { ...createDto, statut: "ACTIVE" },
      commentaire: 'Création d\'une nouvelle prescription',
      utilisateur: createDto.prescripteur || 'Médecin',
    });

    // Envoyer notification via le service externe avec les infos réelles du CHU
    try {
      const chuInfo = await this.chuService.getChuInfo();
      // Récupérer le service dynamiquement selon le serviceName passé ou utiliser le service par défaut
      let serviceInfo;
      if (serviceName) {
        serviceInfo = await this.chuService.getServiceByName(serviceName);
      }
      // Si le service n'est pas trouvé ou non spécifié, utiliser le service par défaut (Chirurgie)
      if (!serviceInfo) {
        serviceInfo = await this.chuService.getServiceInfo();
      }

      await this.notificationApiService.createNotification({
        type: 'ORDONNANCE',
        motif: `Nouvelle prescription pour le patient ${createDto.patientId}`,
        sourceServiceId: serviceInfo.serviceId,
        sourceServiceName: `${chuInfo.name} - ${serviceInfo.name}`,
        targetServiceId: 'service-pharmacie',
        targetServiceName: 'Pharmacie',
        emitterId: createDto.prescripteur || 'unknown',
        emitterName: createDto.prescripteur || 'Médecin',
        recipientName: 'Pharmacie',
        departmentSource: chuInfo.name,
        departmentTarget: 'Pharmacie',
        patientId: createDto.patientId,
        entiteRefType: 'Prescription',
        entiteRefId: saved.id,
        urgence: 3,
        channels: ['INTERNAL'],
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
    }

    return saved;
  }

  async findAllByPatient(patientId: string): Promise<Prescription[]> {
    return this.prescriptionRepo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByPatient(patientId: string): Promise<Prescription[]> {
    return this.prescriptionRepo.find({
      where: { patientId, statut: "ACTIVE" },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, patientId: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepo.findOne({ where: { id, patientId } });
    if (!prescription) {
      throw new NotFoundException(`Prescription id ${id} non trouvée`);
    }
    return prescription;
  }

  async update(id: string, patientId: string, updateData: Partial<CreatePrescriptionDto>): Promise<Prescription> {
    const prescription = await this.findOne(id, patientId);
    const anciennesValeurs = { ...prescription };
    Object.assign(prescription, updateData);
    const saved = await this.prescriptionRepo.save(prescription);

    await this.historiqueService.create({
      patientId,
      action: TypeAction.MODIFICATION,
      module: 'Prescription',
      anciennesValeurs,
      nouvellesValeurs: updateData,
      commentaire: 'Modification de la prescription',
      utilisateur: updateData.prescripteur || prescription.prescripteur || 'Médecin',
    });

    return saved;
  }

  async validate(id: string, patientId: string): Promise<Prescription> {
    const prescription = await this.findOne(id, patientId);
    const anciennesValeurs = { valide: prescription.valide, statut: prescription.statut };
    prescription.valide = true;
    prescription.statut = "TERMINEE";
    const saved = await this.prescriptionRepo.save(prescription);

    await this.historiqueService.create({
      patientId,
      action: TypeAction.MODIFICATION,
      module: 'Prescription',
      anciennesValeurs,
      nouvellesValeurs: { valide: true, statut: "TERMINEE" },
      commentaire: 'Validation et clôture de la prescription',
      utilisateur: prescription.prescripteur || 'Médecin',
    });

    return saved;
  }

  async remove(id: string, patientId: string): Promise<void> {
    const prescription = await this.findOne(id, patientId);
    const anciennesValeurs = { ...prescription };
    await this.prescriptionRepo.remove(prescription);

    await this.historiqueService.create({
      patientId,
      action: TypeAction.SUPPRESSION,
      module: 'Prescription',
      anciennesValeurs,
      commentaire: 'Suppression de la prescription',
      utilisateur: prescription.prescripteur || 'Médecin',
    });
  }
}
