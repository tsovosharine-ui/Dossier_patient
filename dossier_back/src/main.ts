import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Dossier Patient API')
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
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
