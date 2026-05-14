export class CreateDiagnosticDto {
  diagnosticPrincipal?: string;
  diagnosticsSecondaires?: string;
  justificationClinique?: string;
  diagnosticsDifferentiels?: string;
  graviteStade?: string;
  isActive?: boolean;
  medecinResponsable?: string;
}
