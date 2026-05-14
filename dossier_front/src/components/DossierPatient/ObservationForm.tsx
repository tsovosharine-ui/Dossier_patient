'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { ChevronDown, ChevronRight, Check, Save } from 'lucide-react';
import { ehr } from '@/lib/ehr-theme';

import {
  AntecedentsPanel,
  antecedentsHasContent,
  defaultAntecedents,
  parseAntecedentsContent,
} from '@/components/DossierPatient/AntecedentsPanel';

import {
  TraitementEnCoursPanel,
  traitementHasContent,
  defaultTraitementEnCours,
} from '@/components/DossierPatient/TraitementEnCoursPanel';

import {
  ExamenPhysiquePanel,
  examenPhysiqueHasContent,
  defaultExamenPhysique,
} from '@/components/DossierPatient/ExamenPhysiquePanel';

import {
  EtatGeneralPanel,
  etatGeneralHasContent,
  defaultEtatGeneral,
} from '@/components/DossierPatient/EtatGeneralPanel';

import {
  ExamenAppareilPanel,
  examenAppareilHasContent,
  defaultExamenAppareil,
} from '@/components/DossierPatient/ExamenAppareilPanel';

import {
  ExamensComplementairesPanel,
  examensComplementairesHasContent,
  defaultExamensComplementaires,
} from '@/components/DossierPatient/ExamensComplementairesPanel';

import {
  DiagnosticPanel,
  diagnosticHasContent,
  defaultDiagnostic,
} from '@/components/DossierPatient/DiagnosticPanel';

interface Section {
  id: string;
  title: string;
  isOpen: boolean;
  content: any;
}

interface PatientInfo {
  nom: string;
  prenom: string;
  dateNaissance: string;
  adresse: string;
  sexe: string;
  profession: string;
  contact: string;
  contactUrgence: string;
}

function isSectionComplete(section: Section, patientInfo: PatientInfo | null): boolean {
  if (section.id === '01') return !!patientInfo;
  if (section.id === '04') return antecedentsHasContent(section.content);
  if (section.id === '05') return traitementHasContent(section.content);
  if (section.id === '06') return examenPhysiqueHasContent(section.content);
  if (section.id === '07') return etatGeneralHasContent(section.content);
  if (section.id === '08') return examenAppareilHasContent(section.content);
  if (section.id === '09') return examensComplementairesHasContent(section.content);
  if (section.id === '10') return diagnosticHasContent(section.content);
  const c = section.content;
  if (typeof c === 'string') return c.trim().length > 0;
  if (c && typeof c === 'object') return Object.keys(c).length > 0;
  return false;
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: `1px solid ${ehr.border}`,
  borderRadius: 8,
  fontSize: 14,
  color: ehr.text,
  backgroundColor: ehr.white,
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: ehr.text,
  marginBottom: 6,
  display: 'block',
};

const reqStyle: React.CSSProperties = {
  color: ehr.danger,
  marginLeft: 2,
};

export function ObservationForm({ patientId }: { patientId: string }) {
  const [sections, setSections] = useState<Section[]>([
    { id: '01', title: 'État civil et identification', isOpen: true, content: {} },
    { id: '02', title: 'Motif de consultation', isOpen: false, content: '' },
    { id: '03', title: 'Histoire de la maladie', isOpen: false, content: '' },
    { id: '04', title: 'Antécédents', isOpen: false, content: defaultAntecedents() },
    { id: '05', title: 'Traitements en cours', isOpen: false, content: defaultTraitementEnCours() },
    { id: '06', title: 'Examen physique', isOpen: false, content: defaultExamenPhysique() },
    { id: '07', title: 'Etat générale conscient et aspect', isOpen: false, content: defaultEtatGeneral() },
    { id: '08', title: 'Examen neurologique (par appareil)', isOpen: false, content: defaultExamenAppareil() },
    { id: '09', title: 'Examens complémentaires', isOpen: false, content: defaultExamensComplementaires() },
    { id: '10', title: 'Diagnostic', isOpen: false, content: defaultDiagnostic() },
  ]);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get(`/patients/${patientId}`);
        const data = res.data;
        setPatientInfo({
          nom: data.nom || '',
          prenom: data.prenom || '',
          dateNaissance: data.dateNaissance || '',
          adresse: data.adresse || '',
          sexe: data.sexe === 'M' ? 'Masculin' : data.sexe === 'F' ? 'Féminin' : data.sexe || '',
          profession: data.profession || '',
          contact: data.telephone || '',
          contactUrgence: data.contactUrgence || '',
        });
      } catch (error) {
        console.error('Erreur chargement patient:', error);
      }
    };
    if (patientId) fetchPatient();
  }, [patientId]);

  useEffect(() => {
    const fetchObservation = async () => {
      try {
        const res = await api.get(`/patients/${patientId}/observation`);
        const data = res.data?.data || {};
        setSections(prev =>
          prev.map(section => {
            const raw = data[section.id] !== undefined ? data[section.id] : section.content;
            if (section.id === '04') return { ...section, content: parseAntecedentsContent(raw) };
            if (section.id === '05') return { ...section, content: Array.isArray(raw) ? raw : defaultTraitementEnCours() };
            if (section.id === '06') return { ...section, content: typeof raw === 'object' && raw !== null ? { ...defaultExamenPhysique(), ...raw } : defaultExamenPhysique() };
            if (section.id === '07') return { ...section, content: typeof raw === 'object' && raw !== null ? { ...defaultEtatGeneral(), ...raw } : defaultEtatGeneral() };
            if (section.id === '08') return { ...section, content: typeof raw === 'object' && raw !== null ? { ...defaultExamenAppareil(), ...raw } : defaultExamenAppareil() };
            if (section.id === '09') return { ...section, content: Array.isArray(raw) ? raw : defaultExamensComplementaires() };
            if (section.id === '10') return { ...section, content: typeof raw === 'object' && raw !== null ? { ...defaultDiagnostic(), ...raw } : defaultDiagnostic() };
            return { ...section, content: raw };
          })
        );
      } catch (error) {
        console.error('Erreur chargement observation:', error);
      }
    };
    if (patientId) fetchObservation();
  }, [patientId]);

  const saveObservation = useCallback(async () => {
    setSaving(true);
    try {
      const observationData = sections.reduce(
        (acc, section) => { acc[section.id] = section.content; return acc; },
        {} as Record<string, any>
      );
      await api.put(`/patients/${patientId}/observation`, { data: observationData });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  }, [sections, patientId]);

  const validerObservation = useCallback(async () => {
    setValidating(true);
    try {
      const observationData = sections.reduce(
        (acc, section) => { acc[section.id] = section.content; return acc; },
        {} as Record<string, any>
      );
      await api.post(`/patients/${patientId}/observation/valider`, { data: observationData });
      setLastSaved(new Date());
      alert('Observation validée et historique enregistré avec succès.');
    } catch (error) {
      console.error('Erreur validation:', error);
      alert("Erreur lors de la validation de l'observation.");
    } finally {
      setValidating(false);
    }
  }, [sections, patientId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (patientId) saveObservation();
    }, 1000);
    return () => clearTimeout(timer);
  }, [sections, patientId, saveObservation]);

  const toggleSection = (id: string) => {
    setSections(prev =>
      prev.map(section => (section.id === id ? { ...section, isOpen: !section.isOpen } : section))
    );
  };

  const updateSectionContent = (id: string, content: any) => {
    setSections(prev =>
      prev.map(section => (section.id === id ? { ...section, content } : section))
    );
  };

  const iconStroke = 1.75;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {sections.map(section => {
        const complete = isSectionComplete(section, patientInfo);
        return (
          <div
            key={section.id}
            style={{
              marginBottom: 10,
              border: `1px solid ${ehr.border}`,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: ehr.white,
              boxShadow: ehr.shadowCard,
            }}
          >
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                background: ehr.white,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                {complete ? (
                  <span style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: ehr.success, color: ehr.white, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={18} strokeWidth={2.5} />
                  </span>
                ) : (
                  <span style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#1e293b', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {section.id}
                  </span>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: ehr.text }}>{section.title}</div>
                  {!section.isOpen && (
                    <div style={{ fontSize: 12, color: ehr.textMuted, marginTop: 4, fontWeight: 400 }}>Cliquez pour ouvrir</div>
                  )}
                </div>
              </div>
              <span style={{ color: ehr.textMuted, display: 'flex', flexShrink: 0 }}>
                {section.isOpen ? <ChevronDown size={20} strokeWidth={iconStroke} /> : <ChevronRight size={20} strokeWidth={iconStroke} />}
              </span>
            </button>

            {section.isOpen && (
              <div style={{ padding: '20px 24px 24px', borderTop: `1px solid ${ehr.borderSoft}` }}>

                {/* ── ÉTAT CIVIL ── */}
                {section.id === '01' && patientInfo && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Nom de famille <span style={reqStyle}>*</span></label>
                      <div style={fieldStyle}>{patientInfo.nom || '—'}</div>
                    </div>
                    <div>
                      <label style={labelStyle}>Prénom(s)</label>
                      <div style={fieldStyle}>{patientInfo.prenom || '—'}</div>
                    </div>
                    <div>
                      <label style={labelStyle}>Date de naissance <span style={reqStyle}>*</span></label>
                      <div style={fieldStyle}>
                        {patientInfo.dateNaissance
                          ? new Date(patientInfo.dateNaissance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                          : '—'}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Adresse <span style={reqStyle}>*</span></label>
                      <div style={fieldStyle}>{patientInfo.adresse || '—'}</div>
                    </div>
                    <div>
                      <label style={labelStyle}>Sexe <span style={reqStyle}>*</span></label>
                      <div style={fieldStyle}>{patientInfo.sexe || '—'}</div>
                    </div>
                    <div>
                      <label style={labelStyle}>Profession</label>
                      <div style={fieldStyle}>{patientInfo.profession || '—'}</div>
                    </div>
                    <div>
                      <label style={labelStyle}>Contact patient</label>
                      <div style={fieldStyle}>{patientInfo.contact || '—'}</div>
                    </div>
                    <div>
                      <label style={labelStyle}>Contact urgence <span style={reqStyle}>*</span></label>
                      <div style={fieldStyle}>{patientInfo.contactUrgence || '—'}</div>
                    </div>
                  </div>
                )}

                {/* ── MOTIF DE CONSULTATION ── */}
                {section.id === '02' && (
                  <textarea
                    value={section.content}
                    onChange={e => updateSectionContent('02', e.target.value)}
                    rows={4}
                    style={{
                      width: '100%', padding: 12, border: `1px solid ${ehr.border}`, borderRadius: 8,
                      fontFamily: 'inherit', fontSize: 14, backgroundColor: ehr.inputBg, color: ehr.text, resize: 'vertical'
                    }}
                    placeholder="Saisir motif de consultation..."
                  />
                )}

                {section.id === '03' && (
                  <textarea
                    value={section.content}
                    onChange={e => updateSectionContent('03', e.target.value)}
                    rows={6}
                    style={{
                      width: '100%', padding: 12, border: `1px solid ${ehr.border}`, borderRadius: 8,
                      fontFamily: 'inherit', fontSize: 14, backgroundColor: ehr.inputBg, color: ehr.text, resize: 'vertical'
                    }}
                    placeholder="Saisir histoire de la maladie..."
                  />
                )}

                {section.id === '04' && <AntecedentsPanel value={section.content} onChange={next => updateSectionContent('04', next)} />}
                {section.id === '05' && <TraitementEnCoursPanel value={section.content} onChange={next => updateSectionContent('05', next)} />}
                {section.id === '06' && <ExamenPhysiquePanel value={section.content} onChange={next => updateSectionContent('06', next)} />}
                {section.id === '07' && <EtatGeneralPanel value={section.content} onChange={next => updateSectionContent('07', next)} />}
                {section.id === '08' && <ExamenAppareilPanel value={section.content} onChange={next => updateSectionContent('08', next)} />}
                {section.id === '09' && <ExamensComplementairesPanel value={section.content} onChange={next => updateSectionContent('09', next)} />}
                {section.id === '10' && <DiagnosticPanel value={section.content} onChange={next => updateSectionContent('10', next)} />}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: ehr.textMuted, marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {saving && <Save size={14} strokeWidth={iconStroke} />}
          {saving ? 'Sauvegarde...' : lastSaved ? `Dernière sauvegarde : ${lastSaved.toLocaleTimeString('fr-FR')}` : 'Prêt'}
        </div>
        <button
          onClick={validerObservation}
          disabled={validating}
          style={{
            backgroundColor: ehr.primary, color: ehr.white, border: 'none', borderRadius: 6,
            padding: '8px 16px', fontSize: 14, fontWeight: 600,
            cursor: validating ? 'not-allowed' : 'pointer', opacity: validating ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          {validating ? 'Validation...' : "Valider l'observation"}
        </button>
      </div>
    </div>
  );
}
