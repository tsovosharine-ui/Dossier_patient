export class CreatePrescriptionDto {
  patientId: string;
  type: string;
  contenu: string;
  prescripteur?: string;
  datePrescription?: Date;
  valide?: boolean;
}
