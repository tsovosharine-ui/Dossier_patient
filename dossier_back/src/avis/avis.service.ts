import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandeAvis, StatutDemande } from './entities/demande-avis.entity';
import { CreateDemandeAvisDto } from './dto/create-demande-avis.dto';
import { RepondreAvisDto } from './dto/repondre-avis.dto';
import { HistoriqueService } from '../historique/historique.service';
import { TypeAction } from '../historique/entities/historique.entity';
import { NotificationApiService } from '../notification-api/notification-api.service';
import { ChuService } from '../chu/chu.service';

@Injectable()
export class AvisService {
  constructor(
    @InjectRepository(DemandeAvis)
    private demandeRepo: Repository<DemandeAvis>,
    private historiqueService: HistoriqueService,
    private notificationApiService: NotificationApiService,
    private chuService: ChuService,
  ) {}

  async create(patientId: string, dto: CreateDemandeAvisDto): Promise<DemandeAvis> {
    const demande = this.demandeRepo.create({
      patientId,
      serviceDemandeur: dto.serviceDemandeur,
      serviceDestinataire: dto.serviceDestinataire,
      motif: dto.motif,
      statut: StatutDemande.EN_ATTENTE,
    });
    const saved = await this.demandeRepo.save(demande);

    await this.historiqueService.create({
      patientId,
      action: TypeAction.CREATION,
      module: 'Avis interservices',
      nouvellesValeurs: { serviceDestinataire: dto.serviceDestinataire, motif: dto.motif },
      commentaire: `Demande d'avis envoyée au service ${dto.serviceDestinataire}`,
      utilisateur: dto.serviceDemandeur,
    });

    // Envoyer notification via le service externe avec les infos réelles du CHU
    try {
      const chuInfo = await this.chuService.getChuInfo();
      // Récupérer le service demandeur dynamiquement
      let serviceInfo = await this.chuService.getServiceByName(dto.serviceDemandeur);
      // Si le service n'est pas trouvé, utiliser le service par défaut (Chirurgie)
      if (!serviceInfo) {
        serviceInfo = await this.chuService.getServiceInfo();
      }

      await this.notificationApiService.createNotification({
        type: 'DEMANDE_AVIS',
        motif: `Demande d'avis: ${dto.motif}`,
        sourceServiceId: serviceInfo.serviceId,
        sourceServiceName: `${chuInfo.name} - ${serviceInfo.name}`,
        targetServiceId: `service-${dto.serviceDestinataire.toLowerCase().replace(/\s+/g, '-')}`,
        targetServiceName: dto.serviceDestinataire,
        emitterId: dto.serviceDemandeur,
        emitterName: dto.serviceDemandeur,
        recipientName: dto.serviceDestinataire,
        departmentSource: `${chuInfo.name} - ${serviceInfo.name}`,
        departmentTarget: dto.serviceDestinataire,
        patientId: patientId,
        entiteRefType: 'DemandeAvis',
        entiteRefId: saved.id,
        urgence: 3,
        channels: ['WEB', 'SOUND'],
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
    }

    return saved;
  }

  async findByPatient(patientId: string): Promise<DemandeAvis[]> {
    return this.demandeRepo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, patientId: string): Promise<DemandeAvis> {
    const demande = await this.demandeRepo.findOne({ where: { id, patientId } });
    if (!demande) throw new NotFoundException('Demande d\'avis introuvable');
    return demande;
  }

  async repondre(id: string, patientId: string, dto: RepondreAvisDto): Promise<DemandeAvis> {
    const demande = await this.findOne(id, patientId);
    const anciennesValeurs = { statut: demande.statut, reponse: demande.reponse };

    demande.reponse = dto.reponse;
    demande.reponduPar = dto.reponduPar;
    demande.dateReponse = new Date();
    demande.statut = StatutDemande.REPONDUE;

    const saved = await this.demandeRepo.save(demande);

    await this.historiqueService.create({
      patientId,
      action: TypeAction.MODIFICATION,
      module: 'Avis interservices',
      anciennesValeurs,
      nouvellesValeurs: { reponse: dto.reponse, reponduPar: dto.reponduPar, statut: StatutDemande.REPONDUE },
      commentaire: `Avis fourni par ${dto.reponduPar}`,
      utilisateur: dto.reponduPar,
    });

    return saved;
  }

  async getDemandesNonLues(service: string): Promise<DemandeAvis[]> {
    const cinqMinutes = new Date(Date.now() - 5 * 60 * 1000);
    return this.demandeRepo
      .createQueryBuilder('da')
      .where('da.service_destinataire = :service', { service })
      .andWhere('da.statut = :statut', { statut: StatutDemande.EN_ATTENTE })
      .andWhere('da.created_at <= :cinqMinutes', { cinqMinutes })
      .orderBy('da.created_at', 'ASC')
      .getMany();
  }
}
