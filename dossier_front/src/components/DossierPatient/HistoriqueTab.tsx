'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

type TypeAction = 'creation' | 'modification' | 'consultation' | 'suppression' | 'sortie' | 'transfert';

interface HistoriqueEntry {
  id: string;
  action: TypeAction;
  module: string;
  anciennesValeurs: any;
  nouvellesValeurs: any;
  utilisateur: string;
  commentaire: string;
  dateAction: string;
}

const ACTION_CONFIG: Record<TypeAction, { label: string; color: string; bg: string }> = {
  creation:     { label: 'Création',     color: '#16a34a', bg: '#dcfce7' },
  modification: { label: 'Modification', color: '#1d4ed8', bg: '#dbeafe' },
  consultation: { label: 'Consultation', color: '#64748b', bg: '#f1f5f9' },
  suppression:  { label: 'Suppression',  color: '#dc2626', bg: '#fee2e2' },
  sortie:       { label: 'Sortie',       color: '#7c3aed', bg: '#ede9fe' },
  transfert:    { label: 'Transfert',    color: '#d97706', bg: '#fef3c7' },
};

const MODULE_ICONS: Record<string, React.ReactNode> = {
  'Observation':            <IconClipboard />,
  'Diagnostic':             <IconSearch />,
  'Prescription':           <IconPill />,
  'Soins / Suivi':          <IconActivity />,
  'CR Opératoire':          <IconScalpel />,
  'Sortie':                 <IconDoor />,
  'Resultats Paracliniques':<IconFlask />,
};

// Champs à afficher lisiblement avec leurs labels FR
const FIELD_LABELS: Record<string, string> = {
  type: 'Type', statut: 'Statut', valide: 'Validé', contenu: 'Contenu',
  patientId: 'Patient ID', prescripteur: 'Prescripteur', medicaments: 'Médicaments',
  nom: 'Nom', dose: 'Dose', quantite: 'Quantité', voie: 'Voie',
  frequence: 'Fréquence', duree: 'Durée',
  diagnosticPrincipal: 'Diagnostic principal',
  diagnosticsSecondaires: 'Diagnostics secondaires',
  justificationClinique: 'Justification clinique',
  graviteStade: 'Gravité / Stade',
  medecinResponsable: 'Médecin responsable',
  temperature: 'Température', taSystolique: 'TA systolique',
  taDiastolique: 'TA diastolique', frequenceCardiaque: 'Fréquence cardiaque',
  evaDouleur: 'EVA douleur', etatGeneral: 'État général',
  examenClinique: 'Examen clinique', evolution: 'Évolution',
  nomIntervention: 'Intervention', chirurgienPrincipal: 'Chirurgien',
  anesthesiste: 'Anesthésiste', typeAnesthesie: 'Anesthésie',
  classeAsa: 'Classe ASA', scoreSccre: 'Score SCCRE',
  complications: 'Complications', typeSortie: 'Type de sortie',
  dateSortieprevue: 'Date de sortie', medecinValidant: 'Médecin validant',
  compteRenduSortie: 'Compte-rendu', suiviPostSortie: 'Suivi post-sortie',
  createdAt: 'Créé le', updatedAt: 'Modifié le', isActive: 'Actif',
};

function formatValue(key: string, val: any): string {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Oui' : 'Non';
  if (key.toLowerCase().includes('date') || key === 'createdAt' || key === 'updatedAt') {
    try { return new Date(val).toLocaleString('fr-FR'); } catch { return String(val); }
  }
  if (Array.isArray(val)) {
    return val.map((item: any, i: number) => {
      if (typeof item === 'object') {
        return Object.entries(item)
          .filter(([k]) => !['id','patientId','prescriptionId'].includes(k))
          .map(([k, v]) => `${FIELD_LABELS[k] || k}: ${v}`)
          .join(', ');
      }
      return String(item);
    }).join(' | ');
  }
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

// Champs à exclure de l'affichage
const EXCLUDED_KEYS = ['id', 'patientId', '__v', 'prescriptionId'];

function ValeurSection({ title, data, color, bg, border }: {
  title: string; data: any; color: string; bg: string; border: string;
}) {
  if (!data || typeof data !== 'object') return null;
  const entries = Object.entries(data).filter(([k]) => !EXCLUDED_KEYS.includes(k));
  if (entries.length === 0) return null;

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {entries.map(([key, val]) => {
          const label = FIELD_LABELS[key] || key;

          // Parser contenu si c'est une string JSON
          let parsedVal = val;
          if (key === 'contenu' && typeof val === 'string') {
            try { parsedVal = JSON.parse(val); } catch { parsedVal = val; }
          }

          if (key === 'contenu' && parsedVal && typeof parsedVal === 'object' && Array.isArray(parsedVal.medicaments)) {
            const v = parsedVal;
            return (
              <div key={key}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Médicaments</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  {v.medicaments.map((med: any, i: number) => (
                    <div key={i} style={{ backgroundColor: 'white', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '8px 12px', borderLeft: '3px solid #1d4ed8' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{med.nom || '—'}</div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {med.dose && <span style={{ fontSize: '11px', color: '#475569' }}>Dose : <strong>{med.dose}</strong></span>}
                        {med.quantite && <span style={{ fontSize: '11px', color: '#475569' }}>Qté : <strong>{med.quantite}</strong></span>}
                        {med.frequence && <span style={{ fontSize: '11px', color: '#475569' }}>Fréq : <strong>{med.frequence}</strong></span>}
                        {med.duree && <span style={{ fontSize: '11px', color: '#475569' }}>Durée : <strong>{med.duree}</strong></span>}
                        {med.voie && med.voie !== '' && <span style={{ fontSize: '11px', color: '#475569' }}>Voie : <strong>{med.voie}</strong></span>}
                      </div>
                    </div>
                  ))}
                </div>
                {v.remarques && v.remarques !== '' && (
                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#64748b' }}>Remarques : {v.remarques}</div>
                )}
              </div>
            );
          }

          if (key === 'prescripteur' && typeof val === 'string' && /^[0-9a-f-]{36}$/i.test(val)) {
            return (
              <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', minWidth: '140px', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Prescripteur</span>
                <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>Dr. Jean Pierre</span>
              </div>
            );
          }

          const value = formatValue(key, val);
          if (value === '—' && typeof val !== 'boolean') return null;
          return (
            <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', minWidth: '140px', flexShrink: 0, paddingTop: '1px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {label}
              </span>
              <span style={{ fontSize: '12px', color, fontWeight: 500, lineHeight: 1.5, wordBreak: 'break-word' }}>
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HistoriqueTab({ patientId }: { patientId: string }) {
  const [historique, setHistorique] = useState<HistoriqueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<string>('tous');

  useEffect(() => { fetchHistorique(); }, [patientId]);

  const fetchHistorique = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patients/${patientId}/historique`);
      setHistorique(res.data);
    } catch { } finally { setLoading(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const modules = ['tous', ...Array.from(new Set(historique.map(h => h.module).filter(Boolean)))];
  const filtered = filtre === 'tous' ? historique : historique.filter(h => h.module === filtre);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: '#94a3b8', fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>
      Chargement de l'historique...
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1d4ed8', margin: 0 }}>Journal des actions</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '3px 0 0 0' }}>Traçabilité complète des modifications du dossier</p>
        </div>
        <button onClick={fetchHistorique} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
          <IconRefresh /> Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {modules.map(mod => (
          <button key={mod} onClick={() => setFiltre(mod)} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 14px', fontSize: '12px', fontWeight: 500,
            borderRadius: '20px', border: '1px solid',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            borderColor: filtre === mod ? '#1d4ed8' : '#e2e8f0',
            backgroundColor: filtre === mod ? '#1d4ed8' : '#ffffff',
            color: filtre === mod ? '#ffffff' : '#64748b',
          }}>
            {mod !== 'tous' && <span style={{ color: filtre === mod ? 'white' : '#94a3b8' }}>{MODULE_ICONS[mod] || <IconDoc />}</span>}
            {mod === 'tous' ? 'Tous' : mod}
          </button>
        ))}
      </div>

      {/* Compteur */}
      {filtered.length > 0 && (
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
          {filtered.length} action{filtered.length > 1 ? 's' : ''} enregistrée{filtered.length > 1 ? 's' : ''}
        </p>
      )}

      {/* Vide */}
      {filtered.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>Aucune action enregistrée</p>
        </div>
      )}

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {filtered.map((entry, index) => {
          const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.consultation;
          const isExpanded = expanded === entry.id;
          const hasDetails = entry.anciennesValeurs || entry.nouvellesValeurs;

          return (
            <div key={entry.id} style={{ display: 'flex', gap: '14px', paddingBottom: '0' }}>

              {/* Dot + ligne */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  backgroundColor: config.bg, border: `1px solid ${config.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: '14px', flexShrink: 0,
                }}>
                  <ActionIcon action={entry.action} color={config.color} />
                </div>
                {index < filtered.length - 1 && (
                  <div style={{ width: '2px', flex: 1, backgroundColor: '#f1f5f9', minHeight: '20px' }} />
                )}
              </div>

              {/* Carte */}
              <div style={{
                flex: 1, backgroundColor: 'white',
                border: '1px solid #e2e8f0', borderRadius: '12px',
                padding: '14px 16px', margin: '10px 0',
              }}>
                {/* Header carte */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', backgroundColor: config.bg, color: config.color }}>
                      {config.label}
                    </span>
                    {entry.module && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#94a3b8' }}>{MODULE_ICONS[entry.module] || <IconDoc />}</span>
                        {entry.module}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '11px' }}>
                    <IconClock />
                    {formatDate(entry.dateAction)} à {formatTime(entry.dateAction)}
                  </div>
                </div>

                {/* Utilisateur */}
                {entry.utilisateur && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                    <IconUser />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{entry.utilisateur}</span>
                  </div>
                )}

                {/* Commentaire */}
                {entry.commentaire && (
                  <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                    {entry.commentaire}
                  </p>
                )}

                {/* Bouton détails */}
                {hasDetails && (
                  <div>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : entry.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                      {isExpanded ? 'Masquer les détails' : 'Voir les détails'}
                    </button>

                    {isExpanded && (
                      <div style={{ marginTop: '4px' }}>
                        <ValeurSection
                          title="Nouvelles valeurs"
                          data={entry.nouvellesValeurs}
                          color="#15803d"
                          bg="#f0fdf4"
                          border="#bbf7d0"
                        />
                        <ValeurSection
                          title="Anciennes valeurs"
                          data={entry.anciennesValeurs}
                          color="#b91c1c"
                          bg="#fef2f2"
                          border="#fecaca"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────
function IconRefresh() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>;
}
function IconClock() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function IconUser() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function IconDoc() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function IconClipboard() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>;
}
function IconSearch() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function IconPill() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20.5l10-10a4.95 4.95 0 00-7-7l-10 10a4.95 4.95 0 007 7z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>;
}
function IconActivity() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}
function IconScalpel() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 3l-6 6"/><path d="M5 21l6-6"/><path d="M12 12L5 5"/><path d="M3 21h4l13-13-4-4L3 17v4z"/></svg>;
}
function IconDoor() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-3"/><polyline points="17 8 21 12 17 16"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function IconFlask() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6l1 7H8L9 3z"/><path d="M8 10l-3 9a1 1 0 001 1h12a1 1 0 001-1l-3-9"/></svg>;
}
function ActionIcon({ action, color }: { action: TypeAction; color: string }) {
  const props = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (action) {
    case 'creation':     return <svg {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'modification': return <svg {...props}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case 'consultation': return <svg {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'suppression':  return <svg {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    case 'sortie':       return <svg {...props}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
    case 'transfert':    return <svg {...props}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>;
    default:             return <svg {...props}><circle cx="12" cy="12" r="10"/></svg>;
  }
}
