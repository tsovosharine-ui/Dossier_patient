'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Suivi {
  id: string;
  jourHospitalisation?: string;
  temperature?: number;
  taSystolique?: string;
  taDiastolique?: string;
  frequenceCardiaque?: string;
  frequenceRespiratoire?: string;
  evaDouleur?: number;
  etatGeneral?: string;
  examenClinique?: string;
  evolution?: string;
  signesAlerte?: boolean;
  auteur?: string;
  createdAt: string;
  spo2?: number;
  glycemieCapillaire?: number;
  scoreGlasgow?: number;
  poids?: number;
  diurese?: string;
  bilanHydrique?: string;
  examenNeurologique?: string;
  examensComplementaires?: string;
  actionsTraitements?: string;
}

const emptyForm = {
  temperature: '',
  taSystolique: '',
  taDiastolique: '',
  frequenceCardiaque: '',
  frequenceRespiratoire: '',
  evaDouleur: 0,
  etatGeneral: 'Stable',
  examenClinique: '',
  evolution: '',
  signesAlerte: false,
  auteur: 'Dr. Jean Pierre',
  spo2: '',
  glycemieCapillaire: '',
  scoreGlasgow: '',
  poids: '',
  diurese: '',
  bilanHydrique: '',
  examenNeurologique: '',
  examensComplementaires: '',
  actionsTraitements: '',
};

const etatColors: Record<string, { bg: string; color: string; label: string }> = {
  Stable:   { bg: '#dcfce7', color: '#16a34a', label: 'ÉTAT: STABLE' },
  Amélioré: { bg: '#fef9c3', color: '#ca8a04', label: 'ÉTAT: AMÉLIORÉ' },
  Aggravé:  { bg: '#fee2e2', color: '#dc2626', label: 'ÉTAT: AGGRAVÉ' },
  Critique: { bg: '#fee2e2', color: '#dc2626', label: 'ÉTAT: CRITIQUE' },
  Guéri:    { bg: '#dcfce7', color: '#16a34a', label: 'ÉTAT: GUÉRI' },
};

function getEvaColor(eva?: number): string {
  if (!eva) return '#1e293b';
  if (eva >= 7) return '#ef4444';
  if (eva >= 4) return '#f97316';
  return '#1d4ed8';
}

function getTempColor(temp?: number): string {
  if (!temp) return '#1e293b';
  if (temp >= 38.5) return '#ef4444';
  if (temp >= 37.5) return '#f97316';
  return '#1e293b';
}

const IconClipboard = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
    <line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
);

const IconAlert = ({ size = 13, color = '#ef4444' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export function SuiviTab({ patientId }: { patientId: string }) {
  const [suivis, setSuivis] = useState<Suivi[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, [patientId]);

  const load = async () => {
    try {
      const res = await api.get(`/patients/${patientId}/suivis`);
      setSuivis(res.data);
    } catch { } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post(`/patients/${patientId}/suivis`, {
        ...form,
        temperature: form.temperature ? parseFloat(form.temperature) : undefined,
        spo2: form.spo2 ? parseInt(form.spo2) : undefined,
        glycemieCapillaire: form.glycemieCapillaire ? parseFloat(form.glycemieCapillaire) : undefined,
        scoreGlasgow: form.scoreGlasgow ? parseInt(form.scoreGlasgow) : undefined,
        poids: form.poids ? parseFloat(form.poids) : undefined,
        evaDouleur: parseInt(form.evaDouleur),
        jourHospitalisation: `J${suivis.length + 1}`,
      });
      setForm({ ...emptyForm });
      setShowForm(false);
      load();
    } finally { setSaving(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ display: 'flex', gap: '20px', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Colonne principale ── */}
      <div style={{ flex: 1 }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>

          {/* Header section */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1e293b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                01
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Suivi / Évolution</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px' }}>Suivi de l'épisode actuel</div>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                backgroundColor: '#1d4ed8', color: 'white',
                border: 'none', borderRadius: '8px',
                padding: '9px 16px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}
            >
              + Ajouter une observation
            </button>
          </div>

          {/* Corps */}
          <div style={{ padding: '20px 18px' }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>Chargement...</div>
            )}

            {!loading && suivis.length === 0 && (
              <div style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                  <IconClipboard />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', margin: 0 }}>Aucune observation de suivi</p>
                <p style={{ fontSize: '12px', marginTop: '6px', color: '#94a3b8' }}>Ajoutez la première observation ci-dessus</p>
              </div>
            )}

            {/* Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {suivis.map((s, index) => {
                const es = etatColors[s.etatGeneral || 'Stable'] || etatColors['Stable'];
                return (
                  <div key={s.id} style={{ display: 'flex', gap: '14px', paddingBottom: '24px', position: 'relative' }}>
                    {index < suivis.length - 1 && (
                      <div style={{ position: 'absolute', left: '9px', top: '22px', bottom: 0, width: '2px', backgroundColor: '#e2e8f0' }} />
                    )}
                    <div style={{ flexShrink: 0, marginTop: '3px' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        backgroundColor: index === 0 ? '#1d4ed8' : '#e2e8f0',
                        border: index === 0 ? '3px solid #bfdbfe' : '2px solid #cbd5e1',
                        position: 'relative', zIndex: 1,
                      }} />
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                            {formatDate(s.createdAt)} – {s.jourHospitalisation || `J${suivis.length - index}`}
                          </span>
                          <span style={{
                            fontSize: '10px', fontWeight: 700, padding: '3px 8px',
                            borderRadius: '20px', backgroundColor: es.bg, color: es.color,
                          }}>
                            {es.label}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Par {s.auteur || 'Médecin'} · {formatTime(s.createdAt)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {s.temperature && (
                          <Constante label="TEMP" value={`${s.temperature}°C`} color={getTempColor(s.temperature)} />
                        )}
                        {(s.taSystolique || s.taDiastolique) && (
                          <Constante label="TA" value={`${s.taSystolique}/${s.taDiastolique}`} />
                        )}
                        {s.frequenceCardiaque && (
                          <Constante label="FC" value={`${s.frequenceCardiaque} bpm`} />
                        )}
                        {s.frequenceRespiratoire && (
                          <Constante label="FR" value={`${s.frequenceRespiratoire} /min`} />
                        )}
                        {s.spo2 && (
                          <Constante label="SPO2" value={`${s.spo2}%`} />
                        )}
                        {s.glycemieCapillaire && (
                          <Constante label="GLYCÉMIE" value={`${s.glycemieCapillaire} g/l`} />
                        )}
                        {s.scoreGlasgow && (
                          <Constante label="GLASGOW" value={`${s.scoreGlasgow}/15`} />
                        )}
                        {s.poids && (
                          <Constante label="POIDS" value={`${s.poids} kg`} />
                        )}
                        {s.diurese && (
                          <Constante label="DIURÈSE" value={s.diurese} />
                        )}
                        {s.evaDouleur !== undefined && s.evaDouleur !== null && (
                          <Constante label="DOULEUR" value={`EVA ${s.evaDouleur}/10`} color={getEvaColor(s.evaDouleur)} />
                        )}
                      </div>
                      
                      {s.bilanHydrique && (
                        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                          <strong>Bilan hydrique :</strong> {s.bilanHydrique}
                        </div>
                      )}
                      {s.examenClinique && (
                        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                          <strong>Examen clinique :</strong> {s.examenClinique}
                        </div>
                      )}
                      {s.examenNeurologique && (
                        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                          <strong>Examen neurologique :</strong> {s.examenNeurologique}
                        </div>
                      )}
                      {s.examensComplementaires && (
                        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                          <strong>Examens complémentaires :</strong> {s.examensComplementaires}
                        </div>
                      )}
                      {s.actionsTraitements && (
                        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                          <strong>Actions & Traitements :</strong> {s.actionsTraitements}
                        </div>
                      )}
                      {s.evolution && (
                        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                          <strong>Évolution & Commentaires :</strong> {s.evolution}
                        </div>
                      )}
                      {s.signesAlerte && (
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>
                          <IconAlert size={13} color="#ef4444" />
                          Signes d'alerte détectés
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {suivis.length > 0 && (
              <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '4px' }}>
                Dernière mise à jour : {formatDate(suivis[0].createdAt)} {formatTime(suivis[0].createdAt)} – {suivis[0].auteur}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Panneau formulaire ── */}
      {showForm && (
        <div style={{ width: '380px', flexShrink: 0, height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Ajouter une observation</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Saisie quotidienne du dossier patient</div>
            </div>

            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}>
              
              {/* CONSTANTES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '4px' }}>CONSTANTES VITALES</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={labelStyle}>TEMPÉRATURE</label>
                    <input type="number" step="0.1" placeholder="°C" value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>SPO2</label>
                    <input type="number" placeholder="%" value={form.spo2} onChange={e => setForm({ ...form, spo2: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>TA (SYST/DIAST)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input type="text" placeholder="Syst." value={form.taSystolique} onChange={e => setForm({ ...form, taSystolique: e.target.value })} style={inputStyle} />
                    <input type="text" placeholder="Diast." value={form.taDiastolique} onChange={e => setForm({ ...form, taDiastolique: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={labelStyle}>FRÉQ. CARDIAQUE</label>
                    <input type="text" placeholder="bpm" value={form.frequenceCardiaque} onChange={e => setForm({ ...form, frequenceCardiaque: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>FRÉQ. RESP.</label>
                    <input type="text" placeholder="/min" value={form.frequenceRespiratoire} onChange={e => setForm({ ...form, frequenceRespiratoire: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>EVA DOULEUR (0-10)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="range" min="0" max="10" value={form.evaDouleur} onChange={e => setForm({ ...form, evaDouleur: parseInt(e.target.value) })} style={{ flex: 1, accentColor: '#1d4ed8' }} />
                    <span style={{ fontSize: '14px', fontWeight: 700, minWidth: '24px', textAlign: 'center', color: getEvaColor(form.evaDouleur) }}>
                      {form.evaDouleur}
                    </span>
                  </div>
                </div>
              </div>

              {/* SURVEILLANCE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '4px' }}>SURVEILLANCE & MÉTABOLISME</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={labelStyle}>GLYCÉMIE CAP.</label>
                    <input type="number" step="0.01" placeholder="g/l" value={form.glycemieCapillaire} onChange={e => setForm({ ...form, glycemieCapillaire: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>POIDS</label>
                    <input type="number" step="0.1" placeholder="kg" value={form.poids} onChange={e => setForm({ ...form, poids: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={labelStyle}>SCORE GLASGOW</label>
                    <input type="number" min="3" max="15" placeholder="/15" value={form.scoreGlasgow} onChange={e => setForm({ ...form, scoreGlasgow: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>DIURÈSE</label>
                    <input type="text" placeholder="ex: 1500ml/24h" value={form.diurese} onChange={e => setForm({ ...form, diurese: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>BILAN HYDRIQUE (ENTRÉES/SORTIES)</label>
                  <input type="text" placeholder="ex: +500ml" value={form.bilanHydrique} onChange={e => setForm({ ...form, bilanHydrique: e.target.value })} style={inputStyle} />
                </div>
              </div>

              {/* EVALUATION CLINIQUE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '4px' }}>ÉVALUATION CLINIQUE & EXAMENS</div>

                <div>
                  <label style={labelStyle}>ÉTAT GÉNÉRAL <span style={{ color: '#ef4444' }}>*</span></label>
                  <select value={form.etatGeneral} onChange={e => setForm({ ...form, etatGeneral: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="Stable">Stable</option>
                    <option value="Amélioré">Amélioré</option>
                    <option value="Aggravé">Aggravé</option>
                    <option value="Critique">Critique</option>
                    <option value="Guéri">Guéri</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>EXAMEN CLINIQUE GÉNÉRAL</label>
                  <textarea placeholder="Appareils cardio-vasculaire, respiratoire, digestif..." value={form.examenClinique} onChange={e => setForm({ ...form, examenClinique: e.target.value })} style={{ ...inputStyle, height: '60px', resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>EXAMEN NEUROLOGIQUE</label>
                  <textarea placeholder="Conscience, pupilles, déficit moteur..." value={form.examenNeurologique} onChange={e => setForm({ ...form, examenNeurologique: e.target.value })} style={{ ...inputStyle, height: '60px', resize: 'vertical' }} />
                </div>
              </div>

              {/* PRISE EN CHARGE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1d4ed8', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '4px' }}>PRISE EN CHARGE & ÉVOLUTION</div>

                <div>
                  <label style={labelStyle}>EXAMENS COMPLÉMENTAIRES</label>
                  <textarea placeholder="Résultats de labo, imagerie du jour ou demandes..." value={form.examensComplementaires} onChange={e => setForm({ ...form, examensComplementaires: e.target.value })} style={{ ...inputStyle, height: '60px', resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>ACTIONS & TRAITEMENTS</label>
                  <textarea placeholder="Modifications thérapeutiques, soins réalisés..." value={form.actionsTraitements} onChange={e => setForm({ ...form, actionsTraitements: e.target.value })} style={{ ...inputStyle, height: '60px', resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>ÉVOLUTION / COMMENTAIRES</label>
                  <textarea placeholder="Synthèse de l'évolution, points d'attention..." value={form.evolution} onChange={e => setForm({ ...form, evolution: e.target.value })} style={{ ...inputStyle, height: '60px', resize: 'vertical' }} />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: form.signesAlerte ? '#ef4444' : '#64748b', fontWeight: form.signesAlerte ? 600 : 400, marginTop: '8px' }}>
                <input type="checkbox" checked={form.signesAlerte} onChange={e => setForm({ ...form, signesAlerte: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                <IconAlert size={13} color={form.signesAlerte ? '#ef4444' : '#94a3b8'} />
                Signes d'alerte détectés
              </label>
            </div>
            
            <div style={{ padding: '16px 18px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowForm(false)} style={btnSecondary}>Annuler</button>
                <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary, flex: 1, opacity: saving ? 0.7 : 1 }}>
                  {saving ? '...' : "Ajouter l'observation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Constante({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: 700, color: color || '#1e293b' }}>{value}</div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: 700,
  color: '#94a3b8', textTransform: 'uppercase',
  letterSpacing: '0.07em', marginBottom: '5px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
  padding: '8px 12px', fontSize: '13px', color: '#1e293b',
  outline: 'none', fontFamily: "'Inter', sans-serif",
  boxSizing: 'border-box', backgroundColor: '#ffffff',
};
const btnPrimary: React.CSSProperties = {
  padding: '10px 16px', fontSize: '13px', fontWeight: 600,
  backgroundColor: '#1d4ed8', color: 'white',
  border: 'none', borderRadius: '8px', cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
};
const btnSecondary: React.CSSProperties = {
  padding: '10px 16px', fontSize: '13px', fontWeight: 600,
  backgroundColor: '#f8fafc', color: '#475569',
  border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
};
