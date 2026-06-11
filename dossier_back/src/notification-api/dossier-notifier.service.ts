import { Injectable, Logger } from '@nestjs/common';
import { NotificationApiService } from './notification-api.service';
import { ChuService } from '../chu/chu.service';
import { DialyseService } from '../dialyse/dialyse.service';

@Injectable()
export class DossierNotifierService {
  private readonly logger = new Logger(DossierNotifierService.name);

  constructor(
    private readonly notificationApi: NotificationApiService,
    private readonly chuService: ChuService,
    private readonly dialyseApiService: DialyseService,
  ) {}

  /**
   * Envoi de notification pour une demande d'avis (Avis Interservices)
   */
  async notifyAvis(demandeAvis: any, motif: string, patientId: string): Promise<void> {
    this.processAvisNotification(demandeAvis, motif, patientId).catch((error) => {
      this.logger.error(`Erreur asynchrone lors de la notification de demande d'avis: ${error.message}`);
    });
  }

  private async processAvisNotification(demandeAvis: any, motif: string, patientId: string): Promise<void> {
    const chuInfo = await this.chuService.getChuInfo();
    let serviceInfo = await this.chuService.getServiceByName(demandeAvis.serviceDemandeur);
    if (!serviceInfo) {
      serviceInfo = await this.chuService.getServiceInfo();
    }

    // 1. Notification Centrale
    await this.notificationApi.createNotification({
      type: 'DEMANDE_AVIS',
      motif: `Demande d'avis: ${motif}`,
      sourceServiceId: serviceInfo.serviceId,
      sourceServiceName: `${chuInfo.name} - ${serviceInfo.name}`,
      targetServiceId: `service-${demandeAvis.serviceDestinataire.toLowerCase().replace(/\\s+/g, '-')}`,
      targetServiceName: demandeAvis.serviceDestinataire,
      emitterId: demandeAvis.serviceDemandeur,
      emitterName: demandeAvis.serviceDemandeur,
      recipientName: demandeAvis.serviceDestinataire,
      departmentSource: `${chuInfo.name} - ${serviceInfo.name}`,
      departmentTarget: demandeAvis.serviceDestinataire,
      patientId: patientId,
      entiteRefType: 'DemandeAvis',
      entiteRefId: demandeAvis.id,
      urgence: 3,
      channels: ['WEB', 'SOUND'],
    });

    // 2. Webhook direct Dialyse si applicable
    if (demandeAvis.serviceDestinataire.toLowerCase().includes('dialyse')) {
      let dialysePatient = await this.dialyseApiService.getPatientByExternalId(patientId);
      if (!dialysePatient) {
        dialysePatient = await this.dialyseApiService.createPatient({
          nom: 'Patient',
          prenom: '',
          dateNaissance: null,
          telephone: null,
          notes: `Patient ID: ${patientId}`,
          external_patient_id: patientId,
        });
      }

      await this.dialyseApiService.createDemandeAvis({
        patientId: dialysePatient.id,
        description_cas: motif,
        priorite: 'moyenne',
        date_envoi: new Date().toISOString(),
      });
    }
  }

  /**
   * Envoi de notification pour un résultat paraclinique disponible
   */
  async notifyResultatParaclinique(resultat: any, patientId: string): Promise<void> {
    this.processResultatParacliniqueNotification(resultat, patientId).catch((error) => {
      this.logger.error(`Erreur asynchrone lors de la notification de résultat paraclinique: ${error.message}`);
    });
  }

  private async processResultatParacliniqueNotification(resultat: any, patientId: string): Promise<void> {
    await this.notificationApi.createNotification({
      type: 'RESULTAT_EXAMEN',
      motif: `Résultat d'examen disponible: ${resultat.type}`,
      sourceServiceId: 'service-laboratoire',
      sourceServiceName: 'Laboratoire',
      targetServiceId: 'service-medical',
      targetServiceName: 'Service Médical',
      emitterId: 'laboratoire',
      emitterName: 'Laboratoire',
      recipientName: 'Service Médical',
      patientId: patientId,
      entiteRefType: 'ResultatParaclinique',
      entiteRefId: resultat.id,
      urgence: 2,
      channels: ['WEB', 'SOUND'],
    });
  }

  /**
   * Envoi de notification pour une observation validée
   */
  async notifyObservation(observation: any, patientId: string): Promise<void> {
    this.processObservationNotification(observation, patientId).catch((error) => {
      this.logger.error(`Erreur asynchrone lors de la notification d'observation: ${error.message}`);
    });
  }

  private async processObservationNotification(observation: any, patientId: string): Promise<void> {
    await this.notificationApi.createNotification({
      type: 'NOUVELLE_OBSERVATION',
      motif: `Nouvelle observation médicale validée`,
      sourceServiceId: 'service-medical',
      sourceServiceName: 'Service Médical',
      targetServiceId: 'service-infirmier',
      targetServiceName: 'Personnel Soignant',
      emitterId: 'medecin',
      emitterName: 'Médecin',
      recipientName: 'Équipe Soignante',
      patientId: patientId,
      entiteRefType: 'Observation',
      entiteRefId: observation.id,
      urgence: 5,
      channels: ['WEB'],
    });
  }

  /**
   * Envoi de notification pour un nouveau suivi
   */
  async notifySuivi(suivi: any, patientId: string): Promise<void> {
    this.processSuiviNotification(suivi, patientId).catch((error) => {
      this.logger.error(`Erreur asynchrone lors de la notification de suivi: ${error.message}`);
    });
  }

  private async processSuiviNotification(suivi: any, patientId: string): Promise<void> {
    await this.notificationApi.createNotification({
      type: 'NOUVEAU_SUIVI',
      motif: `Nouveau suivi / soin enregistré: ${suivi.type}`,
      sourceServiceId: 'service-infirmier',
      sourceServiceName: 'Personnel Soignant',
      targetServiceId: 'service-medical',
      targetServiceName: 'Service Médical',
      emitterId: 'infirmier',
      emitterName: 'Infirmier',
      recipientName: 'Médecin Traitant',
      patientId: patientId,
      entiteRefType: 'Suivi',
      entiteRefId: suivi.id,
      urgence: 5,
      channels: ['WEB'],
    });
  }

  /**
   * Envoi de notification pour une nouvelle prescription
   */
  async notifyPrescription(prescription: any, dto: any, serviceName?: string): Promise<void> {
    this.processPrescriptionNotification(prescription, dto, serviceName).catch((error) => {
      this.logger.error(`Erreur asynchrone lors de la notification de prescription: ${error.message}`);
    });
  }

  private async processPrescriptionNotification(prescription: any, dto: any, serviceName?: string): Promise<void> {
    const chuInfo = await this.chuService.getChuInfo();
    let serviceInfo;
    if (serviceName) {
      serviceInfo = await this.chuService.getServiceByName(serviceName);
    }
    if (!serviceInfo) {
      serviceInfo = await this.chuService.getServiceInfo();
    }

    await this.notificationApi.createNotification({
      type: 'ORDONNANCE',
      motif: `Nouvelle prescription pour le patient ${dto.patientId}`,
      sourceServiceId: serviceInfo.serviceId,
      sourceServiceName: `${chuInfo.name} - ${serviceInfo.name}`,
      targetServiceId: 'service-pharmacie',
      targetServiceName: 'Pharmacie',
      emitterId: dto.prescripteur || 'unknown',
      emitterName: dto.prescripteur || 'Médecin',
      recipientName: 'Pharmacie',
      departmentSource: chuInfo.name,
      departmentTarget: 'Pharmacie',
      patientId: dto.patientId,
      entiteRefType: 'Prescription',
      entiteRefId: prescription.id,
      urgence: 3,
      channels: ['INTERNAL'],
    });
  }

  /**
   * Envoi de notification pour toutes les sous-prescriptions spécifiques (labo, imagerie, etc.)
   */
  async notifySpecificPrescription(localDto: any): Promise<void> {
    this.processSpecificPrescriptionNotification(localDto).catch((error) => {
      this.logger.error(`Erreur asynchrone lors de la notification spécifique de prescription: ${error.message}`);
    });
  }

  private async processSpecificPrescriptionNotification(dto: any): Promise<void> {
    const chuInfo = await this.chuService.getChuInfo();
    // Default to main service if the prescripteur's service is unknown
    const serviceInfo = await this.chuService.getServiceInfo();

    const mappedType = this.getExternalType(dto.destinataire, dto.referenceType);
    let urgencyLevel = 5;
    if (dto.contenu?.urgence === 'tu') urgencyLevel = 1;
    else if (dto.contenu?.urgence === 'u') urgencyLevel = 2;

    const targetServiceName = this.getServiceName(dto.destinataire);
    const sourceServiceName = `${chuInfo.name} - ${serviceInfo.name}`;

    // Specific target Service IDs for some external APIs
    let targetServiceId = dto.destinataire.toLowerCase();
    if (targetServiceId === 'endoscopie') targetServiceId = '38f39d38-152e-495b-8c48-28937750d9eb';
    if (targetServiceId === 'dialyse') targetServiceId = 'd604bde1-c9dd-4284-a690-0c5ed9be6a37';

    await this.notificationApi.createNotification({
      type: mappedType,
      motif: dto.titre || `Nouvelle prescription ${targetServiceName}`,
      sourceServiceId: serviceInfo.serviceId || 'service-prescription',
      sourceServiceName: sourceServiceName,
      targetServiceId: targetServiceId,
      targetServiceName: targetServiceName,
      emitterId: dto.expediteurId || 'unknown',
      emitterName: 'Médecin',
      recipientName: targetServiceName,
      departmentSource: sourceServiceName,
      departmentTarget: targetServiceName,
      patientId: dto.patientId,
      entiteRefType: this.getExternalRefType(dto.referenceType),
      entiteRefId: dto.referenceId,
      urgence: urgencyLevel,
      channels: ['WEB'],
      payload: dto.contenu,
    });
  }

  private getExternalRefType(referenceType: string): string {
    const mapping: Record<string, string> = {
      PriseMedicament: 'PrescriptionMedicale',
      PRESCRIPTION_MEDICALE: 'PrescriptionMedicale',
      PRESCRIPTION_LABO: 'PrescriptionLabo',
      PRESCRIPTION_IMAGERIE: 'PrescriptionImagerie',
      PRESCRIPTION_ANAPATH: 'PrescriptionAnapath',
      PRESCRIPTION_EEG: 'PrescriptionEEG',
      PRESCRIPTION_KINE: 'PrescriptionKine',
      PRESCRIPTION_DIALYSE: 'PrescriptionDialyse',
      PRESCRIPTION_ENDOSCOPIE: 'PrescriptionEndoscopie',
      PRESCRIPTION_TRANSFUSION: 'PrescriptionTransfusion',
      PRESCRIPTION_BLOC: 'PrescriptionBloc',
    };
    return mapping[referenceType] || referenceType;
  }

  private getExternalType(type: string, referenceType?: string) {
    if (!type) return 'PRESCRIPTION_ALERT';
    const t = type.toLowerCase();
    if (t === 'infirmier') {
      if (referenceType === 'PRESCRIPTION_NON_MEDICALE' || referenceType === 'PRESCRIPTION_SURVEILLANCE')
        return 'PRESCRIPTION_ALERT';
      return 'MEDICAMENT_PATIENT';
    }
    const mapping: Record<string, string> = {
      labo: 'DEMANDE_EXAMEN',
      laboratoire: 'DEMANDE_EXAMEN',
      imagerie: 'DEMANDE_EXAMEN',
      anapath: 'DEMANDE_EXAMEN',
      eeg: 'DEMANDE_EXAMEN',
      kine: 'RENDEZ_VOUS',
      dialyse: 'DEMANDE_EXAMEN',
      endoscopie: 'DEMANDE_EXAMEN',
      'depot-sang': 'COMMANDE_SANG',
      transfusion: 'COMMANDE_SANG',
      bloc: 'CPA_DEMANDE',
    };
    return mapping[t] || 'PRESCRIPTION_ALERT';
  }

  private getServiceName(type: string): string {
    if (!type) return 'Inconnu';
    const t = type.toLowerCase();
    const names: Record<string, string> = {
      infirmier: 'Infirmier',
      labo: 'Laboratoire',
      laboratoire: 'Laboratoire',
      imagerie: 'Imagerie',
      anapath: 'Anatomopathologie',
      eeg: 'EEG',
      kine: 'Kinésithérapie',
      dialyse: 'Dialyse',
      endoscopie: 'Endoscopie',
      'depot-sang': 'Dépôt de sang',
      transfusion: 'Dépôt de sang',
      bloc: 'Bloc opératoire',
    };
    return names[t] || type;
  }
}
