import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionNonMedicale } from '../entities/prescription-non-medicale.entity';
import { ItemNonMedical } from '../entities/item-non-medical.entity';

@Injectable()
export class NonMedicaleService {
  constructor(
    @InjectRepository(PrescriptionNonMedicale)
    private prescriptionRepo: Repository<PrescriptionNonMedicale>,
    @InjectRepository(ItemNonMedical)
    private itemRepo: Repository<ItemNonMedical>,
  ) {}

  async create(prescripteurId: string, dto: any) {
    const { items, ...rest } = dto;
    
    const prescription = this.prescriptionRepo.create({
      ...rest,
      prescripteurId,
    });

    const savedPrescription = await this.prescriptionRepo.save(prescription) as unknown as PrescriptionNonMedicale;

    await Promise.all(
      items.map((i: any) => {
        let frequenceStr = i.frequenceType || '';
        if (i.frequenceType === 'HEURES')
          frequenceStr = `Toutes les ${i.frequenceValeur}h`;
        else if (i.frequenceType === 'PAR_JOUR')
          frequenceStr = `${i.frequenceValeur}× par jour`;
        else if (i.frequenceType === 'SOS')
          frequenceStr = 'Si besoin (SOS)';
        else if (i.frequenceType === 'CONTINU') frequenceStr = 'En continu';

        return this.itemRepo.save({
          ...i,
          prescriptionId: savedPrescription.id,
          dateDebut: i.dateDebut ? new Date(i.dateDebut) : undefined,
          duree: i.dureeJours ? `${i.dureeJours} jours` : null,
          frequence: frequenceStr,
        });
      }),
    );

    return this.findOne(savedPrescription.id);
  }

  async findAll() {
    return this.prescriptionRepo.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPatient(patientId: string) {
    return this.prescriptionRepo.find({
      where: { patientId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const prescription = await this.prescriptionRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!prescription) throw new NotFoundException('Prescription introuvable');
    return prescription;
  }

  async updateStatut(id: string, statut: string) {
    return this.prescriptionRepo.update(id, { statut });
  }
}
