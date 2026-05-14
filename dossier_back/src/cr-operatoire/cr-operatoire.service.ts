import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrOperatoire } from './cr-operatoire.entity';
import { HistoriqueService } from '../historique/historique.service';
import { TypeAction } from '../historique/entities/historique.entity';

@Injectable()
export class CrOperatoireService {
  constructor(
    @InjectRepository(CrOperatoire)
    private repo: Repository<CrOperatoire>,
    private historiqueService: HistoriqueService,
  ) {}

  async findByPatient(patientId: string): Promise<CrOperatoire[]> {
    return this.repo.find({ where: { patientId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<CrOperatoire> {
    const cr = await this.repo.findOne({ where: { id } });
    if (!cr) throw new NotFoundException('CR opératoire introuvable');
    return cr;
  }

  async create(patientId: string, data: Partial<CrOperatoire>): Promise<CrOperatoire> {
    const cr = this.repo.create({ ...data, patientId, statut: 'PLANIFIE' });
    const saved = await this.repo.save(cr);

    await this.historiqueService.create({
      patientId,
      action: TypeAction.CREATION,
      module: 'CR Opératoire',
      nouvellesValeurs: { ...data, statut: 'PLANIFIE' },
      commentaire: 'Planification d\'un compte rendu opératoire',
      utilisateur: data.chirurgien || 'Chirurgien',
    });

    return saved;
  }

  async update(id: string, data: Partial<CrOperatoire>): Promise<CrOperatoire> {
    const cr = await this.findOne(id);
    
    const anciennesValeurs = {
      typeIntervention: cr.typeIntervention,
      statut: cr.statut,
      chirurgien: cr.chirurgien,
      anesthesiste: cr.anesthesiste,
      deroulement: cr.deroulement,
      incidents: cr.incidents,
      observations: cr.observations,
    };

    await this.repo.update(id, data);
    const saved = await this.findOne(id);

    await this.historiqueService.create({
      patientId: saved.patientId,
      action: TypeAction.MODIFICATION,
      module: 'CR Opératoire',
      anciennesValeurs,
      nouvellesValeurs: { ...data },
      commentaire: 'Mise à jour du compte rendu opératoire',
      utilisateur: saved.chirurgien || 'Chirurgien',
    });

    return saved;
  }

  async remove(id: string): Promise<void> {
    const cr = await this.findOne(id);
    
    const anciennesValeurs = {
      typeIntervention: cr.typeIntervention,
      statut: cr.statut,
      chirurgien: cr.chirurgien,
      anesthesiste: cr.anesthesiste,
      deroulement: cr.deroulement,
      incidents: cr.incidents,
      observations: cr.observations,
    };

    await this.repo.delete(id);

    await this.historiqueService.create({
      patientId: cr.patientId,
      action: TypeAction.SUPPRESSION,
      module: 'CR Opératoire',
      anciennesValeurs,
      commentaire: 'Suppression d\'un compte rendu opératoire',
      utilisateur: cr.chirurgien || 'Chirurgien',
    });
  }
}
