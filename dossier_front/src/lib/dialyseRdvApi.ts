const API_URL = process.env.NEXT_PUBLIC_DIALYSE_API_URL || 'http://localhost:3001';

export async function fetchRendezVousDialyse() {
  const res = await fetch(`${API_URL}/rendezvous`);
  if (!res.ok) throw new Error('Erreur récupération RDV dialyse');
  return res.json();
}

export async function findPatientInDialyse(nom: string, prenom: string) {
  if (!nom) return null;
  const res = await fetch(`${API_URL}/patients?search=${encodeURIComponent(nom)}`);
  if (!res.ok) return null;
  const data = await res.json();
  const list = data.data || data || [];
  // Recherche match exact ou partiel
  const p = list.find((pt: any) => pt.nom.toLowerCase() === nom.toLowerCase() && pt.prenom.toLowerCase() === prenom.toLowerCase());
  return p ? p.id : (list.length > 0 ? list[0].id : null);
}

export async function createPatientInDialyse(patient: any) {
  const res = await fetch(`${API_URL}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nom: patient.nom || 'Inconnu',
      prenom: patient.prenom || 'Inconnu',
      dateNaissance: patient.dateNaissance || '1970-01-01',
      sexe: patient.sexe,
    })
  });
  if (!res.ok) throw new Error('Erreur création patient Dialyse');
  const created = await res.json();
  return created.id;
}

export async function getOrCreatePatientInDialyse(patient: any) {
  let id = await findPatientInDialyse(patient.nom, patient.prenom);
  if (id) return id;
  return await createPatientInDialyse(patient);
}

export async function creerRendezVousDialyse(data: any) {
  const res = await fetch(`${API_URL}/rendezvous/creer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur création RDV dialyse');
  return res.json();
}
