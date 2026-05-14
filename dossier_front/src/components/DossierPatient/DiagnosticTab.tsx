'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Diagnostic {
  id: string;
  diagnosticPrincipal: string;
  diagnosticsSecondaires?: string;
  justificationClinique?: string;
  diagnosticsDifferentiels?: string;
  graviteStade?: string;
  medecinResponsable?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  patientId: string;
  medecinNom?: string;
}

const emptyForm = {
  diagnosticPrincipal: '',
  diagnosticsSecondaires: '',
  justificationClinique: '',
  diagnosticsDifferentiels: '',
  graviteStade: '',
  medecinResponsable: 'Dr. Jean Pierre',
};

export function DiagnosticTab({ patientId, medecinNom = 'Dr. Jean Pierre' }: Props) {
  const [current, setCurrent] = useState<Diagnostic | null>(null);
  const [anterieurs, setAnterieurs] = useState<Diagnostic[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ '01': true, '02': true, '03': true });
  const [form, setForm] = useState({ ...emptyForm, medecinResponsable: medecinNom });

  useEffect(() => { load(); }, [patientId]);

  const load = async () => {
    try {
      const [allRes, activeRes] = await Promise.all([
        api.get(`/patients/${patientId}/diagnostics`),
        api.get(`/patients/${patientId}/diagnostics/actif`),
      ]);
      const all: Diagnostic[] = allRes.data;
      const active: Diagnostic | null = activeRes.data;
      setCurrent(active);
      setAnterieurs(all.filter(d => !d.isActive));
      if (active) {
        setForm({
          diagnosticPrincipal: active.diagnosticPrincipal || '',
          diagnosticsSecondaires: active.diagnosticsSecondaires || '',
          justificationClinique: active.justificationClinique || '',
          diagnosticsDifferentiels: active.diagnosticsDifferentiels || '',
          graviteStade: active.graviteStade || '',
          medecinResponsable: active.medecinResponsable || medecinNom,
        });
        setIsEditing(false);
      } else {
        setForm({ ...emptyForm, medecinResponsable: medecinNom });
        setIsEditing(true);
      }
    } catch {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!form.diagnosticPrincipal.trim()) return;
    setIsSaving(true);
    try {
      if (current) {
        const res = await api.put(`/patients/${patientId}/diagnostics/${current.id}`, form);
        setCurrent(res.data);
      } else {
        const res = await api.post(`/patients/${patientId}/diagnostics`, form);
        setCurrent(res.data);
      }
      setIsEditing(false);
      load();
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' – ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const principalComplet = !!form.diagnosticPrincipal.trim();
  const precisionsComplet = !!form.diagnosticsSecondaires?.trim() || !!form.justificationClinique?.trim() || !!form.diagnosticsDifferentiels?.trim() || !!form.graviteStade?.trim();

  return (
    <div style={{ display: 'flex', gap: '20px', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Colonne principale ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!isEditing && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => { setForm({ ...emptyForm, medecinResponsable: medecinNom }); setIsEditing(true); setCurrent(null); }} 
              style={btnPrimary}
            >
              + Ajouter nouveau diagnostic
            </button>
          </div>
        )}

        {/* Section 01 */}
        <Section
          num="01"
          title="Diagnostic principal"
          subtitle="Diagnostic de l'épisode actuel"
          complete={principalComplet}
          open={openSections['01']}
          onToggle={() => toggleSection('01')}
          headerRight={
            current && !isEditing ? (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Dernière mise à jour</div>
                <div style={{ fontSize: '12px', color: '#1e293b', marginTop: '2px' }}>{formatDate(current.updatedAt)}</div>
                <div style={{ fontSize: '12px', color: '#1d4ed8', marginTop: '1px' }}>{current.medecinResponsable}</div>
              </div>
            ) : null
          }
        >
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>DIAGNOSTIC PRINCIPAL <span style={{ color: '#ef4444' }}>*</span></label>
            {isEditing ? (
              <input
                type="text"
                placeholder="Ex : Cholécystectomie par laparoscopie"
                value={form.diagnosticPrincipal}
                onChange={e => setForm({ ...form, diagnosticPrincipal: e.target.value })}
                style={{ ...inputStyle, border: '2px solid #3b82f6', fontSize: '14px' }}
              />
            ) : (
              <div style={{ ...inputStyle, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e293b', fontWeight: 500 }}>
                {current?.diagnosticPrincipal || '—'}
              </div>
            )}
          </div>
        </Section>

        {/* Section 02 */}
        <Section
          num="02"
          title="Précisions diagnostiques"
          subtitle="Secondaires, justification et différentiels"
          complete={precisionsComplet}
          open={openSections['02']}
          onToggle={() => toggleSection('02')}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>DIAGNOSTICS SECONDAIRES / ASSOCIÉS</label>
              <textarea
                placeholder="Détails additionnels..."
                disabled={!isEditing}
                value={form.diagnosticsSecondaires}
                onChange={e => setForm({ ...form, diagnosticsSecondaires: e.target.value })}
                style={{ ...inputStyle, height: '100px', resize: 'none', backgroundColor: isEditing ? 'white' : '#f8fafc' }}
              />
            </div>
            <div>
              <label style={labelStyle}>JUSTIFICATION CLINIQUE ET PARACLINIQUE</label>
              <textarea
                placeholder="Arguments cliniques, résultats biologiques, imagerie..."
                disabled={!isEditing}
                value={form.justificationClinique}
                onChange={e => setForm({ ...form, justificationClinique: e.target.value })}
                style={{ ...inputStyle, height: '100px', resize: 'none', backgroundColor: isEditing ? 'white' : '#f8fafc' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>DIAGNOSTICS DIFFÉRENTIELS</label>
              <textarea
                placeholder="Autres hypothèses envisagées..."
                disabled={!isEditing}
                value={form.diagnosticsDifferentiels}
                onChange={e => setForm({ ...form, diagnosticsDifferentiels: e.target.value })}
                style={{ ...inputStyle, height: '100px', resize: 'none', backgroundColor: isEditing ? 'white' : '#f8fafc' }}
              />
            </div>
            <div>
              <label style={labelStyle}>GRAVITÉ / STADE / COMPLICATIONS</label>
              <textarea
                placeholder="Ex: Stade III, Grade B, avec sepsis..."
                disabled={!isEditing}
                value={form.graviteStade}
                onChange={e => setForm({ ...form, graviteStade: e.target.value })}
                style={{ ...inputStyle, height: '100px', resize: 'none', backgroundColor: isEditing ? 'white' : '#f8fafc' }}
              />
            </div>
          </div>
        </Section>

        {/* Section 03 — Traçabilité */}
        <Section
          num="03"
          title="Traçabilité & validation"
          complete={!!current}
          open={openSections['03']}
          onToggle={() => toggleSection('03')}
        >
          {!isEditing && current && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Médecin responsable</span>
                <span style={{ fontSize: '13px', color: '#1e293b' }}>{current.medecinResponsable}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Date de saisie</span>
                <span style={{ fontSize: '13px', color: '#1e293b' }}>{formatDate(current.createdAt)}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {isEditing && (
              <>
                <button onClick={() => { setIsEditing(false); load(); }} style={btnSecondary}>Annuler</button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !form.diagnosticPrincipal.trim()}
                  style={{ ...btnPrimary, opacity: (!form.diagnosticPrincipal.trim() || isSaving) ? 0.5 : 1, cursor: !form.diagnosticPrincipal.trim() ? 'not-allowed' : 'pointer' }}
                >
                  {isSaving ? '⏳ Enregistrement...' : '✓ Valider le diagnostic'}
                </button>
              </>
            )}
          </div>
        </Section>
      </div>

      {/* ── Colonne latérale : antérieurs ── */}
      <div style={{ width: '260px', flexShrink: 0 }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>Diagnostics antérieurs</span>
          </div>
          <div style={{ padding: '14px 18px' }}>
            {anterieurs.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '20px 0', margin: 0 }}>
                Aucun diagnostic antérieur
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {anterieurs.slice(0, 6).map(d => (
                  <div key={d.id} style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
                      {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500, lineHeight: 1.3 }}>
                      {d.diagnosticPrincipal}
                    </div>
                  </div>
                ))}
                {anterieurs.length > 6 && (
                  <div style={{ fontSize: '12px', color: '#1d4ed8', textAlign: 'center', cursor: 'pointer' }}>
                    Voir tous les diagnostics →
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Composant Section ──────────────────────────────────────────────────────────
function Section({ num, title, subtitle, complete, open, onToggle, children, headerRight }: {
  num: string; title: string; subtitle?: string; complete?: boolean;
  open: boolean; onToggle: () => void; children: React.ReactNode; headerRight?: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
      <div
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            backgroundColor: complete ? '#16a34a' : '#1e293b',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700,
          }}>
            {complete
              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              : num
            }
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{title}</div>
            {subtitle && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px' }}>{subtitle}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {headerRight}
          {complete && (
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          )}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
      {open && (
        <div style={{ padding: '0 18px 18px 18px' }}>
          {children}
        </div>
      )}
      {!open && (
        <div style={{ padding: '0 18px 12px 58px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Cliquez pour ouvrir</span>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: 700,
  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
  padding: '9px 12px', fontSize: '13px', color: '#1e293b',
  outline: 'none', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box',
};
const btnPrimary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px',
  backgroundColor: '#1d4ed8', color: 'white',
  border: 'none', borderRadius: '8px', padding: '10px 20px',
  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
};
const btnSecondary: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px',
  backgroundColor: '#f8fafc', color: '#475569',
  border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 20px',
  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
  fontFamily: "'Inter', sans-serif",
};
