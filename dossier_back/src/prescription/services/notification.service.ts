import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  async create(dto: any) {
    const notification = this.notificationRepo.create(dto);
    return this.notificationRepo.save(notification);
  }

  async markAsSent(id: string) {
    return this.notificationRepo.update(id, { statut: 'ENVOYE' });
  }

  async findByPatient(patientId: string) {
    return this.notificationRepo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }
}
