import api from './api';

// ── CRÉATION ──────────────────────────────────────────────

export async function creerPrescriptionMedicale(data: any) {
  const response = await api.post(`/prescriptions/medicale`, data);
  return response.data;
}

export async function creerPrescriptionNonMedicale(data: any) {
  const response = await api.post(`/prescriptions/non-medicale`, data);
  return response.data;
}

export async function creerPrescriptionSurveillance(data: any) {
  const response = await api.post(`/prescriptions/surveillance`, data);
  return response.data;
}

export async function creerPrescriptionTransfusion(data: any) {
  const response = await api.post(`/prescriptions/transfusion`, data);
  return response.data;
}

export async function creerPrescriptionBloc(data: any) {
  const response = await api.post(`/prescriptions/bloc`, data);
  return response.data;
}

export async function creerPrescriptionLabo(data: any) {
  const response = await api.post(`/prescriptions/labo`, data);
  return response.data;
}

export async function creerPrescriptionImagerie(data: any) {
  const response = await api.post(`/prescriptions/imagerie`, data);
  return response.data;
}

export async function creerPrescriptionAnapath(data: any) {
  const response = await api.post(`/prescriptions/anapath`, data);
  return response.data;
}

export async function creerPrescriptionEEG(data: any) {
  const response = await api.post(`/prescriptions/eeg`, data);
  return response.data;
}

export async function creerPrescriptionKine(data: any) {
  const response = await api.post(`/prescriptions/kine`, data);
  return response.data;
}

export async function creerPrescriptionDialyse(data: any) {
  const response = await api.post(`/prescriptions/dialyse`, data);
  return response.data;
}

export async function creerPrescriptionEndoscopie(data: any) {
  const response = await api.post(`/prescriptions/endoscopie`, data);
  return response.data;
}

// ── LECTURE ───────────────────────────────────────────────

/**
 * Récupère toutes les prescriptions ACTIVE d'un patient par type
 */
export async function getPrescriptionsPatient(type: string, patientId: string): Promise<any[]> {
  try {
    const typeMap: Record<string, string> = {
      'medicale':     'medicale',
      'medicament':   'medicale',
      'non-medicale': 'non-medicale',
      'non_medicale': 'non-medicale',
      'non_medicament': 'non-medicale',
      'surveillance': 'surveillance',
      'transfusion':  'transfusion',
      'bloc':         'bloc',
      'paraclinique': 'labo', // Defaulting to labo for generic paraclinique, though frontend specifies labo/imagerie etc now
      'labo':         'labo',
      'imagerie':     'imagerie',
      'anapath':      'anapath',
      'eeg':          'eeg',
      'kine':         'kine',
      'dialyse':      'dialyse',
      'endoscopie':   'endoscopie',
    };
    const normalizedType = typeMap[type] || type;

    // Call the specific endpoint
    const response = await api.get(`/prescriptions/${normalizedType}/patient/${patientId}`);
    const all: any[] = Array.isArray(response.data) ? response.data : [];

    // The backend `findByPatient` returns ALL prescriptions, so we filter by ACTIVE
    return all.filter(p => p.statut === 'ACTIVE' || p.statut === 'CREEE');
  } catch (err) {
    console.error('getPrescriptionsPatient error:', err);
    return [];
  }
}

export async function getPrescriptionsActivesByType(type: string, patientId: string): Promise<any[]> {
  return getPrescriptionsPatient(type, patientId);
}

// ── ACTIONS ───────────────────────────────────────────────

export async function terminerPrescription(type: string, id: string): Promise<any> {
  const typeMap: Record<string, string> = {
    'medicale':     'medicale',
    'medicament':   'medicale',
    'non-medicale': 'non-medicale',
    'surveillance': 'surveillance',
    'transfusion':  'transfusion',
    'bloc':         'bloc',
    'labo':         'labo',
    'imagerie':     'imagerie',
    'anapath':      'anapath',
    'eeg':          'eeg',
    'kine':         'kine',
    'dialyse':      'dialyse',
    'endoscopie':   'endoscopie',
  };
  const normalizedType = typeMap[type] || type;
  const response = await api.put(`/prescriptions/${normalizedType}/${id}/statut`, { statut: 'TERMINEE' });
  return response.data;
}

export async function supprimerPrescription(type: string, id: string): Promise<void> {
  // Not universally supported in the backend specifics, but kept for signature
  const normalizedType = type || 'medicale';
  await api.delete(`/prescriptions/${normalizedType}/${id}`);
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
