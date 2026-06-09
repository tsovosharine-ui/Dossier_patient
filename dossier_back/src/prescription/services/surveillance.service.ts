import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionSurveillance } from '../entities/prescription-surveillance.entity';
import { ParametreSurveillance } from '../entities/parametre-surveillance.entity';

@Injectable()
export class SurveillanceService {
  constructor(
    @InjectRepository(PrescriptionSurveillance)
    private prescriptionRepo: Repository<PrescriptionSurveillance>,
    @InjectRepository(ParametreSurveillance)
    private parametreRepo: Repository<ParametreSurveillance>,
  ) {}

  async create(prescripteurId: string, dto: any) {
    const { parametres, ...rest } = dto;
    
    const prescription = this.prescriptionRepo.create({
      ...rest,
      prescripteurId,
    });

    const savedPrescription = await this.prescriptionRepo.save(prescription) as unknown as PrescriptionSurveillance;

    await Promise.all(
      parametres.map((p: any) => {
        let frequenceStr = p.frequenceType || 'Non spécifié';
        if (p.frequenceType === 'HEURES')
          frequenceStr = `Toutes les ${p.frequenceValeur}h`;
        else if (p.frequenceType === 'PAR_JOUR')
          frequenceStr = `${p.frequenceValeur}× par jour`;
        else if (p.frequenceType === 'SOS')
          frequenceStr = 'Si besoin (SOS)';
        else if (p.frequenceType === 'CONTINU') frequenceStr = 'En continu';

        return this.parametreRepo.save({
          ...p,
          prescriptionId: savedPrescription.id,
          duree: p.dureeJours ? `${p.dureeJours} jours` : null,
          frequence: frequenceStr,
          details: p.details || null,
        });
      }),
    );

    return this.findOne(savedPrescription.id);
  }

  async findAll() {
    return this.prescriptionRepo.find({
      relations: ['parametres'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPatient(patientId: string) {
    return this.prescriptionRepo.find({
      where: { patientId },
      relations: ['parametres'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const prescription = await this.prescriptionRepo.findOne({
      where: { id },
      relations: ['parametres'],
    });
    if (!prescription) throw new NotFoundException('Prescription introuvable');
    return prescription;
  }

  async updateStatut(id: string, statut: string) {
    return this.prescriptionRepo.update(id, { statut });
  }
}
