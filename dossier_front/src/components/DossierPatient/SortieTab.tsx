/* eslint-disable react/no-unescaped-entities, react-hooks/exhaustive-deps, react-hooks/immutability */
'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { EhrFormSection } from '@/components/DossierPatient/EhrFormSection';
import { ehr } from '@/lib/ehr-theme';

interface Sortie {
  id?: string;
  typeSortie?: string;
  dateSortieprevue?: string;
  medecinValidant?: string;
  compteRenduSortie?: string;
  suiviPostSortie?: string;
  etablissementTransfert?: string;
  motifTransfert?: string;
  statutTransfert?: string;
  justificationTransfert?: string;
  destinationTransfert?: 'INTERNE' | 'EXTERNE';
  serviceDemandeInterne?: string;
  engagementPatient?: string;
  acteDeces?: string;
  ordonnanceSortieGeneree?: boolean;
  instructionsPostOpGenerees?: boolean;
  signatureData?: string;
  signatureHorodatage?: string;
  statut?: string;
}

const TYPES_SORTIE = [
  {
    key: 'NORMALE',
    label: 'Sortie normale /\nRetour à domicile',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    key: 'TRANSFERT',
    label: 'Transfert vers service\n/ hôpital',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2"/>
        <path d="M12 7v6l-3 3m3-3 3 3"/>
        <path d="M12 13v4"/>
        <path d="M5 20h14"/>
      </svg>
    ),
  },
  {
    key: 'CONTRE_AVIS',
    label: 'Sortie contre avis /\nÉvadé',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    key: 'DECHARGE',
    label: 'Décharge\nadministrative',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <polyline points="9 15 11 17 15 13"/>
      </svg>
    ),
  },
  {
    key: 'DECES',
    label: 'Décès',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
];

const IconCheck = ({ size = 18, color = '#16a34a' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconChevronRight = ({ color = '#94a3b8' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const IconDocument = ({ color = '#05668D' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const IconClipboardList = ({ color = '#475569' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
    <line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
);

const IconPen = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);

const IconSave = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

export function SortieTab({ patientId }: { patientId: string }) {
  const [form, setForm] = useState<Sortie>({ typeSortie: 'NORMALE', statut: 'EN_COURS' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => { fetchSortie(); }, [patientId]);

  async function fetchSortie() {
    setLoading(true);
    try {
      const res = await api.get(`/patients/${patientId}/sortie`);
      const data = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
      if (data) {
        setForm(data);
        setLastUpdate(data.updatedAt || data.createdAt || '');
        if (data.signatureData) setSigned(true);
      }
    } catch { }
    finally { setLoading(false); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (form.id) {
        const res = await api.put(`/patients/${patientId}/sortie/${form.id}`, form);
        setForm(res.data);
        setLastUpdate(res.data.updatedAt || '');
      } else {
        const res = await api.post(`/patients/${patientId}/sortie`, form);
        setForm(res.data);
        setLastUpdate(res.data.updatedAt || '');
      }
    } catch { alert('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  }

  async function handleValider() {
    if (!form.id) { alert('Sauvegardez d\'abord le formulaire.'); return; }
    if (!signed) { alert('La signature numérique est obligatoire.'); return; }
    if (!form.typeSortie) { alert('Le type de sortie est obligatoire.'); return; }
    if (!form.dateSortieprevue) { alert('La date de sortie est obligatoire.'); return; }
    const canvas = canvasRef.current;
    const signatureData = canvas ? canvas.toDataURL() : '';
    setSaving(true);
    try {
      const res = await api.put(`/patients/${patientId}/sortie/${form.id}/valider`, { signatureData });
      setForm(res.data);
      alert('Sortie validée et dossier clôturé.');
    } catch { alert('Erreur lors de la validation.'); }
    finally { setSaving(false); }
  }

  function getPos(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    lastPos.current = getPos(e);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#05668D';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    lastPos.current = pos;
    setSigned(true);
  }

  function stopDraw() { setIsDrawing(false); lastPos.current = null; }

  function clearSignature() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  }

  const isCloture = form.statut === 'CLOTURE';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#64748b', fontFamily: "'Inter', sans-serif" }}>
      Chargement...
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: ehr.text, maxWidth: '960px', margin: '0 auto', paddingBottom: '40px' }}>

      <EhrFormSection
        title="Sortie du patient"
        subtitle="Décision de sortie – Épisode actuel"
        sectionBadge="01"
        complete={!!form.typeSortie && !!form.dateSortieprevue}
        collapsible
        defaultOpen
      >
        <p style={sectionLabelStyle}>TYPE DE SORTIE</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {TYPES_SORTIE.map(t => (
            <button
              key={t.key}
              type="button"
              disabled={isCloture}
              onClick={() => setForm({ ...form, typeSortie: t.key })}
              style={{
                padding: '16px 8px',
                borderRadius: 12,
                border: form.typeSortie === t.key ? `2px solid ${ehr.primary}` : `1px solid ${ehr.borderSoft}`,
                backgroundColor: form.typeSortie === t.key ? ehr.highlightBlueTint : ehr.pageBg,
                color: form.typeSortie === t.key ? ehr.primary : '#475569',
                cursor: isCloture ? 'default' : 'pointer',
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, lineHeight: 1.4, whiteSpace: 'pre-line' }}>{t.label}</div>
            </button>
          ))}
        </div>
      </EhrFormSection>

      {form.typeSortie === 'TRANSFERT' && (
        <EhrFormSection title="Informations de transfert" sectionBadge="02" collapsible defaultOpen>
          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 16 }}>
            <p style={{ ...sectionLabelStyle, color: '#b45309' }}>DESTINATION DU TRANSFERT</p>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>
                <input
                  type="radio"
                  name="destinationTransfert"
                  checked={form.destinationTransfert === 'INTERNE'}
                  onChange={() => setForm({ ...form, destinationTransfert: 'INTERNE' })}
                  disabled={isCloture}
                  style={{ accentColor: '#b45309', cursor: 'pointer' }}
                />
                Même CHU (Transfert Interne)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>
                <input
                  type="radio"
                  name="destinationTransfert"
                  checked={form.destinationTransfert === 'EXTERNE'}
                  onChange={() => setForm({ ...form, destinationTransfert: 'EXTERNE' })}
                  disabled={isCloture}
                  style={{ accentColor: '#b45309', cursor: 'pointer' }}
                />
                Autre Hôpital (Transfert Externe)
              </label>
            </div>

            {form.destinationTransfert === 'EXTERNE' && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #fde68a', paddingTop: '16px' }}>
                <p style={{ ...sectionLabelStyle, color: '#b45309' }}>DÉTAILS DU TRANSFERT EXTERNE</p>
                <div style={{ marginBottom: '12px' }}>
                  <label style={fieldLabelStyle}>Hôpital ou Établissement receveur *</label>
                  <input
                    disabled={isCloture}
                    value={form.etablissementTransfert || ''}
                    onChange={e => setForm({ ...form, etablissementTransfert: e.target.value })}
                    placeholder="Nom de l'hôpital ou clinique"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={fieldLabelStyle}>Motif du transfert</label>
                  <textarea
                    disabled={isCloture}
                    value={form.motifTransfert || ''}
                    onChange={e => setForm({ ...form, motifTransfert: e.target.value })}
                    placeholder="Raison du transfert vers cet autre hôpital..."
                    style={{ ...inputStyle, height: '60px', resize: 'none' }}
                  />
                </div>
              </div>
            )}

            {form.destinationTransfert === 'INTERNE' && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #fde68a', paddingTop: '16px' }}>
                <p style={{ ...sectionLabelStyle, color: '#b45309' }}>DEMANDE DE TRANSFERT INTERNE</p>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={fieldLabelStyle}>Service demandé *</label>
                  <input
                    disabled={isCloture}
                    value={form.serviceDemandeInterne || ''}
                    onChange={e => setForm({ ...form, serviceDemandeInterne: e.target.value })}
                    placeholder="Ex: Cardiologie, Réanimation..."
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={fieldLabelStyle}>Motif clinique de la demande</label>
                  <textarea
                    disabled={isCloture}
                    value={form.motifTransfert || ''}
                    onChange={e => setForm({ ...form, motifTransfert: e.target.value })}
                    placeholder="Motif justifiant le transfert vers ce service..."
                    style={{ ...inputStyle, height: '60px', resize: 'none' }}
                  />
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                  <p style={{ ...sectionLabelStyle, color: '#475569' }}>SUIVI DE LA DEMANDE (LECTURE SEULE)</p>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={fieldLabelStyle}>Statut du transfert</label>
                    <div style={{ padding: '8px 12px', backgroundColor: form.statutTransfert === 'ACCEPTE' ? '#dcfce7' : form.statutTransfert === 'REFUSE' ? '#fee2e2' : '#f1f5f9', color: form.statutTransfert === 'ACCEPTE' ? '#166534' : form.statutTransfert === 'REFUSE' ? '#991b1b' : '#475569', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                      {form.statutTransfert === 'ACCEPTE' ? 'Demande Acceptée' : form.statutTransfert === 'REFUSE' ? 'Demande Refusée' : 'Demande En attente (À voir)'}
                    </div>
                  </div>

                  {form.statutTransfert === 'REFUSE' && form.justificationTransfert && (
                    <div>
                      <label style={fieldLabelStyle}>Justification du refus</label>
                      <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '13px', color: '#991b1b', fontStyle: 'italic' }}>
                        {form.justificationTransfert}
                      </div>
                    </div>
                  )}

                  {form.statutTransfert === 'ACCEPTE' && (
                    <div>
                      <label style={fieldLabelStyle}>Service d'accueil validé</label>
                      <div style={{ padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
                        {form.etablissementTransfert || form.serviceDemandeInterne}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </EhrFormSection>
      )}

      {form.typeSortie === 'DECHARGE' && (
        <EhrFormSection title="Informations de décharge" sectionBadge="02" collapsible defaultOpen>
          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 16 }}>
            <p style={{ ...sectionLabelStyle, color: '#b45309' }}>ENGAGEMENT DU PATIENT</p>
            <div>
              <label style={fieldLabelStyle}>Détails de l'engagement *</label>
              <textarea
                disabled={isCloture}
                value={form.engagementPatient || ''}
                onChange={e => setForm({ ...form, engagementPatient: e.target.value })}
                placeholder="Ex: Le patient certifie quitter l'établissement contre avis médical et assume l'entière responsabilité..."
                style={{ ...inputStyle, height: '80px', resize: 'none' }}
              />
            </div>
          </div>
        </EhrFormSection>
      )}

      {form.typeSortie === 'DECES' && (
        <EhrFormSection title="Informations liées au décès" sectionBadge="02" collapsible defaultOpen>
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: 16 }}>
            <p style={{ ...sectionLabelStyle, color: '#991b1b' }}>ACTE DE DÉCÈS</p>
            <div>
              <label style={fieldLabelStyle}>Numéro ou référence de l'acte de décès *</label>
              <input
                disabled={isCloture}
                value={form.acteDeces || ''}
                onChange={e => setForm({ ...form, acteDeces: e.target.value })}
                placeholder="Renseigner la référence du certificat..."
                style={inputStyle}
              />
            </div>
          </div>
        </EhrFormSection>
      )}

      <EhrFormSection
        title="Planification, compte-rendu et suivi"
        subtitle="Date de sortie, médecin, documents et suivi post-sortie"
        sectionBadge="03"
        complete={!!form.dateSortieprevue && !!(form.compteRenduSortie || '').trim()}
        collapsible
        defaultOpen
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={fieldLabelStyle}>Date et heure de sortie prévue <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="datetime-local"
                disabled={isCloture}
                value={form.dateSortieprevue || ''}
                onChange={e => setForm({ ...form, dateSortieprevue: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={fieldLabelStyle}>Médecin validant la sortie</label>
              <input
                disabled={isCloture}
                value={form.medecinValidant || ''}
                onChange={e => setForm({ ...form, medecinValidant: e.target.value })}
                placeholder="Dr. ..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={fieldLabelStyle}>Compte-rendu de sortie</label>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                {!isCloture && (
                  <div style={{ display: 'flex', gap: '4px', padding: '6px 8px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    {['B', 'I', '≡'].map(btn => (
                      <button key={btn} style={{ width: '28px', height: '24px', fontSize: '12px', fontWeight: 700, border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', color: '#475569' }}>
                        {btn}
                      </button>
                    ))}
                  </div>
                )}
                <textarea
                  disabled={isCloture}
                  value={form.compteRenduSortie || ''}
                  onChange={e => setForm({ ...form, compteRenduSortie: e.target.value })}
                  placeholder="Saisir le compte-rendu médical final..."
                  style={{ ...inputStyle, height: '160px', resize: 'none', border: 'none', borderRadius: 0, backgroundColor: isCloture ? '#f8fafc' : 'white' }}
                />
              </div>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={fieldLabelStyle}>Documents et Suivi</label>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: form.ordonnanceSortieGeneree ? '#f0fdf4' : 'white' }}
                  onClick={() => !isCloture && setForm({ ...form, ordonnanceSortieGeneree: !form.ordonnanceSortieGeneree })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconDocument color={form.ordonnanceSortieGeneree ? '#16a34a' : '#05668D'} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: form.ordonnanceSortieGeneree ? '#16a34a' : '#05668D' }}>Ordonnance de sortie</span>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    {form.ordonnanceSortieGeneree
                      ? <IconCheck size={16} color="#16a34a" />
                      : <IconChevronRight />}
                  </span>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer', backgroundColor: form.instructionsPostOpGenerees ? '#f0fdf4' : 'white' }}
                  onClick={() => !isCloture && setForm({ ...form, instructionsPostOpGenerees: !form.instructionsPostOpGenerees })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconClipboardList color={form.instructionsPostOpGenerees ? '#16a34a' : '#475569'} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: form.instructionsPostOpGenerees ? '#16a34a' : '#475569' }}>Instructions de sortie post-op</span>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    {form.instructionsPostOpGenerees
                      ? <IconCheck size={16} color="#16a34a" />
                      : <IconChevronRight />}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label style={fieldLabelStyle}>Suivi post-sortie recommandé</label>
              <textarea
                disabled={isCloture}
                value={form.suiviPostSortie || ''}
                onChange={e => setForm({ ...form, suiviPostSortie: e.target.value })}
                placeholder="Détails du suivi (ex: Infirmière à domicile, rdv dans 15 jours...)"
                style={{ ...inputStyle, height: '120px', resize: 'none' }}
              />
            </div>
          </div>
        </div>
      </EhrFormSection>

      <EhrFormSection
        title="Signature et validation"
        subtitle="Signature obligatoire avant clôture du dossier"
        sectionBadge="04"
        complete={signed || (!!(isCloture && form.signatureHorodatage))}
        collapsible
        defaultOpen
      >
        <p style={sectionLabelStyle}>SIGNATURE NUMÉRIQUE DU MÉDECIN</p>
        {isCloture && form.signatureHorodatage ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', width: 'fit-content' }}>
            <IconCheck size={18} color="#16a34a" />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a', margin: 0 }}>Signature validée</p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                {new Date(form.signatureHorodatage).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ width: '300px' }}>
            <div style={{ border: `1px solid ${ehr.borderSoft}`, borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fafafa', position: 'relative' }}>
              <canvas
                ref={canvasRef}
                width={298}
                height={120}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
                style={{ display: 'block', cursor: 'crosshair', touchAction: 'none' }}
              />
              {!signed && (
                <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '298px', height: '120px' }}>
                  <IconPen />
                  <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Cliquer pour signer</span>
                </div>
              )}
            </div>
            {signed && (
              <button
                type="button"
                onClick={clearSignature}
                style={{ marginTop: '6px', fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <IconTrash />
                Effacer la signature
              </button>
            )}
          </div>
        )}

        {!isCloture && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', marginTop: '8px', borderTop: `1px solid ${ehr.borderSoft}` }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#475569', border: `1px solid ${ehr.borderSoft}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <IconSave />
              {saving ? 'Sauvegarde...' : 'Sauvegarder le brouillon'}
            </button>
            <button
              type="button"
              onClick={handleValider}
              disabled={saving || !signed}
              style={{
                padding: '12px 28px', fontSize: '14px', fontWeight: 700,
                backgroundColor: signed ? '#0f766e' : '#94a3b8',
                color: 'white', border: 'none', borderRadius: '10px',
                cursor: signed ? 'pointer' : 'not-allowed',
                boxShadow: signed ? '0 2px 8px rgba(15,118,110,0.3)' : 'none',
              }}
            >
              Valider la sortie et clôturer le dossier
            </button>
          </div>
        )}
      </EhrFormSection>

      <EhrFormSection title="Statut du dossier" sectionBadge="05" collapsible defaultOpen>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isCloture ? '#16a34a' : '#3b82f6' }} />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
            {isCloture ? 'Dossier clôturé' : 'Statut actuel : Patient hospitalisé'}
          </span>
        </div>
        {lastUpdate && (
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 16px' }}>
            Dernière mise à jour : {new Date(lastUpdate).toLocaleString('fr-FR')}
          </p>
        )}
        {isCloture && (
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
            La validation de la sortie clôture définitivement l'épisode d'hospitalisation et génère le compte-rendu de sortie.
          </div>
        )}
      </EhrFormSection>
    </div>
  );
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px 0',
};
const fieldLabelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b',
  marginBottom: '5px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
  padding: '9px 12px', fontSize: '13px', color: '#1e293b',
  outline: 'none', fontFamily: "'Inter', sans-serif",
  boxSizing: 'border-box', backgroundColor: '#ffffff',
};
