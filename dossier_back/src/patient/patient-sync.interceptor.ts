import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { PatientService } from './patient.service';

@Injectable()
export class PatientSyncInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PatientSyncInterceptor.name);

  constructor(
    private readonly patientService: PatientService,
    private readonly configService: ConfigService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const patientId = request.params?.patientId;

    if (patientId) {
      try {
        await this.patientService.findOne(patientId);
      } catch {
        try {
          const baseUrl = this.configService.get<string>('HOSPITALISATION_API_URL');
          const token = this.configService.get<string>('SERVICE_API_TOKEN');
          const url = `${baseUrl}/patients/${encodeURIComponent(patientId)}`;

          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            await this.patientService.create({
              id: data.id,
              nom: data.nom,
              prenom: data.prenom,
              dateNaissance: data.dateNaissance,
              sexe: data.sexe === 'MALE' ? 'M' : data.sexe === 'FEMALE' ? 'F' : data.sexe,
            });
            this.logger.log(`Patient ${patientId} synchronisé depuis hospitalisation-back`);
          } else {
            this.logger.warn(`Patient ${patientId} introuvable sur hospitalisation-back (${res.status})`);
          }
        } catch (fetchError) {
          this.logger.error(`Erreur sync patient ${patientId}:`, fetchError);
        }
      }
    }

    return next.handle();
  }
}
