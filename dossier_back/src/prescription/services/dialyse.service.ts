import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionDialyse } from '../entities/prescription-dialyse.entity';

@Injectable()
export class DialyseService {
  constructor(
    @InjectRepository(PrescriptionDialyse)
    private repo: Repository<PrescriptionDialyse>,
  ) {}

  async create(prescripteurId: string, dto: any) {
    const prescription = this.repo.create({ ...dto, prescripteurId });
    return this.repo.save(prescription);
  }

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findByPatient(patientId: string) {
    return this.repo.find({ where: { patientId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const prescription = await this.repo.findOne({ where: { id } });
    if (!prescription) throw new NotFoundException('Prescription introuvable');
    return prescription;
  }

  async updateStatut(id: string, statut: string) {
    return this.repo.update(id, { statut });
  }
}
