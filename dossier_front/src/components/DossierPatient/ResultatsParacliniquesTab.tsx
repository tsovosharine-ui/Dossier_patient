'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

type TypeExamen = 'laboratoire' | 'imagerie' | 'endoscopie' | 'anatomopathologie' | 'autre';
type Statut = 'demande' | 'en_cours' | 'disponible' | 'lu';

interface ResultatParaclinique {
  id: string;
  type: TypeExamen;
  examen: string;
  dateDemande: string;
  dateResultat: string | null;
  resultatTexte: string | null;
  resultatFichiers: string[] | null;
  prescripteur: string | null;
  statut: Statut;
  commentaire: string | null;
}

interface Props { patientId: string; }

const TYPE_ICONS: Record<TypeExamen, React.ReactNode> = {
  laboratoire: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
    </svg>
  ),
  imagerie: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  endoscopie: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  anatomopathologie: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  autre: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
};

const TYPE_LABELS: Record<TypeExamen, string> = {
  laboratoire: 'Laboratoire',
  imagerie: 'Imagerie',
  endoscopie: 'Endoscopie',
  anatomopathologie: 'Anatomopathologie',
  autre: 'Autre',
};

const STATUT_LABELS: Record<Statut, string> = {
  demande: 'Demandé',
  en_cours: 'En cours',
  disponible: 'Disponible',
  lu: 'Lu',
};

const STATUT_STYLE: Record<Statut, { bg: string; color: string }> = {
  demande:    { bg: '#f1f5f9', color: '#64748b' },
  en_cours:   { bg: '#fef9c3', color: '#a16207' },
  disponible: { bg: '#dcfce7', color: '#15803d' },
  lu:         { bg: '#dbeafe', color: '#1d4ed8' },
};

export default function ResultatsParacliniquesTab({ patientId }: Props) {
  const [resultats, setResultats] = useState<ResultatParaclinique[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<TypeExamen | 'tous'>('tous');
  const [filterStatut, setFilterStatut] = useState<Statut | 'tous'>('tous');
  const [selectedResult, setSelectedResult] = useState<ResultatParaclinique | null>(null);

  useEffect(() => { fetchResultats(); }, [patientId]);

  const fetchResultats = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patients/${patientId}/resultats`);
      setResultats(res.data);
    } catch { } finally { setLoading(false); }
  };

  const handleMarquerLu = async (id: string) => {
    try {
      await api.patch(`/patients/${patientId}/resultats/${id}/lu`);
      await fetchResultats();
    } catch { }
  };

  const openDetail = (result: ResultatParaclinique) => {
    setSelectedResult(result);
    if (result.statut !== 'lu') handleMarquerLu(result.id);
  };

  const filtered = resultats.filter(r => {
    if (filterType !== 'tous' && r.type !== filterType) return false;
    if (filterStatut !== 'tous' && r.statut !== filterStatut) return false;
    return true;
  });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Titre */}
      <div style={{ marginBottom: '4px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1d4ed8', margin: '0 0 2px 0' }}>Résultats paracliniques</h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Examens prescrits pour cet épisode</p>
      </div>

      {/* Filtres */}
      <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1e293b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>01</div>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Filtres</span>
              <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>Affiner la liste des examens</span>
            </div>
          </div>
        </div>
        <div style={{ padding: '0 18px 16px 18px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>TYPE</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value as TypeExamen | 'tous')} style={selectStyle}>
              <option value="tous">Tous</option>
              <option value="laboratoire">Laboratoire</option>
              <option value="imagerie">Imagerie</option>
              <option value="endoscopie">Endoscopie</option>
              <option value="anatomopathologie">Anatomopathologie</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>STATUT</label>
            <select value={filterStatut} onChange={e => setFilterStatut(e.target.value as Statut | 'tous')} style={selectStyle}>
              <option value="tous">Tous</option>
              <option value="demande">Demandé</option>
              <option value="en_cours">En cours</option>
              <option value="disponible">Disponible</option>
              <option value="lu">Lu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste résultats */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontSize: '14px' }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '50px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔬</div>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', margin: 0 }}>Aucun résultat paraclinique trouvé</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Cliquez pour ouvrir</p>
        </div>
      ) : (
        filtered.map((result, idx) => (
          <div
            key={result.id}
            onClick={() => openDetail(result)}
            style={{
              backgroundColor: 'white',
              border: `1px solid ${selectedResult?.id === result.id ? '#1d4ed8' : '#e2e8f0'}`,
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
          >
            {/* Header section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Numéro cercle */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  backgroundColor: result.statut === 'lu' ? '#16a34a' : '#1e293b',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, flexShrink: 0,
                }}>
                  {result.statut === 'lu'
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    : String(idx + 1).padStart(2, '0')
                  }
                </div>
                {/* Icône type */}
                <div style={{ color: '#1d4ed8' }}>{TYPE_ICONS[result.type]}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{result.examen}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    {TYPE_LABELS[result.type]} · Demandé le {new Date(result.dateDemande).toLocaleDateString('fr-FR')}
                    {result.dateResultat && ` · Résultat le ${new Date(result.dateResultat).toLocaleDateString('fr-FR')}`}
                  </div>
                </div>
              </div>

              {/* Badges droite */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {result.statut !== 'lu' && (
                  <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>
                    Nouveau
                  </span>
                )}
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  padding: '4px 10px', borderRadius: '20px',
                  backgroundColor: STATUT_STYLE[result.statut].bg,
                  color: STATUT_STYLE[result.statut].color,
                }}>
                  {STATUT_LABELS[result.statut]}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            {/* Prescripteur si disponible */}
            {result.prescripteur && (
              <div style={{ padding: '0 18px 14px 58px', fontSize: '12px', color: '#64748b' }}>
                Prescrit par : {result.prescripteur}
              </div>
            )}
          </div>
        ))
      )}

      {/* Modal détail */}
      {selectedResult && (
        <div
          onClick={() => setSelectedResult(null)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: 'white', borderRadius: '16px',
              maxWidth: '680px', width: '100%',
              maxHeight: '85vh', overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            {/* Header modal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, backgroundColor: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ color: '#1d4ed8' }}>{TYPE_ICONS[selectedResult.type]}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{selectedResult.examen}</h3>
              </div>
              <button onClick={() => setSelectedResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Corps modal */}
            <div style={{ padding: '24px' }}>
              {/* Infos grille */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {[
                  { label: 'Type', value: TYPE_LABELS[selectedResult.type] },
                  { label: 'Statut', value: STATUT_LABELS[selectedResult.statut] },
                  { label: 'Date de demande', value: new Date(selectedResult.dateDemande).toLocaleString('fr-FR') },
                  ...(selectedResult.dateResultat ? [{ label: 'Date de résultat', value: new Date(selectedResult.dateResultat).toLocaleString('fr-FR') }] : []),
                  ...(selectedResult.prescripteur ? [{ label: 'Prescripteur', value: selectedResult.prescripteur }] : []),
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>{item.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Résultat texte */}
              {selectedResult.resultatTexte && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Résultat</div>
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', fontSize: '13px', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selectedResult.resultatTexte}
                  </div>
                </div>
              )}

              {/* Fichiers */}
              {selectedResult.resultatFichiers && selectedResult.resultatFichiers.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Fichiers joints</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedResult.resultatFichiers.map((file, i) => (
                      <a key={i} href="#" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#1d4ed8', textDecoration: 'none', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '5px 10px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        {file}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Commentaire */}
              {selectedResult.commentaire && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Commentaire</div>
                  <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.6 }}>{selectedResult.commentaire}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '13px',
  backgroundColor: 'white',
  color: '#1e293b',
  fontFamily: "'Inter', sans-serif",
  cursor: 'pointer',
  outline: 'none',
};
