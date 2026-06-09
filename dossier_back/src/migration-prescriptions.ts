import { createConnection } from 'typeorm';
import { PrescriptionMedicale } from './prescription/entities/prescription-medicale.entity';
import { Medicament } from './prescription/entities/medicament.entity';
import { PrescriptionNonMedicale } from './prescription/entities/prescription-non-medicale.entity';
import { ItemNonMedical } from './prescription/entities/item-non-medical.entity';
import { PrescriptionSurveillance } from './prescription/entities/prescription-surveillance.entity';
import { ParametreSurveillance } from './prescription/entities/parametre-surveillance.entity';
import { PrescriptionTransfusion } from './prescription/entities/prescription-transfusion.entity';
import { PrescriptionBloc } from './prescription/entities/prescription-bloc.entity';
import { PrescriptionLabo } from './prescription/entities/prescription-labo.entity';
import { PrescriptionImagerie } from './prescription/entities/prescription-imagerie.entity';
import { PrescriptionAnapath } from './prescription/entities/prescription-anapath.entity';
import { PrescriptionEEG } from './prescription/entities/prescription-eeg.entity';
import { PrescriptionKine } from './prescription/entities/prescription-kine.entity';
import { PrescriptionDialyse } from './prescription/entities/prescription-dialyse.entity';
import { PrescriptionEndoscopie } from './prescription/entities/prescription-endoscopie.entity';
import { Ordonnance } from './prescription/entities/ordonnance.entity';

async function migratePrescriptions() {
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://dossier_user:dossier_pass@localhost:5432/chu_dossier',
    entities: [
      PrescriptionMedicale,
      Medicament,
      PrescriptionNonMedicale,
      ItemNonMedical,
      PrescriptionSurveillance,
      ParametreSurveillance,
      PrescriptionTransfusion,
      PrescriptionBloc,
      PrescriptionLabo,
      PrescriptionImagerie,
      PrescriptionAnapath,
      PrescriptionEEG,
      PrescriptionKine,
      PrescriptionDialyse,
      PrescriptionEndoscopie,
      Ordonnance,
    ],
    synchronize: false,
  });

  console.log('Migration des prescriptions...');

  // Récupérer les prescriptions de l'ancienne table
  const oldPrescriptions = await connection.query(`
    SELECT id, patient_id, type, contenu, prescripteur, datePrescription, statut, created_at, updated_at
    FROM prescriptions
  `);

  console.log(`${oldPrescriptions.length} prescriptions trouvées`);

  for (const oldPresc of oldPrescriptions) {
    let contenu: any = {};
    try {
      contenu = JSON.parse(oldPresc.contenu || '{}');
    } catch (e) {
      console.error(`Erreur parsing JSON pour prescription ${oldPresc.id}:`, e);
      continue;
    }

    const typeMap: Record<string, string> = {
      'medicament': 'medicale',
      'non_medicament': 'non-medicale',
      'surveillance': 'surveillance',
      'transfusion': 'transfusion',
      'paraclinique': 'labo',
      'bloc': 'bloc',
      'imagerie': 'imagerie',
      'eeg': 'eeg',
      'kine': 'kine',
      'dialyse': 'dialyse',
      'endoscopie': 'endoscopie',
      'anapath': 'anapath',
    };

    const normalizedType = typeMap[oldPresc.type] || oldPresc.type;

    try {
      switch (normalizedType) {
        case 'medicale':
          await migrateMedicale(connection, oldPresc, contenu);
          break;
        case 'non-medicale':
          await migrateNonMedicale(connection, oldPresc, contenu);
          break;
        case 'surveillance':
          await migrateSurveillance(connection, oldPresc, contenu);
          break;
        case 'transfusion':
          await migrateTransfusion(connection, oldPresc, contenu);
          break;
        case 'labo':
          await migrateLabo(connection, oldPresc, contenu);
          break;
        case 'imagerie':
          await migrateImagerie(connection, oldPresc, contenu);
          break;
        case 'anapath':
          await migrateAnapath(connection, oldPresc, contenu);
          break;
        case 'eeg':
          await migrateEEG(connection, oldPresc, contenu);
          break;
        case 'kine':
          await migrateKine(connection, oldPresc, contenu);
          break;
        case 'dialyse':
          await migrateDialyse(connection, oldPresc, contenu);
          break;
        case 'endoscopie':
          await migrateEndoscopie(connection, oldPresc, contenu);
          break;
        case 'bloc':
          await migrateBloc(connection, oldPresc, contenu);
          break;
        default:
          console.log(`Type non reconnu: ${normalizedType}`);
      }
    } catch (e) {
      console.error(`Erreur migration prescription ${oldPresc.id}:`, e);
    }
  }

  await connection.close();
  console.log('Migration terminée');
}

async function migrateMedicale(connection: any, oldPresc: any, contenu: any) {
  const prescription = connection.manager.create(PrescriptionMedicale, {
    id: oldPresc.id,
    patientId: oldPresc.patient_id,
    prescripteurId: oldPresc.prescripteur,
    datePrescription: oldPresc.datePrescription,
    statut: oldPresc.statut,
    remarques: contenu.remarques,
    notifierInfirmier: contenu.notifierInfirmier,
    createdAt: oldPresc.created_at,
    updatedAt: oldPresc.updated_at,
  });
  await connection.manager.save(prescription);

  if (contenu.medicaments && Array.isArray(contenu.medicaments)) {
    for (const med of contenu.medicaments) {
      const medicament = connection.manager.create(Medicament, {
        prescriptionId: oldPresc.id,
        nom: med.nom,
        dose: med.dose,
        quantite: med.quantite,
        voie: med.voie,
        frequence: med.frequence,
        duree: med.duree,
        dateDebut: med.dateDebut ? new Date(med.dateDebut) : undefined,
        heureDebut: med.heureDebut,
        instructions: med.instructions,
        remarques: med.remarques,
      });
      await connection.manager.save(medicament);
    }
  }
}

async function migrateNonMedicale(connection: any, oldPresc: any, contenu: any) {
  const prescription = connection.manager.create(PrescriptionNonMedicale, {
    id: oldPresc.id,
    patientId: oldPresc.patient_id,
    prescripteurId: oldPresc.prescripteur,
    datePrescription: oldPresc.datePrescription,
    statut: oldPresc.statut,
    remarques: contenu.remarques,
    notifierInfirmier: contenu.notifierInfirmier,
    createdAt: oldPresc.created_at,
    updatedAt: oldPresc.updated_at,
  });
  await connection.manager.save(prescription);

  if (contenu.items && Array.isArray(contenu.items)) {
    for (const item of contenu.items) {
      const itemNonMedical = connection.manager.create(ItemNonMedical, {
        prescriptionId: oldPresc.id,
        type: item.type,
        typeLabel: item.typeLabel,
        description: item.description,
        duree: item.duree,
        frequence: item.frequence,
        dateDebut: item.dateDebut ? new Date(item.dateDebut) : undefined,
        heureDebut: item.heureDebut,
        instructions: item.instructions,
      });
      await connection.manager.save(itemNonMedical);
    }
  }
}

async function migrateSurveillance(connection: any, oldPresc: any, contenu: any) {
  const prescription = connection.manager.create(PrescriptionSurveillance, {
    id: oldPresc.id,
    patientId: oldPresc.patient_id,
    prescripteurId: oldPresc.prescripteur,
    datePrescription: oldPresc.datePrescription,
    statut: oldPresc.statut,
    notes: contenu.notes,
    notifierInfirmier: contenu.notifierInfirmier,
    createdAt: oldPresc.created_at,
    updatedAt: oldPresc.updated_at,
  });
  await connection.manager.save(prescription);

  if (contenu.parametres && Array.isArray(contenu.parametres)) {
    for (const param of contenu.parametres) {
      const parametre = connection.manager.create(ParametreSurveillance, {
        prescriptionId: oldPresc.id,
        parametre: param.parametre,
        frequence: param.frequence,
        duree: param.duree,
        seuil: param.seuil,
      });
      await connection.manager.save(parametre);
    }
  }
}

async function migrateTransfusion(connection: any, oldPresc: any, contenu: any) {
  const prescription = connection.manager.create(PrescriptionTransfusion, {
    id: oldPresc.id,
    patientId: oldPresc.patient_id,
    prescripteurId: oldPresc.prescripteur,
    datePrescription: oldPresc.datePrescription,
    statut: oldPresc.statut,
    urgence: contenu.urgence,
    alertes: contenu.alertes,
    renseignements: contenu.renseignements,
    atcdTransfusion: contenu.atcdTransfusion,
    incident: contenu.incident,
    groupage: contenu.groupage,
    hb: contenu.hb,
    produit: contenu.produit,
    plaquettes: contenu.plaquettes,
    quantite: contenu.quantite,
    datePrevue: contenu.datePrevue ? new Date(contenu.datePrevue) : undefined,
    notes: contenu.notes,
    createdAt: oldPresc.created_at,
    updatedAt: oldPresc.updated_at,
  });
  await connection.manager.save(prescription);
}

async function migrateLabo(connection: any, oldPresc: any, contenu: any) {
  const prescription = connection.manager.create(PrescriptionLabo, {
    id: oldPresc.id,
    patientId: oldPresc.patient_id,
    prescripteurId: oldPresc.prescripteur,
    datePrescription: oldPresc.datePrescription,
    statut: oldPresc.statut,
    urgence: contenu.urgence,
    alertes: contenu.alertes,
    renseignements: contenu.renseignements,
    analyses: contenu.analyses,
    notes: contenu.notes,
    createdAt: oldPresc.created_at,
    updatedAt: oldPresc.updated_at,
  });
  await connection.manager.save(prescription);
}

async function migrateImagerie(connection: any, oldPresc: any, contenu: any) {
  const prescription = connection.manager.create(PrescriptionImagerie, {
    id: oldPresc.id,
    patientId: oldPresc.patient_id,
    prescripteurId: oldPresc.prescripteur,
    datePrescription: oldPresc.datePrescription,
    statut: oldPresc.statut,
    urgence: contenu.urgence,
    alertes: contenu.alertes,
    renseignements: contenu.renseignements,
    examens: contenu.examens,
    notes: contenu.notes,
    createdAt: oldPresc.created_at,
    updatedAt: oldPresc.updated_at,
  });
  await connection.manager.save(prescription);
}

async function migrateAnapath(connection: any, oldPresc: any, contenu: any) {
  const prescription = connection.manager.create(PrescriptionAnapath, {
    id: oldPresc.id,
    patientId: oldPresc.patient_id,
    prescripteurId: oldPresc.prescripteur,
    datePrescription: oldPresc.datePrescription,
    statut: oldPresc.statut,
    urgence: contenu.urgence,
    alertes: contenu.alertes,
    typeExamen: contenu.typeExamen,
    data: contenu.data,
    createdAt: oldPresc.created_at,
    updatedAt: oldPresc.updated_at,
  });
  await connection.manager.save(prescription);
}

async function migrateEEG(connection: any, oldPresc: any, contenu: any) {
  const prescription = connection.manager.create(PrescriptionEEG, {
    id: oldPresc.id,
    patientId: oldPresc.patient_id,
    prescripteurId: oldPresc.prescripteur,
    datePrescription: oldPresc.datePrescription,
    statut: oldPresc.statut,
    urgence: contenu.urgence,
    alertes: contenu.alertes,
    renseignements: contenu.renseignements,
    typeEEG: contenu.typeEEG,
    remarques: contenu.remarques,
    createdAt: oldPresc.created_at,
    updatedAt: oldPresc.updated_at,
  });
  await connection.manager.save(prescription);
}

async function migrateKine(connection: any, oldPresc: any, contenu: any) {
  const prescription = connection.manager.create(PrescriptionKine, {
    id: oldPresc.id,
    patientId: oldPresc.patient_id,
    prescripteurId: oldPresc.prescripteur,
    datePrescription: oldPresc.datePrescription,
    statut: oldPresc.statut,
    urgence: contenu.urgence,
    alertes: contenu.alertes,
    renseignements: contenu.renseignements,
    typeKine: contenu.typeKine,
    diagnostic: contenu.diagnostic,
    contreIndications: contenu.contreIndications,
    objectifs: contenu.objectifs,
    remarques: contenu.remarques,
    createdAt: oldPresc.created_at,
    updatedAt: oldPresc.updated_at,
  });
  await connection.manager.save(prescription);
}

async function migrateDialyse(connection: any, oldPresc: any, contenu: any) {
  const prescription = connection.manager.create(PrescriptionDialyse, {
    id: oldPresc.id,
    patientId: oldPresc.patient_id,
    prescripteurId: oldPresc.prescripteur,
    datePrescription: oldPresc.datePrescription,
    statut: oldPresc.statut,
    urgence: contenu.urgence,
    alertes: contenu.alertes,
    renseignements: contenu.renseignements,
    typeDialyse: contenu.typeDialyse,
    remarques: contenu.remarques,
    createdAt: oldPresc.created_at,
    updatedAt: oldPresc.updated_at,
  });
  await connection.manager.save(prescription);
}

async function migrateEndoscopie(connection: any, oldPresc: any, contenu: any) {
  const prescription = connection.manager.create(PrescriptionEndoscopie, {
    id: oldPresc.id,
    patientId: oldPresc.patient_id,
    prescripteurId: oldPresc.prescripteur,
    datePrescription: oldPresc.datePrescription,
    statut: oldPresc.statut,
    urgence: contenu.urgence,
    alertes: contenu.alertes,
    renseignements: contenu.renseignements,
    typeExamen: contenu.typeExamen,
    remarques: contenu.remarques,
    createdAt: oldPresc.created_at,
    updatedAt: oldPresc.updated_at,
  });
  await connection.manager.save(prescription);
}

async function migrateBloc(connection: any, oldPresc: any, contenu: any) {
  const prescription = connection.manager.create(PrescriptionBloc, {
    id: oldPresc.id,
    patientId: oldPresc.patient_id,
    prescripteurId: oldPresc.prescripteur,
    datePrescription: oldPresc.datePrescription,
    statut: oldPresc.statut,
    urgence: contenu.urgence,
    alertes: contenu.alertes,
    libelle: contenu.libelle,
    risqueHemorragique: contenu.risqueHemorragique,
    typeChirurgie: contenu.typeChirurgie,
    chirurgien: contenu.chirurgien,
    consignes: contenu.consignes,
    dateIntervention: contenu.dateIntervention ? new Date(contenu.dateIntervention) : undefined,
    createdAt: oldPresc.created_at,
    updatedAt: oldPresc.updated_at,
  });
  await connection.manager.save(prescription);
}

migratePrescriptions().catch(console.error);
