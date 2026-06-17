import { Test, TestingModule } from '@nestjs/testing';
import { AvisNotificationService } from './avis-notification.service';
import { AvisService } from './avis.service';
import { DialyseService } from '../dialyse/dialyse.service';

describe('AvisNotificationService', () => {
  let service: AvisNotificationService;
  const mockAvisService = {
    getDemandesNonLues: jest.fn(),
  };
  const mockDialyseService = {
    getPatientByExternalId: jest.fn(),
    createPatient: jest.fn(),
    findDemandesAvis: jest.fn(),
    createDemandeAvis: jest.fn(),
  };

  beforeEach(async () => {
    mockAvisService.getDemandesNonLues.mockReset();
    mockDialyseService.getPatientByExternalId.mockReset();
    mockDialyseService.createPatient.mockReset();
    mockDialyseService.findDemandesAvis.mockReset();
    mockDialyseService.createDemandeAvis.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvisNotificationService,
        { provide: AvisService, useValue: mockAvisService },
        { provide: DialyseService, useValue: mockDialyseService },
      ],
    }).compile();

    service = module.get<AvisNotificationService>(AvisNotificationService);
  });

  it('should create a Dialyse demande d\'avis when a pending Dialyse request exists', async () => {
    const demande = {
      id: 'demande-1',
      patientId: 'patient-123',
      serviceDestinataire: 'Dialyse',
      motif: 'Suspicion de complication rénale',
    };

    mockAvisService.getDemandesNonLues.mockResolvedValue([demande]);
    mockDialyseService.getPatientByExternalId.mockResolvedValue(null);
    mockDialyseService.createPatient.mockResolvedValue({ id: 'dialyse-patient-1' });
    mockDialyseService.findDemandesAvis.mockResolvedValue([]);
    mockDialyseService.createDemandeAvis.mockResolvedValue({ id: 'dialyse-demande-1' });

    await service.envoyerNotifications();

    expect(mockDialyseService.getPatientByExternalId).toHaveBeenCalledWith('patient-123');
    expect(mockDialyseService.createPatient).toHaveBeenCalledWith(
      expect.objectContaining({ external_patient_id: 'patient-123' }),
    );
    expect(mockDialyseService.findDemandesAvis).toHaveBeenCalledWith('dialyse-patient-1', 'Suspicion de complication rénale');
    expect(mockDialyseService.createDemandeAvis).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: 'dialyse-patient-1',
        description_cas: 'Suspicion de complication rénale',
      }),
    );
  });
});
