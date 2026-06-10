import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Dossier Patient API')
    .setDescription(`
      API de gestion des dossiers patients et prescriptions médicales.
      
      ## Fonctionnalités principales
      - Gestion des patients
      - Observations médicales
      - Diagnostics
      - Suivi médical
      - Demandes d'avis
      - Comptes rendus opératoires
      - Historique médical
      - Résultats paracliniques
      - Sorties hospitalières
      - Prescriptions médicales (médicaments, laboratoire, imagerie, dialyse, endoscopie, etc.)
      - Notifications et intégrations externes
      - Planning des médicaments
      
      ## Authentification
      Non implémentée actuellement (endpoint publics)
      
      ## Variables d'environnement requises
      - DATABASE_URL: URL de connexion PostgreSQL
      - PHARMACY_API_URL: URL de l'API pharmacie (optionnel)
      - LABO_API_URL: URL de l'API laboratoire (optionnel)
      - IMAGERIE_API_URL: URL de l'API imagerie (optionnel)
      - DIALYSE_API_URL: URL de l'API dialyse (optionnel)
      - ENDOSCOPIE_API_URL: URL de l'API endoscopie (optionnel)
      - RENDER_WEBHOOK_URL: URL du webhook Render pour notifications (optionnel)
    `)
    .setVersion('1.0')
    .addTag('Patients', 'Gestion des patients')
    .addTag('Observations', 'Observations médicales')
    .addTag('Diagnostics', 'Diagnostics médicaux')
    .addTag('Suivi', 'Suivi médical')
    .addTag('Demandes d\'avis', 'Demandes d\'avis médicaux')
    .addTag('Comptes rendus opératoires', 'Comptes rendus opératoires')
    .addTag('Historique', 'Historique médical')
    .addTag('Résultats paracliniques', 'Résultats d\'examens paracliniques')
    .addTag('Sorties', 'Sorties hospitalières')
    .addTag('Prescriptions Médicales', 'Prescriptions de médicaments')
    .addTag('Prescriptions Labo', 'Prescriptions de laboratoire')
    .addTag('Prescriptions Imagerie', 'Prescriptions d\'imagerie')
    .addTag('Prescriptions Non-Médicales', 'Prescriptions non médicales')
    .addTag('Prescriptions Surveillance', 'Prescriptions de surveillance')
    .addTag('Prescriptions Transfusion', 'Prescriptions de transfusion')
    .addTag('Prescriptions Bloc', 'Prescriptions de bloc opératoire')
    .addTag('Prescriptions Anapath', 'Prescriptions d\'anatomopathologie')
    .addTag('Prescriptions EEG', 'Prescriptions EEG')
    .addTag('Prescriptions Kinésithérapie', 'Prescriptions de kinésithérapie')
    .addTag('Prescriptions Dialyse', 'Prescriptions de dialyse')
    .addTag('Prescriptions Endoscopie', 'Prescriptions d\'endoscopie')
    .addTag('Planning', 'Planning des prises médicamenteuses')
    .addTag('Notifications', 'Gestion des notifications')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
