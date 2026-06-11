import api from './api';

// ── CRÉATION ──────────────────────────────────────────────

export async function creerPrescriptionMedicale(data: any) {
  const { patientId, medicaments, remarques, notifierInfirmier, prescripteurId } = data;
  const response = await api.post(`/patients/${patientId}/prescriptions`, {
    type: 'medicament',
    contenu: JSON.stringify({ medicaments, remarques, notifierInfirmier }),
    prescripteur: prescripteurId,
    valide: true,
  });
  return response.data;
}

export async function creerPrescriptionNonMedicale(data: any) {
  const { patientId, items, notifierInfirmier, prescripteurId } = data;
  const response = await api.post(`/patients/${patientId}/prescriptions`, {
    type: 'non_medicament',
    contenu: JSON.stringify({ items, notifierInfirmier }),
    prescripteur: prescripteurId,
    valide: true,
  });
  return response.data;
}

export async function creerPrescriptionSurveillance(data: any) {
  const { patientId, parametres, notes, notifierInfirmier, prescripteurId } = data;
  const response = await api.post(`/patients/${patientId}/prescriptions`, {
    type: 'surveillance',
    contenu: JSON.stringify({ parametres, notes, notifierInfirmier }),
    prescripteur: prescripteurId,
    valide: true,
  });
  return response.data;
}

export async function creerPrescriptionTransfusion(data: any) {
  const { patientId, renseignements, groupage, hb, produit, quantite, datePrevue, notes, urgence, alertes, atcdTransfusion, incident, prescripteurId } = data;
  const response = await api.post(`/patients/${patientId}/prescriptions`, {
    type: 'transfusion',
    contenu: JSON.stringify({ renseignements, groupage, hb, produit, quantite, datePrevue, notes, urgence, alertes, atcdTransfusion, incident }),
    prescripteur: prescripteurId,
    valide: true,
  });
  return response.data;
}

export async function creerPrescriptionBloc(data: any) {
  const { patientId, libelle, renseignements, urgence, alertes, risqueHemorragique, chirurgien, consignes, prescripteurId } = data;
  const response = await api.post(`/patients/${patientId}/prescriptions`, {
    type: 'bloc',
    contenu: JSON.stringify({ libelle, renseignements, urgence, alertes, risqueHemorragique, chirurgien, consignes }),
    prescripteur: prescripteurId,
    valide: true,
  });
  return response.data;
}

export async function creerPrescriptionLabo(data: any) {
  const { patientId, analyses, renseignements, urgence, alertes, notes, prescripteurId } = data;
  const response = await api.post(`/patients/${patientId}/prescriptions`, {
    type: 'paraclinique',
    contenu: JSON.stringify({ analyses, renseignements, urgence, alertes, notes }),
    prescripteur: prescripteurId,
    valide: true,
  });
  return response.data;
}

export async function creerPrescriptionImagerie(data: any) {
  const { patientId, examens, renseignements, urgence, alertes, notes, prescripteurId } = data;
  const response = await api.post(`/patients/${patientId}/prescriptions`, {
    type: 'paraclinique',
    contenu: JSON.stringify({ examens, renseignements, urgence, alertes, notes }),
    prescripteur: prescripteurId,
    valide: true,
  });
  return response.data;
}

// ── LECTURE ───────────────────────────────────────────────

/**
 * Récupère toutes les prescriptions ACTIVE d'un patient par type
 * type: 'medicament' | 'non_medicament' | 'surveillance' | 'transfusion' | 'bloc' | 'paraclinique'
 */
export async function getPrescriptionsPatient(type: string, patientId: string): Promise<any[]> {
  try {
    const response = await api.get(`/patients/${patientId}/prescriptions/active`);
    const all: any[] = Array.isArray(response.data) ? response.data : [];

    // Normalise le type passé en paramètre
    const typeMap: Record<string, string> = {
      'medicale':     'medicament',
      'medicament':   'medicament',
      'non-medicale': 'non_medicament',
      'non_medicale': 'non_medicament',
      'non_medicament': 'non_medicament',
      'surveillance': 'surveillance',
      'transfusion':  'transfusion',
      'bloc':         'bloc',
      'paraclinique': 'paraclinique',
    };
    const normalizedType = typeMap[type] || type;

    // Filtre par type et parse le contenu JSON
    return all
      .filter(p => p.type === normalizedType)
      .map(p => {
        let parsed: any = {};
        try { parsed = JSON.parse(p.contenu || '{}'); } catch {}
        return {
          ...p,
          ...parsed,
          // Pour MedicaleForm : s'assurer que medicaments est un tableau
          medicaments: parsed.medicaments || [],
        };
      });
  } catch (err) {
    console.error('getPrescriptionsPatient error:', err);
    return [];
  }
}

// ── ACTIONS ───────────────────────────────────────────────

export async function terminerPrescription(id: string, patientId: string): Promise<any> {
  const response = await api.patch(`/patients/${patientId}/prescriptions/${id}/validate`);
  return response.data;
}

export async function supprimerPrescription(id: string, patientId: string): Promise<void> {
  await api.delete(`/patients/${patientId}/prescriptions/${id}`);
}

export async function creerPrescriptionAnapath(data: any) {
  const { patientId, typeExamen, urgence, alertes, prescripteurId, ...rest } = data;
  const response = await api.post(`/patients/${patientId}/prescriptions`, {
    type: 'paraclinique',
    contenu: JSON.stringify({ typeExamen, urgence, alertes, ...rest }),
    prescripteur: prescripteurId,
    valide: true,
  });
  return response.data;
}

export async function creerPrescriptionEEG(data: any) {
  const { patientId, renseignements, typeEEG, remarques, urgence, alertes, prescripteurId } = data;
  const response = await api.post(`/patients/${patientId}/prescriptions`, {
    type: 'paraclinique',
    contenu: JSON.stringify({ renseignements, typeEEG, remarques, urgence, alertes }),
    prescripteur: prescripteurId,
    valide: true,
  });
  return response.data;
}

export async function creerPrescriptionKine(data: any) {
  const { patientId, seances, objectifs, notes, urgence, prescripteurId } = data;
  const response = await api.post(`/patients/${patientId}/prescriptions`, {
    type: 'paraclinique',
    contenu: JSON.stringify({ seances, objectifs, notes, urgence }),
    prescripteur: prescripteurId,
    valide: true,
  });
  return response.data;
}

export async function creerPrescriptionDialyse(data: any) {
  const { patientId, type: typeDialyse, seances, notes, urgence, prescripteurId } = data;
  const response = await api.post(`/patients/${patientId}/prescriptions`, {
    type: 'paraclinique',
    contenu: JSON.stringify({ typeDialyse, seances, notes, urgence }),
    prescripteur: prescripteurId,
    valide: true,
  });
  return response.data;
}

export async function creerPrescriptionEndoscopie(data: any) {
  const { patientId, typeExamen, renseignements, urgence, alertes, prescripteurId } = data;
  const response = await api.post(`/patients/${patientId}/prescriptions`, {
    type: 'paraclinique',
    contenu: JSON.stringify({ typeExamen, renseignements, urgence, alertes }),
    prescripteur: prescripteurId,
    valide: true,
  });
  return response.data;
}

export async function getPrescriptionsActivesByType(type: string, patientId: string): Promise<any[]> {
  return getPrescriptionsPatient(type, patientId);
}

// ── PHARMACIE API ───────────────────────────────────────────────

export async function searchMedicaments(query: string): Promise<any[]> {
  try {
    const response = await api.get(`/prescriptions/medicale/search?q=${encodeURIComponent(query)}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error('searchMedicaments error:', err);
    return [];
  }
}

export async function checkStock(articleId: string): Promise<any[]> {
  try {
    const response = await api.get(`/prescriptions/medicale/stock/${articleId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error('checkStock error:', err);
    return [];
  }
}
