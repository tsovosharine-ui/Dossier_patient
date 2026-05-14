import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResultatParaclinique, StatutResultat } from './entities/resultat-paraclinique.entity';
import { CreateResultatParacliniqueDto } from './dto/create-resultat-paraclinique.dto';
import { UpdateResultatParacliniqueDto } from './dto/update-resultat-paraclinique.dto';
import { HistoriqueService } from '../historique/historique.service';
import { TypeAction } from '../historique/entities/historique.entity';

@Injectable()
export class ResultatParacliniqueService {
  constructor(
    @InjectRepository(ResultatParaclinique)
    private resultatRepo: Repository<ResultatParaclinique>,
    private historiqueService: HistoriqueService,
  ) {}

  async create(createDto: CreateResultatParacliniqueDto): Promise<ResultatParaclinique> {
    const newResultat = this.resultatRepo.create({
      ...createDto,
      statut: createDto.statut || StatutResultat.DEMANDE,
    });
    const saved = await this.resultatRepo.save(newResultat);

    await this.historiqueService.create({
      patientId: createDto.patientId,
      action: TypeAction.CREATION,
      module: 'Resultats Paracliniques',
      nouvellesValeurs: { ...createDto },
      commentaire: 'Demande ou ajout d\'un résultat paraclinique',
      utilisateur: createDto.prescripteur || 'Médecin',
    });

    return saved;
  }

  async findAllByPatient(patientId: string): Promise<ResultatParaclinique[]> {
    return this.resultatRepo.find({
      where: { patientId },
      order: { dateDemande: 'DESC' },
    });
  }

  async findOne(id: string, patientId: string): Promise<ResultatParaclinique> {
    const resultat = await this.resultatRepo.findOne({ where: { id, patientId } });
    if (!resultat) {
      throw new NotFoundException(`Résultat paraclinique avec id ${id} non trouvé pour ce patient`);
    }
    return resultat;
  }

  async update(id: string, patientId: string, updateDto: UpdateResultatParacliniqueDto): Promise<ResultatParaclinique> {
    const resultat = await this.findOne(id, patientId);

    const anciennesValeurs = {
      type: resultat.type,
      contenu: resultat.resultatTexte,
      fichierUrl: resultat.resultatFichiers,
      statut: resultat.statut,
      demandeur: resultat.prescripteur,
    };

    Object.assign(resultat, updateDto);
    const saved = await this.resultatRepo.save(resultat);

    await this.historiqueService.create({
      patientId,
      action: TypeAction.MODIFICATION,
      module: 'Resultats Paracliniques',
      anciennesValeurs,
      nouvellesValeurs: { ...updateDto },
      commentaire: 'Mise à jour du résultat paraclinique',
      utilisateur: updateDto.prescripteur || resultat.prescripteur || 'Médecin',
    });

    return saved;
  }

  async remove(id: string, patientId: string): Promise<void> {
    const resultat = await this.findOne(id, patientId);

    const anciennesValeurs = {
      type: resultat.type,
      contenu: resultat.resultatTexte,
      fichierUrl: resultat.resultatFichiers,
      statut: resultat.statut,
      demandeur: resultat.prescripteur,
    };

    await this.resultatRepo.remove(resultat);

    await this.historiqueService.create({
      patientId,
      action: TypeAction.SUPPRESSION,
      module: 'Resultats Paracliniques',
      anciennesValeurs,
      commentaire: 'Suppression d\'un résultat paraclinique',
      utilisateur: resultat.prescripteur || 'Médecin',
    });
  }

  async marquerLu(id: string, patientId: string): Promise<ResultatParaclinique> {
    const resultat = await this.findOne(id, patientId);
    
    const anciennesValeurs = {
      statut: resultat.statut,
    };
    
    resultat.statut = StatutResultat.LU;
    const saved = await this.resultatRepo.save(resultat);

    await this.historiqueService.create({
      patientId,
      action: TypeAction.MODIFICATION,
      module: 'Resultats Paracliniques',
      anciennesValeurs,
      nouvellesValeurs: { statut: StatutResultat.LU },
      commentaire: 'Résultat paraclinique marqué comme lu',
      utilisateur: resultat.prescripteur || 'Médecin',
    });

    return saved;
  }
}
