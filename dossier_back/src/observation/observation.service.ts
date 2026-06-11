import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observation } from './entities/observation.entity';
import { UpdateObservationDto } from './dto/update-observation.dto';
import { UpsertObservationDto } from './dto/upsert-observation.dto';
import { HistoriqueService } from '../historique/historique.service';
import { TypeAction } from '../historique/entities/historique.entity';
import { DossierNotifierService } from '../notification-api/dossier-notifier.service';

@Injectable()
export class ObservationService {
  constructor(
    @InjectRepository(Observation)
    private observationRepo: Repository<Observation>,
    private historiqueService: HistoriqueService,
    private dossierNotifierService: DossierNotifierService,
  ) {}

  async getByPatient(patientId: string): Promise<Observation> {
    let observation = await this.observationRepo.findOne({ where: { patientId } });
    if (!observation) {
      observation = this.observationRepo.create({ patientId, data: {}, statut: 'brouillon' });
      await this.observationRepo.save(observation);
    }
    return observation;
  }

  async upsert(patientId: string, updateDto: UpdateObservationDto): Promise<Observation> {
    let observation = await this.observationRepo.findOne({ where: { patientId } });
    if (!observation) {
      observation = this.observationRepo.create({ patientId, ...updateDto });
    } else {
      Object.assign(observation, updateDto);
    }
    return this.observationRepo.save(observation);
  }

  async valider(patientId: string, updateDto: UpsertObservationDto): Promise<Observation> {
    let observation = await this.observationRepo.findOne({ where: { patientId } });
    const anciennesValeurs = observation ? observation.data : {};
    const nouvellesValeurs = updateDto.data;

    if (!observation) {
      observation = this.observationRepo.create({ 
        patientId, 
        ...updateDto, 
        statut: 'valide', 
        dateValidation: new Date() 
      });
    } else {
      Object.assign(observation, { 
        ...updateDto, 
        statut: 'valide', 
        dateValidation: new Date() 
      });
    }
    const saved = await this.observationRepo.save(observation);

    await this.historiqueService.create({
      patientId,
      action: TypeAction.MODIFICATION,
      module: 'Observation',
      anciennesValeurs: anciennesValeurs || {},
      nouvellesValeurs: nouvellesValeurs || {},
      commentaire: 'Validation de l\'observation',
      utilisateur: 'Médecin', // TODO: Récupérer l'utilisateur connecté via le contexte d'authentification
    });

    this.dossierNotifierService.notifyObservation(saved, patientId);

    return saved;
  }
}
