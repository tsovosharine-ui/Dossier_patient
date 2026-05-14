import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sortie } from './sortie.entity';
import { HistoriqueService } from '../historique/historique.service';
import { TypeAction } from '../historique/entities/historique.entity';

@Injectable()
export class SortieService {
  constructor(
    @InjectRepository(Sortie)
    private repo: Repository<Sortie>,
    private historiqueService: HistoriqueService,
  ) {}

  async findByPatient(patientId: string): Promise<Sortie[]> {
    return this.repo.find({ where: { patientId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Sortie> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Sortie introuvable');
    return s;
  }

  async upsert(patientId: string, data: Partial<Sortie>): Promise<Sortie> {
    const existing = await this.repo.findOne({ where: { patientId, statut: 'EN_COURS' } });
    if (existing) {
      await this.repo.update(existing.id, data);
      return this.findOne(existing.id);
    }
    const s = this.repo.create({ ...data, patientId, statut: 'EN_COURS' });
    return this.repo.save(s);
  }

  async valider(id: string, signatureData: string): Promise<Sortie> {
    const sortie = await this.findOne(id);
    
    const anciennesValeurs = {
      statut: sortie.statut,
      signatureData: sortie.signatureData,
    };

    const horodatage = new Date().toISOString();
    await this.repo.update(id, {
      statut: 'CLOTURE',
      signatureData,
      signatureHorodatage: horodatage,
    });
    
    const saved = await this.findOne(id);

    await this.historiqueService.create({
      patientId: saved.patientId,
      action: TypeAction.MODIFICATION,
      module: 'Sortie',
      anciennesValeurs,
      nouvellesValeurs: { statut: 'CLOTURE', signatureData: '***SIGNATURE***' }, // Masquer la signature en db historique
      commentaire: 'Clôture et signature de la sortie du patient',
      utilisateur: saved.medecinValidant || 'Médecin',
    });

    return saved;
  }

  async update(id: string, data: Partial<Sortie>): Promise<Sortie> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }
}
