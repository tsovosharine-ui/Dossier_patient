'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface HistoriqueEntry {
  id: string;
  action: string;
  module: string;
  anciennesValeurs: any;
  nouvellesValeurs: any;
  utilisateur: string;
  commentaire: string;
  dateAction: string;
}

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  creation:     { label: 'Création',     color: '#16a34a', bg: '#dcfce7' },
  modification: { label: 'Modification', color: '#1d4ed8', bg: '#dbeafe' },
  validation:   { label: 'Validation',   color: '#7c3aed', bg: '#ede9fe' },
  suppression:  { label: 'Suppression',  color: '#dc2626', bg: '#fee2e2' },
};

const TYPE_FILTERS = [
  { key: 'tous',           label: 'Tous',               icon: <IconAll /> },
  { key: 'medicament',     label: 'Médicamenteuse',     icon: <IconMed /> },
  { key: 'non_medicament', label: 'Non médicamenteuse', icon: <IconNonMed /> },
  { key: 'surveillance',   label: 'Surveillance',       icon: <IconSurv /> },
  { key: 'transfusion',    label: 'Transfusion',        icon: <IconTrans /> },
  { key: 'bloc',           label: 'Bloc opératoire',    icon: <IconBloc /> },
  { key: 'paraclinique',   label: 'Para-clinique',      icon: <IconPara /> },
];

const TYPE_LABELS: Record<string, string> = {
  medicament:     'Médicamenteuse',
  non_medicament: 'Non médicamenteuse',
  surveillance:   'Surveillance',
  transfusion:    'Transfusion',
  bloc:           'Bloc opératoire',
  paraclinique:   'Para-clinique',
};

const FIELD_LABELS: Record<string, string> = {
  type: 'Type', statut: 'Statut', valide: 'Validé',
  patientId: 'Patient ID', prescripteur: 'Prescripteur',
  medicaments: 'Médicaments', remarques: 'Remarques',
  notifierInfirmier: 'Notifier infirmier',
  createdAt: 'Créé le', updatedAt: 'Modifié le',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXCLUDED_KEYS = ['id', 'patientId', '__v', 'prescriptionId'];

function getTypeFromEntry(entry: HistoriqueEntry): string {
  const values = entry.nouvellesValeurs || entry.anciennesValeurs || {};
  let parsed = values;
  if (typeof values === 'string') {
    try { parsed = JSON.parse(values); } catch { parsed = {}; }
  }
  return parsed?.type || '';
}

// ── ICÔNES SVG ──────────────────────────────────────────────────────────────

function IconAll() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
}
function IconMed() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
      <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}
function IconNonMed() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}
function IconSurv() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
}
function IconTrans() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 0 1 5 5c0 5-5 13-5 13S7 12 7 7a5 5 0 0 1 5-5z"/>
      <circle cx="12" cy="7" r="2"/>
    </svg>
  );
}
function IconBloc() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function IconPara() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
    </svg>
  );
}

// ── COMPOSANTS INTERNES ─────────────────────────────────────────────────────

function MedicamentsList({ items }: { items: any[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
      {items.map((med: any, i: number) => (
        <div key={i} style={{ backgroundColor: 'white', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '8px 12px', borderLeft: '3px solid #1d4ed8' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{med.nom || '—'}</div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {med.dose      && <span style={{ fontSize: '11px', color: '#475569' }}>Dose : <strong>{med.dose}</strong></span>}
            {med.quantite  && <span style={{ fontSize: '11px', color: '#475569' }}>Qté : <strong>{med.quantite}</strong></span>}
            {med.frequence && <span style={{ fontSize: '11px', color: '#475569' }}>Fréq : <strong>{med.frequence}</strong></span>}
            {med.duree     && <span style={{ fontSize: '11px', color: '#475569' }}>Durée : <strong>{med.duree}</strong></span>}
            {med.voie && med.voie !== '' && <span style={{ fontSize: '11px', color: '#475569' }}>Voie : <strong>{med.voie}</strong></span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ValeurSection({ title, data, color, bg, border }: {
  title: string; data: any; color: string; bg: string; border: string;
}) {
  if (!data) return null;
  let parsed = data;
  if (typeof data === 'string') {
    try { parsed = JSON.parse(data); } catch { return null; }
  }
  if (typeof parsed !== 'object') return null;
  const entries = Object.entries(parsed).filter(([k]) => !EXCLUDED_KEYS.includes(k));
  if (entries.length === 0) return null;

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {entries.map(([key, val]) => {
          const label = FIELD_LABELS[key] || key;

          if (key === 'contenu') {
            let v = val;
            if (typeof v === 'string') { try { v = JSON.parse(v); } catch { v = null; } }
            if (v && typeof v === 'object') {
              const cv = v as any;
              if (Array.isArray(cv.medicaments)) {
                return (
                  <div key={key}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Médicaments</span>
                    <MedicamentsList items={cv.medicaments} />
                    {cv.remarques && cv.remarques !== '' && (
                      <div style={{ marginTop: '6px', fontSize: '11px', color: '#64748b' }}>Remarques : {cv.remarques}</div>
                    )}
                  </div>
                );
              }
              if (Array.isArray(cv.items)) {
                return (
                  <div key={key}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Détails</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                      {cv.items.map((item: any, i: number) => (
                        <div key={i} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', borderLeft: '3px solid #1d4ed8' }}>
                          {(item.typeLabel || item.type || item.nom) && (
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                              {item.typeLabel || item.nom || item.type}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {item.description && <span style={{ fontSize: '11px', color: '#475569' }}>Description : <strong>{item.description}</strong></span>}
                            {item.duree       && <span style={{ fontSize: '11px', color: '#475569' }}>Durée : <strong>{item.duree}</strong></span>}
                            {item.frequence   && <span style={{ fontSize: '11px', color: '#475569' }}>Fréq : <strong>{item.frequence}</strong></span>}
                            {item.dose        && <span style={{ fontSize: '11px', color: '#475569' }}>Dose : <strong>{item.dose}</strong></span>}
                            {item.quantite    && <span style={{ fontSize: '11px', color: '#475569' }}>Qté : <strong>{item.quantite}</strong></span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            }
          }

          if (key === 'prescripteur' && typeof val === 'string' && UUID_RE.test(val)) {
            return (
              <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', minWidth: '130px', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Prescripteur</span>
                <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>Dr. Jean Pierre</span>
              </div>
            );
          }

          if (typeof val === 'boolean') {
            return (
              <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', minWidth: '130px', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                <span style={{ fontSize: '12px', color, fontWeight: 500 }}>{val ? 'Oui' : 'Non'}</span>
              </div>
            );
          }

          if ((key === 'createdAt' || key === 'updatedAt') && typeof val === 'string') {
            return (
              <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', minWidth: '130px', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                <span style={{ fontSize: '12px', color, fontWeight: 500 }}>{new Date(val as string).toLocaleString('fr-FR')}</span>
              </div>
            );
          }

          if (!val || val === '') return null;

          return (
            <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', minWidth: '130px', flexShrink: 0, paddingTop: '1px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {label}
              </span>
              <span style={{ fontSize: '12px', color, fontWeight: 500, lineHeight: 1.5, wordBreak: 'break-word' }}>
                {String(val)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

export default function HistoriquePrescriptions({ patientId }: { patientId: string }) {
  const [entries, setEntries] = useState<HistoriqueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<string>('tous');

  useEffect(() => { fetchHistorique(); }, [patientId]);

  const fetchHistorique = async () => {
    try {
      const res = await api.get(`/patients/${patientId}/historique`);
      const prescriptions = res.data.filter((e: HistoriqueEntry) => e.module === 'Prescription');
      setEntries(prescriptions);
    } catch { } finally { setLoading(false); }
  };

  const filtered = filtre === 'tous'
    ? entries
    : entries.filter(e => getTypeFromEntry(e) === filtre);

  const countByType = (type: string) =>
    type === 'tous'
      ? entries.length
      : entries.filter(e => getTypeFromEntry(e) === type).length;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) +
    ' à ' + new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
      Chargement...
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Inter', sans-serif" }}>

      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Historique des prescriptions
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0 0' }}>
            {entries.length} action{entries.length > 1 ? 's' : ''} enregistrée{entries.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchHistorique}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: '#f8fafc', color: '#475569',
            border: '1px solid #e2e8f0', borderRadius: '8px',
            padding: '7px 14px', fontSize: '12px', fontWeight: 500,
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {TYPE_FILTERS.map(f => {
          const count = countByType(f.key);
          const isActive = filtre === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFiltre(f.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', fontSize: '12px', fontWeight: 500,
                borderRadius: '8px', border: '1px solid',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                borderColor: isActive ? '#1d4ed8' : '#e2e8f0',
                backgroundColor: isActive ? '#1d4ed8' : '#ffffff',
                color: isActive ? '#ffffff' : '#64748b',
                transition: 'all 0.15s',
                opacity: count === 0 && f.key !== 'tous' ? 0.4 : 1,
              }}
            >
              <span style={{ color: isActive ? '#ffffff' : '#64748b' }}>{f.icon}</span>
              {f.label}
              {count > 0 && (
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                  borderRadius: '10px', padding: '1px 6px', minWidth: '18px', textAlign: 'center',
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Résultats vides */}
      {filtered.length === 0 && (
        <div style={{ padding: '50px 20px', textAlign: 'center', color: '#94a3b8' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '10px' }}>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <p style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 4px 0' }}>
            {entries.length === 0 ? 'Aucune prescription dans l\'historique' : `Aucune prescription de type "${TYPE_LABELS[filtre] || filtre}"`}
          </p>
          <p style={{ fontSize: '12px', margin: 0 }}>
            {entries.length === 0 ? 'Les prescriptions créées seront tracées ici' : 'Essayez un autre filtre'}
          </p>
        </div>
      )}

      {/* Liste */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(entry => {
          const cfg = ACTION_CONFIG[entry.action] || ACTION_CONFIG.creation;
          const isExpanded = expanded === entry.id;
          const hasDetails = entry.anciennesValeurs || entry.nouvellesValeurs;
          const typeEntry = getTypeFromEntry(entry);

          return (
            <div key={entry.id} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px' }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Badge action */}
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', backgroundColor: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                  {/* Badge type */}
                  {typeEntry && TYPE_LABELS[typeEntry] && (
                    <span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                      {TYPE_LABELS[typeEntry]}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formatDate(entry.dateAction)}</span>
              </div>

              {/* Commentaire */}
              {entry.commentaire && (
                <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 6px 0', lineHeight: 1.5 }}>{entry.commentaire}</p>
              )}

              {/* Utilisateur */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: hasDetails ? '8px' : 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{entry.utilisateur || 'Système'}</span>
              </div>

              {/* Détails dépliables */}
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
                    <div>
                      <ValeurSection title="Nouvelles valeurs" data={entry.nouvellesValeurs} color="#15803d" bg="#f0fdf4" border="#bbf7d0" />
                      <ValeurSection title="Anciennes valeurs" data={entry.anciennesValeurs} color="#b91c1c" bg="#fef2f2" border="#fecaca" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
