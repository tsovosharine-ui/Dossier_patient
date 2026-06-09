"use client";
import { useState } from "react";
import { creerPrescriptionEEG } from '@/lib/prescriptionApi';

type Urgence = "n" | "u" | "tu";
const urgenceClasses: Record<Urgence, string> = { n: "un", u: "uu", tu: "utu" };

const EEG_TYPES = [
  "EEG standard de repos (20–30 min)",
  "EEG avec privation de sommeil",
  "EEG de sommeil",
  "Holter EEG ambulatoire (24–72h)",
  "EEG vidéo (Vidéo-EEG)",
  "EEG per-opératoire",
];

interface Props { patient: { 
    id: string; 
    nom?: string; 
    prenom?: string;
    sexe?: string;
    dateNaissance?: string;
    allergies?: string[];
    groupeSanguin?: string;
  }; prescripteur: { id?: string; nom?: string; prenom?: string; service?: string }; }

function calcAge(dateNaissance?: string): number | null {
  if (!dateNaissance) return null;
  const diff = Date.now() - new Date(dateNaissance).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

interface ValidatedPrescription {
  urgence: Urgence;
  alertes: string;
  renseignements: string;
  typeEEG: string;
  remarques: string;
  patient: Props["patient"] & { age: number | null; sexeLabel?: string };
  prescripteur: Props["prescripteur"];
  date: string;
}

export default function EEGForm({ patient, prescripteur }: Props) {
  const [urgence, setUrgence] = useState<Urgence>("n");
  const [alertes, setAlertes] = useState("");
  const [renseignements, setRenseignements] = useState("");
  const [typeEEG, setEegType] = useState("");
  const [remarques, setRemarques] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validatedPrescription, setValidatedPrescription] = useState<ValidatedPrescription | null>(null);

  const age = calcAge(patient?.dateNaissance);
  const sexeLabel = patient?.sexe === 'M' ? 'Masculin' : patient?.sexe === 'F' ? 'Féminin' : patient?.sexe;

  const isFormValid = !!renseignements.trim() && !!typeEEG;
  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2800); }


  async function handleSubmit() {
    setShowModal(false); setLoading(true); setApiError("");
    try {
      await creerPrescriptionEEG({ patientId: patient.id, prescripteurId: prescripteur.id, urgence, alertes, renseignements, typeEEG, remarques });
      setValidatedPrescription({
        urgence,
        alertes,
        renseignements,
        typeEEG,
        remarques,
        patient: {
          ...patient,
          age,
          sexeLabel,
        },
        prescripteur,
        date: new Date().toLocaleString('fr-FR'),
      });
      setShowValidationModal(true);
      showToast("Demande EEG transmise"); setUrgence("n"); setAlertes(""); setRenseignements(""); setEegType(""); setRemarques("");
    } catch { setApiError("Erreur lors de l'envoi."); }
    finally { setLoading(false); }
  }

  return (
    <div>
      {apiError && <div style={{background:"var(--red-lt)",border:"1px solid var(--red-bdr)",borderRadius:8,padding:"10px 12px",fontSize:12,color:"var(--red)",marginBottom:12}}>{apiError}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: 12 }}><label className="lbl">Renseignements cliniques <span className="req">*</span></label><textarea rows={3} value={renseignements} onChange={e => setRenseignements(e.target.value)} placeholder="Contexte neurologique..." /></div>
          <div className="card" style={{ padding: 12 }}><label className="lbl">Protocole technique (type d&apos;EEG) <span className="req">*</span></label><div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>{EEG_TYPES.map(t => <label key={t} className="rc"><input type="radio" name="eeg-type" checked={typeEEG===t} onChange={()=>setEegType(t)} style={{accentColor:"var(--navy)"}}/><span>{t}</span></label>)}</div></div>
        </div>
        <div style={{ position: 'sticky', top: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ padding: 8 }}><label className="lbl">Degré d&apos;urgence <span className="req">*</span></label><div className={`urgr ${urgenceClasses[urgence]}`} style={{ marginBottom:8 }}><div className="urgd" /><select className="urgs" value={urgence} onChange={e => setUrgence(e.target.value as Urgence)}><option value="n">Normal</option><option value="u">Urgent</option><option value="tu">STAT</option></select></div><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><span className="ms" style={{fontSize:16,color:"var(--red)"}}>warning</span><span className="lbl" style={{margin:0}}>Précautions &amp; Alertes</span></div><textarea rows={1} value={alertes} onChange={e => setAlertes(e.target.value)} placeholder="Précautions..." style={{background:"var(--red-lt)",border:"1.5px solid var(--red-bdr)",padding:'8px 12px'}} /></div>
          <div className="card" style={{ padding: 12 }}><label className="lbl">Remarques complémentaires</label><textarea rows={3} value={remarques} onChange={e => setRemarques(e.target.value)} placeholder="Informations supplémentaires..." /></div>
          <button className="bp" onClick={() => setShowModal(true)} style={{ opacity: isFormValid && !loading ? 1 : 0.5, pointerEvents: isFormValid && !loading ? "auto" : "none", marginTop:0 }}><span className="ms">check_circle</span>{loading ? "Envoi..." : "Valider la prescription"}</button>
        </div>
      </div>
      {showModal && <div className="mb op" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}><div className="mbox"><h3>Confirmer ?</h3><p>La demande EEG sera transmise au service.</p><div className="mbtns"><button className="bca" onClick={()=>setShowModal(false)}>Annuler</button><button className="bok" onClick={handleSubmit}>Confirmer</button></div></div></div>}

      {showValidationModal && validatedPrescription && (
        <div className="mb op" onClick={e => { if (e.target === e.currentTarget) setShowValidationModal(false); }}>
          <div className="mbox" style={{ maxWidth: 600, width: '95%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ background: 'var(--navy)', color: '#fff', padding: '16px 20px', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="ms" style={{ fontSize: 24 }}>check_circle</span>
              <div>
                <h3 style={{ fontFamily: '"Manrope", sans-serif', fontSize: 18, fontWeight: 800, margin: 0 }}>Demande EEG validée</h3>
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

              {/* Exam Details */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt3)', marginBottom: 12 }}>Détails de l&apos;examen</div>
                <div style={{ background: '#fff', border: '1px solid var(--bdr)', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--txt)', marginBottom: 4 }}>Renseignements cliniques</div>
                  <div style={{ fontSize: 12, color: 'var(--txt2)' }}>{validatedPrescription.renseignements}</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid var(--bdr)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--navy-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="ms" style={{ fontSize: 18, color: 'var(--navy)' }}>monitor_heart</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--txt)', marginBottom: 4 }}>Type d&apos;EEG</div>
                    <div style={{ fontSize: 12, color: 'var(--txt2)' }}>{validatedPrescription.typeEEG}</div>
                  </div>
                </div>
              </div>

              {/* Urgence */}
              <div style={{ background: validatedPrescription.urgence === 'n' ? '#dcfce7' : validatedPrescription.urgence === 'u' ? '#fef3c7' : '#fee2e2', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: validatedPrescription.urgence === 'n' ? '#166534' : validatedPrescription.urgence === 'u' ? '#92400e' : '#991b1b', marginBottom: 4 }}>Degré d&apos;urgence</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: validatedPrescription.urgence === 'n' ? '#166534' : validatedPrescription.urgence === 'u' ? '#92400e' : '#991b1b' }}>{validatedPrescription.urgence === 'n' ? 'Normal' : validatedPrescription.urgence === 'u' ? 'Urgent' : 'STAT'}</div>
              </div>

              {/* Alertes */}
              {validatedPrescription.alertes && (
                <div style={{ background: 'var(--red-lt)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--red)', marginBottom: 4 }}>Alertes</div>
                  <div style={{ fontSize: 13, color: 'var(--txt)' }}>{validatedPrescription.alertes}</div>
                </div>
              )}

              {/* Remarques */}
              {validatedPrescription.remarques && (
                <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--txt3)', marginBottom: 4 }}>Remarques</div>
                  <div style={{ fontSize: 13, color: 'var(--txt)' }}>{validatedPrescription.remarques}</div>
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
