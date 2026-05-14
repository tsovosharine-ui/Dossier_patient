import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnostic } from './entities/diagnostic.entity';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';
import { UpdateDiagnosticDto } from './dto/update-diagnostic.dto';
import { HistoriqueService } from '../historique/historique.service';
import { TypeAction } from '../historique/entities/historique.entity';

@Injectable()
export class DiagnosticService {
  constructor(
    @InjectRepository(Diagnostic)
    private diagnosticRepo: Repository<Diagnostic>,
    private historiqueService: HistoriqueService,
  ) {}

  async create(patientId: string, createDto: CreateDiagnosticDto): Promise<Diagnostic> {
    const diagnostic = this.diagnosticRepo.create({ patientId, ...createDto });
    const saved = await this.diagnosticRepo.save(diagnostic);
    await this.historiqueService.create({
      patientId,
      action: TypeAction.CREATION,
      module: 'Diagnostic',
      nouvellesValeurs: { ...createDto },
      commentaire: 'Création d\'un nouveau diagnostic',
      utilisateur: createDto.medecinResponsable || 'Médecin',
    });
    return saved;
  }

  async findAllByPatient(patientId: string): Promise<Diagnostic[]> {
    return this.diagnosticRepo.find({ where: { patientId } });
  }

  async findActiveByPatient(patientId: string): Promise<Diagnostic | null> {
    return this.diagnosticRepo.findOne({ 
      where: { patientId, isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string, patientId: string): Promise<Diagnostic | null> {
    return this.diagnosticRepo.findOne({ where: { id, patientId } });
  }

  async update(id: string, patientId: string, updateDto: UpdateDiagnosticDto): Promise<Diagnostic> {
    const diagnostic = await this.findOne(id, patientId);
    if (!diagnostic) {
      throw new NotFoundException(`Diagnostic avec id ${id} non trouvé`);
    }
    const anciennesValeurs = {
      diagnosticPrincipal: diagnostic.diagnosticPrincipal,
      diagnosticsSecondaires: diagnostic.diagnosticsSecondaires,
      justificationClinique: diagnostic.justificationClinique,
      diagnosticsDifferentiels: diagnostic.diagnosticsDifferentiels,
      graviteStade: diagnostic.graviteStade,
      isActive: diagnostic.isActive,
      medecinResponsable: diagnostic.medecinResponsable,
    };
    Object.assign(diagnostic, updateDto);
    const saved = await this.diagnosticRepo.save(diagnostic);
    await this.historiqueService.create({
      patientId,
      action: TypeAction.MODIFICATION,
      module: 'Diagnostic',
      anciennesValeurs,
      nouvellesValeurs: { ...updateDto },
      commentaire: 'Mise à jour du diagnostic',
      utilisateur: updateDto.medecinResponsable || diagnostic.medecinResponsable || 'Médecin',
    });
    return saved;
  }

  async remove(id: string, patientId: string): Promise<void> {
    const diagnostic = await this.findOne(id, patientId);
    if (diagnostic) {
      const anciennesValeurs = {
        diagnosticPrincipal: diagnostic.diagnosticPrincipal,
        diagnosticsSecondaires: diagnostic.diagnosticsSecondaires,
        justificationClinique: diagnostic.justificationClinique,
        diagnosticsDifferentiels: diagnostic.diagnosticsDifferentiels,
        graviteStade: diagnostic.graviteStade,
        isActive: diagnostic.isActive,
        medecinResponsable: diagnostic.medecinResponsable,
      };
      await this.diagnosticRepo.remove(diagnostic);
      await this.historiqueService.create({
        patientId,
        action: TypeAction.SUPPRESSION,
        module: 'Diagnostic',
        anciennesValeurs,
        commentaire: 'Suppression du diagnostic',
        utilisateur: diagnostic.medecinResponsable || 'Médecin',
      });
    }
  }
}
