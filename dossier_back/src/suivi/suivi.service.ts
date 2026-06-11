import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suivi } from './suivi.entity';
import { CreateSuiviDto } from './dto/create-suivi.dto';
import { HistoriqueService } from '../historique/historique.service';
import { TypeAction } from '../historique/entities/historique.entity';
import { DossierNotifierService } from '../notification-api/dossier-notifier.service';

@Injectable()
export class SuiviService {
  constructor(
    @InjectRepository(Suivi)
    private readonly repo: Repository<Suivi>,
    private historiqueService: HistoriqueService,
    private dossierNotifierService: DossierNotifierService,
  ) {}

  async findAllByPatient(patientId: string): Promise<Suivi[]> {
    return this.repo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(patientId: string, dto: CreateSuiviDto): Promise<Suivi> {
    const suivi = this.repo.create({ patientId, ...dto });
    const saved = await this.repo.save(suivi);

    await this.historiqueService.create({
      patientId,
      action: TypeAction.CREATION,
      module: 'Soins / Suivi',
      nouvellesValeurs: { ...dto },
      commentaire: 'Ajout d\'une nouvelle entrée de suivi ou de soin',
      utilisateur: dto.auteur || 'Personnel soignant',
    });

    this.dossierNotifierService.notifySuivi(saved, patientId);

    return saved;
  }
}
