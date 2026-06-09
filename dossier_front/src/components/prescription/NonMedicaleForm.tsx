'use client';

import { useState, useEffect } from 'react';
import { creerPrescriptionNonMedicale, getPrescriptionsPatient, terminerPrescription as apiTerminerPrescription } from '@/lib/prescriptionApi';

interface NMItem {
  id: string;
  type: string;
  typeLabel: string;
  description: string;
  dureeJours: number;
  frequenceType: string;
  frequenceValeur: number;
  dateDebut: string;
  heureDebut: string;
  instructions: string;
}

interface PrescriptionNonMedEnCours {
  statut?: string;
  id: string;
  items: { typeLabel: string; description: string; duree?: string; frequence?: string; dateDebut?: string }[];
  notifierInfirmier?: boolean;
  prescripteur?: { nom: string };
}

const TYPE_OPTIONS = [
  { value: 'regime', label: 'Régime alimentaire' },
  { value: 'mobilisation', label: 'Mobilisation / Positionnement' },
  { value: 'nursing', label: 'Soins infirmiers / Nursing' },
  { value: 'hygiene', label: 'Hygiène' },
  { value: 'contention', label: 'Contention / Attelle' },
  { value: 'autre', label: 'Autre' },
];

const TYPE_ICON: Record<string, string> = {
  regime: 'restaurant', mobilisation: 'accessibility_new', nursing: 'health_and_safety',
  hygiene: 'soap', contention: 'back_hand', autre: 'more_horiz',
};

interface Props {
  patient: { 
    id: string; 
    nom?: string; 
    prenom?: string;
    sexe?: string;
    dateNaissance?: string;
    allergies?: string[];
    groupeSanguin?: string;
  };
  prescripteur: { id?: string; nom?: string; prenom?: string; service?: string };
}

function calcAge(dateNaissance?: string): number | null {
  if (!dateNaissance) return null;
  const diff = Date.now() - new Date(dateNaissance).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

interface ValidatedPrescription {
  items: NMItem[];
  notifier: boolean;
  patient: Props["patient"] & { age: number | null; sexeLabel?: string };
  prescripteur: Props["prescripteur"];
  date: string;
}

function parseDureeMs(d: string): number {
  const parts = d.split(' ');
  if (parts.length !== 2) return 0;
  const val = Number(parts[0]);
  const unit = parts[1];
  if (isNaN(val)) return 0;
  switch (unit) {
    case 'heures': return val * 3600_000;
    case 'jours':  return val * 86400_000;
    case 'mois':   return val * 30 * 86400_000;
    default: return 0;
  }
}

function filterExpired(prescriptions: PrescriptionNonMedEnCours[]): PrescriptionNonMedEnCours[] {
  const now = Date.now();
  return prescriptions.filter(p => {
    if (p.statut !== 'ACTIVE') return false;
    return p.items?.some(item => {
      if (!item.dateDebut || !item.duree) return true;
      const start = new Date(item.dateDebut).getTime();
      return (start + parseDureeMs(item.duree)) > now;
    });
  });
}

export default function NonMedicaleForm({ patient, prescripteur }: Props) {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [dureeJours, setDureeJours] = useState<number>(0);
  const [frequenceType, setFrequenceType] = useState('');
  const [frequenceValeur, setFrequenceValeur] = useState<number>(0);
  const [dateDebut, setDateDebut] = useState('');
  const [heureDebut, setHeureDebut] = useState('');
  const [instructions, setInstructions] = useState('');
  const [items, setItems] = useState<NMItem[]>([]);
  const [notifOn, setNotifOn] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [prescriptionsEnCours, setPrescriptionsEnCours] = useState<PrescriptionNonMedEnCours[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validatedPrescription, setValidatedPrescription] = useState<ValidatedPrescription | null>(null);

  const age = calcAge(patient?.dateNaissance);
  const sexeLabel = patient?.sexe === 'M' ? 'Masculin' : patient?.sexe === 'F' ? 'Féminin' : patient?.sexe;

  const canValidate = items.length > 0;
  const isAddValid = type && description.trim() && dureeJours > 0 && (frequenceType === 'SOS' || frequenceType === 'CONTINU' || frequenceValeur > 0);


  useEffect(() => {
    async function fetchPrescriptions() {
      try {
        const data = await getPrescriptionsPatient('non-medicale', patient.id);
        setPrescriptionsEnCours(filterExpired(data));
      } catch {}
    }
    fetchPrescriptions();
  }, [patient.id]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2800); }

  function validateAddForm(): boolean {
    const newErrors: Record<string, string> = {};
    if (!type) newErrors.type = 'Le type est requis';
    if (!description.trim()) newErrors.description = 'La description est requise';
    if (dureeJours <= 0) newErrors.dureeJours = 'La durée en jours est requise';
    if (!frequenceType) newErrors.frequenceType = 'Le type de fréquence est requis';
    if ((frequenceType === 'HEURES' || frequenceType === 'PAR_JOUR') && frequenceValeur <= 0) {
      newErrors.frequenceValeur = 'La valeur de fréquence est requise';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleAdd() {
    if (!validateAddForm()) return;
    const typeLabel = TYPE_OPTIONS.find(o => o.value === type)?.label ?? type;
    setItems(prev => [...prev, {
      id: Date.now().toString(), type, typeLabel,
      description: description.trim(), dureeJours, frequenceType, frequenceValeur,
      dateDebut, heureDebut, instructions: instructions.trim(),
    }]);
    setType(''); setDescription(''); setDureeJours(0); setFrequenceType(''); setFrequenceValeur(0);
    setDateDebut(''); setHeureDebut(''); setInstructions(''); setErrors({});
  }

  function handleDelete(id: string) { setItems(prev => prev.filter(i => i.id !== id)); }

  async function refreshPrescriptions() {
    try {
      const data = await getPrescriptionsPatient('non-medicale', patient.id);
      setPrescriptionsEnCours(filterExpired(data));
    } catch {}
  }

  async function terminerPrescription(id: string) {
    try {
      await apiTerminerPrescription(id, patient.id);
      await refreshPrescriptions();
    } catch { console.error('Erreur terminaison'); }
  }

  function getFrequenceText(type: string, valeur: number): string {
    switch (type) {
      case 'HEURES': return `Toutes les ${valeur}h`;
      case 'PAR_JOUR': return `${valeur}× par jour`;
      case 'SOS': return 'Si besoin (SOS)';
      case 'CONTINU': return 'En continu';
      default: return type;
    }
  }


  async function handleValidate() {
    setShowModal(false);
    setLoading(true);
    setApiError('');
    try {
      const result = await creerPrescriptionNonMedicale({
        patientId: patient.id,
        prescripteurId: prescripteur.id,
        notifierInfirmier: notifOn,
        items: items.map(item => ({
          type: item.type, typeLabel: item.typeLabel, description: item.description, dureeJours: item.dureeJours, frequenceType: item.frequenceType, frequenceValeur: item.frequenceValeur, dateDebut: item.dateDebut ? new Date(item.dateDebut) : undefined, heureDebut: item.heureDebut || undefined, instructions: item.instructions
        })),
      });
      if (notifOn && result?.id) {
      }
      setValidatedPrescription({
        items: [...items],
        notifier: notifOn,
        patient: {
          ...patient,
          age,
          sexeLabel,
        },
        prescripteur,
        date: new Date().toLocaleString('fr-FR'),
      });
      setShowValidationModal(true);
      showToast('Prescription non médicamenteuse validée');
      setItems([]);
      setNotifOn(false);
      setInstructions('');
      await refreshPrescriptions();
    } catch {
      setApiError("Erreur lors de l'envoi. Vérifiez la connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
      {apiError && (
        <div style={{ gridColumn: '1 / -1', background: "var(--red-lt)", border: "1px solid var(--red-bdr)", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "var(--red)" }}>
          {apiError}
        </div>
      )}

      {/* COLONNE GAUCHE */}
      <div>
        <div className="card mb12" style={{ padding: 12 }}>
          <div className="mb12">
            <label className="lbl">Type de prescription <span className="req">*</span></label>
            <select value={type} onChange={e => { setType(e.target.value); if (errors.type) setErrors({...errors, type: ''}); }} style={errors.type ? { borderColor: 'var(--red)' } : {}}>
              <option value="">Sélectionner un type</option>
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.type && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>{errors.type}</div>}
          </div>
          <div className="mb12">
            <label className="lbl">Description précise <span className="req">*</span></label>
            <input type="text" placeholder="Ex : Régime sans sel strict..." value={description} onChange={e => { setDescription(e.target.value); if (errors.description) setErrors({...errors, description: ''}); }} style={errors.description ? { borderColor: 'var(--red)' } : {}} />
            {errors.description && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>{errors.description}</div>}
          </div>
          <div className="g2 mb12">
            <div>
              <label className="lbl">Type de fréquence <span className="req">*</span></label>
              <select value={frequenceType} onChange={e => { setFrequenceType(e.target.value); if (errors.frequenceType) setErrors({...errors, frequenceType: ''}); }} style={errors.frequenceType ? { borderColor: 'var(--red)' } : {}}>
                <option value="">Sélectionner</option>
                <option value="HEURES">Toutes les X heures</option>
                <option value="PAR_JOUR">X fois par jour</option>
                <option value="SOS">Si besoin (SOS)</option>
                <option value="CONTINU">En continu</option>
              </select>
              {errors.frequenceType && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>{errors.frequenceType}</div>}
            </div>
            <div>
              <label className="lbl">Durée (jours) <span className="req">*</span></label>
              <input type="number" min={1} value={dureeJours || ''} onChange={e => { setDureeJours(parseInt(e.target.value) || 0); if (errors.dureeJours) setErrors({...errors, dureeJours: ''}); }} placeholder="Ex : 7" style={errors.dureeJours ? { borderColor: 'var(--red)' } : {}} />
              {errors.dureeJours && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>{errors.dureeJours}</div>}
            </div>
          </div>
          {(frequenceType === 'HEURES' || frequenceType === 'PAR_JOUR') && (
            <div className="mb12">
              <label className="lbl">Valeur <span className="req">*</span></label>
              <input type="number" min={1} value={frequenceValeur || ''} onChange={e => { setFrequenceValeur(parseInt(e.target.value) || 0); if (errors.frequenceValeur) setErrors({...errors, frequenceValeur: ''}); }} placeholder={frequenceType === 'HEURES' ? 'Ex : 8 (pour toutes les 8h)' : 'Ex : 3 (pour 3 fois par jour)'} style={errors.frequenceValeur ? { borderColor: 'var(--red)' } : {}} />
              {errors.frequenceValeur && <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>{errors.frequenceValeur}</div>}
            </div>
          )}
          <div className="g2 mb12">
            <div><label className="lbl">Date de début</label><input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} /></div>
            <div><label className="lbl">Heure de début</label><input type="time" value={heureDebut} onChange={e => setHeureDebut(e.target.value)} /></div>
          </div>
          <button className="badd" onClick={handleAdd} style={{ opacity: isAddValid ? 1 : 0.5 }}>
            <span className="ms" style={{ fontSize: 17 }}>add</span> Ajouter
          </button>
        </div>
        <div className="sh mb12">Prescriptions non médicamenteuses ajoutées</div>
        <div className="mb12">
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--txt3)', fontSize: 13 }}>Aucune prescription ajoutée</div>
          ) : items.map(item => (
            <div key={item.id} className="rxi">
              <div className="rxi-ic"><span className="ms">{TYPE_ICON[item.type] ?? 'self_care'}</span></div>
              <div className="rxi-m">
                <h4>{item.typeLabel}</h4><p>{item.description}</p>
                {item.dureeJours && <p style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 3 }}>{item.dureeJours} jours{item.frequenceType ? ` · ${getFrequenceText(item.frequenceType, item.frequenceValeur)}` : ''}</p>}
                {(item.dateDebut || item.heureDebut) && <p style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{item.dateDebut && `Début : ${item.dateDebut}`}{item.heureDebut && ` à ${item.heureDebut}`}</p>}
                {item.instructions && <p style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{item.instructions}</p>}
              </div>
              <button className="bdel" onClick={() => handleDelete(item.id)}><span className="ms">delete</span></button>
            </div>
          ))}
        </div>
      </div>

      {/* COLONNE DROITE — sticky */}
      <div style={{ position: 'sticky', top: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="active-rx">
          <div className="active-rx-header"><span className="ms">pending_actions</span><span>Prescriptions en cours</span></div>
          {prescriptionsEnCours.length > 0 ? prescriptionsEnCours.map(p => (
            <div key={p.id} style={{ position: 'relative' }}>
              {p.items?.map((item, idx) => (
                <div key={`${p.id}-${idx}`} className="active-rx-item">
                  <strong>{item.typeLabel}</strong>
                  <span> — {item.description}{item.duree ? ` (${item.duree})` : ''}{item.frequence ? ` · ${item.frequence}` : ''}{p.prescripteur?.nom ? ` · Dr ${p.prescripteur.nom}` : ''}</span>
                  {p.notifierInfirmier && <span style={{ display: 'block', fontSize: 10, color: 'var(--navy)', marginTop: 2 }}>Infirmier notifié</span>}
                </div>
              ))}
              <button
                onClick={() => terminerPrescription(p.id)}
                title="Terminer cette prescription"
                style={{
                  position: 'absolute',
                  right: 4,
                  top: 4,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--txt3)',
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                <span className="ms">check_circle</span>
              </button>
            </div>
          )) : (
            <div className="active-rx-item"><span style={{ color: 'var(--txt3)' }}>Aucune prescription en cours</span></div>
          )}
        </div>

        <div className="card" style={{ padding: 12 }}>
          <label className="lbl">Instructions pour l&apos;équipe soignante</label>
          <textarea rows={4} placeholder="Précisions pour l'équipe..." value={instructions} onChange={e => setInstructions(e.target.value)} />
        </div>
        <div className="card" style={{ padding: 12 }}>
          <div className="togr">
            <div className="togr-l"><p>Notifier les infirmiers</p><span>Envoyer une notification au service</span></div>
            <label className="tog"><input type="checkbox" checked={notifOn} onChange={e => setNotifOn(e.target.checked)}/><span className="tog-t"></span></label>
          </div>
          {notifOn && <div className="hint"><span className="ms" style={{ fontSize: 13, verticalAlign: 'middle', color: 'var(--navy)' }}>notifications_active</span> Notification envoyée aux infirmiers de garde.</div>}
        </div>

        {!canValidate && (
          <div style={{ fontSize: 11, color: 'var(--red)', textAlign: 'center', marginTop: -8 }}>
            Ajoutez au moins un soin.
          </div>
        )}
        <button className="bp" onClick={() => setShowModal(true)}
          style={{ opacity: canValidate && !loading ? 1 : 0.5, pointerEvents: canValidate && !loading ? "auto" : "none" }}>
          <span className="ms">check_circle</span>{loading ? "Envoi..." : "Valider"}
        </button>
      </div>

      {showModal && (
        <div className="mb op" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="mbox">
            <h3>Valider — Non Médicamenteuse</h3>
            <p>La prescription sera validée et transmise.</p>
            <div className="mbtns">
              <button className="bca" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="bok" onClick={handleValidate}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {showValidationModal && validatedPrescription && (
        <div className="mb op" onClick={e => { if (e.target === e.currentTarget) setShowValidationModal(false); }}>
          <div className="mbox" style={{ maxWidth: 600, width: '95%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ background: 'var(--navy)', color: '#fff', padding: '16px 20px', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="ms" style={{ fontSize: 24 }}>check_circle</span>
              <div>
                <h3 style={{ fontFamily: '"Manrope", sans-serif', fontSize: 18, fontWeight: 800, margin: 0 }}>Prescription non médicamenteuse validée</h3>
                <p style={{ fontSize: 12, opacity: 0.9, margin: '4px 0 0 0' }}>{validatedPrescription.date}</p>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              {/* Patient Info */}
              <div style={{ background: 'var(--navy-lt)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="ms" style={{ fontSize: 22, color: '#fff' }}>person</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt3)', marginBottom: 2 }}>Patient</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{validatedPrescription.patient.prenom} {validatedPrescription.patient.nom}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'var(--txt2)' }}>
                  {validatedPrescription.patient.sexe && <span><strong>Sexe:</strong> {validatedPrescription.patient.sexe === 'M' ? 'Masculin' : validatedPrescription.patient.sexe === 'F' ? 'Féminin' : validatedPrescription.patient.sexe}</span>}
                  {validatedPrescription.patient.age && <span><strong>Âge:</strong> {validatedPrescription.patient.age} ans</span>}
                  {validatedPrescription.patient.groupeSanguin && <span><strong>Groupe sanguin:</strong> {validatedPrescription.patient.groupeSanguin}</span>}
                </div>
                {validatedPrescription.patient.allergies && validatedPrescription.patient.allergies.length > 0 && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 8, fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="ms" style={{ fontSize: 14 }}>warning</span>
                    <strong>Allergies:</strong> {validatedPrescription.patient.allergies.join(', ')}
                  </div>
                )}
              </div>

              {/* Prescriber Info */}
              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--txt2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="ms" style={{ fontSize: 22, color: '#fff' }}>medical_services</span>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt3)', marginBottom: 2 }}>Prescripteur</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--txt)' }}>Dr {validatedPrescription.prescripteur.prenom} {validatedPrescription.prescripteur.nom}</div>
                  <div style={{ fontSize: 12, color: 'var(--txt2)' }}>{validatedPrescription.prescripteur.service || 'Service non spécifié'}</div>
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt3)', marginBottom: 12 }}>Soins prescrits</div>
                {validatedPrescription.items.map((item: NMItem, idx: number) => (
                  <div key={idx} style={{ background: '#fff', border: '1px solid var(--bdr)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--navy-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="ms" style={{ fontSize: 18, color: 'var(--navy)' }}>{TYPE_ICON[item.type] || 'more_horiz'}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--txt)', marginBottom: 4 }}>{item.typeLabel}</div>
                      <div style={{ fontSize: 12, color: 'var(--txt2)', lineHeight: 1.5 }}>{item.description}</div>
                      <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 2 }}>Durée: <strong>{item.dureeJours} jours</strong>{item.frequenceType ? ` · ${getFrequenceText(item.frequenceType, item.frequenceValeur)}` : ''}</div>
                      {item.instructions && <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 4, fontStyle: 'italic' }}>{item.instructions}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Notification Status */}
              {validatedPrescription.notifier && (
                <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="ms" style={{ fontSize: 20, color: '#16a34a' }}>check_circle</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>Infirmiers notifiés</div>
                    <div style={{ fontSize: 11, color: '#15803d' }}>Notification envoyée au service clinique</div>
                  </div>
                </div>
              )}

              <div className="mbtns" style={{ marginTop: 20 }}>
                <button className="bok" onClick={() => setShowValidationModal(false)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="tst on"><span className="ms">check_circle</span>{toast}</div>}
    </div>
  );
}
