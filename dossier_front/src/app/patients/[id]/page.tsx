'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { fetchPatient } from '@/lib/api';
import { ObservationForm } from '@/components/DossierPatient/ObservationForm';
import { PrescriptionsTab } from '@/components/DossierPatient/PrescriptionsTab';
import { SortieTab } from '@/components/DossierPatient/SortieTab';
import { CrOperatoireTab } from '@/components/DossierPatient/CrOperatoireTab';
import { SuiviTab } from '@/components/DossierPatient/SuiviTab';
import { DiagnosticTab } from '@/components/DossierPatient/DiagnosticTab';
import HistoriqueTab from '@/components/DossierPatient/HistoriqueTab';
import { AvisTab } from '@/components/DossierPatient/AvisTab';
import dynamic from 'next/dynamic';

const ResultatsParacliniquesTab = dynamic(
  () => import('@/components/DossierPatient/ResultatsParacliniquesTab'),
  { ssr: false }
);

const TABS = [
  { key: 'observation', label: 'Observation médical' },
  { key: 'diagnostic', label: 'Diagnostic' },
  { key: 'prescription', label: 'Prescription' },
  { key: 'suivi', label: 'Suivi / Évolution' },
  { key: 'cr_operatoire', label: 'Compte-rendu opératoire' },
  { key: 'resultats', label: 'Résultats paracliniques' },
  { key: 'sortie', label: 'Sortie' },
  { key: 'historique', label: 'Historique' },
  { key: 'avis', label: 'Demandes d\'avis' },
];

const NAV_ITEMS = [
  { label: 'Tableau de bord', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>) },
  { label: 'Patient hospitalisé', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>), active: true },
  { label: 'Consultation externe', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>) },
  { label: 'Contrôle', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>) },
  { label: 'Archive', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>) },
];

export default function DossierPatientPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('observation');

  useEffect(() => {
    if (id) {
      fetchPatient(id as string)
        .then(res => setPatient(res.data))
        .catch(console.error);
    }
  }, [id]);

  if (!patient) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Inter', sans-serif", color: '#64748b', fontSize: '14px' }}>
        Chargement du dossier...
      </div>
    );
  }

  const age = patient.dateNaissance
    ? new Date().getFullYear() - new Date(patient.dateNaissance).getFullYear()
    : 64;

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        {/* HEADER identique à l'existant */}
        <div style={{ height: '60px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0, zIndex: 100 }}>
          <span style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
            CHU Andrainjato Fianarantsoa
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span style={{ position: 'absolute', top: '-5px', right: '-6px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '17px', height: '17px', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>3</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }}>Dr. Jean Pierre</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Chirurgien</div>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, border: '2px solid #e2e8f0' }}>JP</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
          {/* SIDEBAR */}
          <div style={{ width: '210px', flexShrink: 0, backgroundColor: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', paddingTop: '8px' }}>
            <div style={{ flex: 1 }}>
              {NAV_ITEMS.map((item: any) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 20px', color: item.active ? '#1d4ed8' : '#64748b', fontWeight: item.active ? 600 : 400, fontSize: '13px', cursor: 'pointer', backgroundColor: item.active ? '#eff6ff' : 'transparent', borderLeft: item.active ? '3px solid #1d4ed8' : '3px solid transparent', transition: 'all 0.15s' }}>
                  <span style={{ color: item.active ? '#1d4ed8' : '#94a3b8', flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Numéro flotte personnel</div>
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '10px', lineHeight: 1.4 }}>Liste des contacts du personnel</div>
              <button style={{ width: '100%', padding: '8px 12px', fontSize: '12px', fontWeight: 600, backgroundColor: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>voir</button>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 20px', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>
                Paramètres
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 20px', color: '#ef4444', fontSize: '13px', cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Déconnexion
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, padding: '24px 28px', overflow: 'auto' }}>
            {/* Bandeau patient identique */}
            <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 24px', marginBottom: '6px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '14px', right: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#ef4444' }}>ALLERGIES : Pénicilline</span>
                </div>
                <div style={{ backgroundColor: '#1e3a5f', color: 'white', borderRadius: '8px', padding: '5px 18px', fontSize: '13px', fontWeight: 700 }}>{patient.categorie || 'BANQUE'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 700, color: '#94a3b8', flexShrink: 0 }}>
                  {patient.prenom?.[0] || 'R'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#1d4ed8', margin: 0 }}>M. {patient.prenom} {patient.nom}</h2>
                    <span style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px 10px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>ID: #{patient.id}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                    <div><div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Groupe sanguin</div><div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{patient.groupeSanguin || 'O Rhesus Positif (O+)'}</div></div>
                    <div><div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Âge / Sexe</div><div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{age} ans / {patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</div></div>
                    <div><div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Chambre</div><div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Bloc A – Lit 12</div></div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#64748b', margin: '10px 0 14px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>Champ obligatoire <span style={{ color: '#ef4444', fontSize: '15px', lineHeight: 1 }}>*</span></div>

            {/* Onglets */}
            <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', backgroundColor: 'white' }}>
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      padding: '14px 20px', fontSize: '13px', fontWeight: activeTab === tab.key ? 600 : 400,
                      color: activeTab === tab.key ? '#1d4ed8' : '#64748b', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                      borderBottom: activeTab === tab.key ? '2px solid #1d4ed8' : '2px solid transparent',
                      background: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif", flexShrink: 0,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: '24px' }}>
                {activeTab === 'observation'   && <ObservationForm patientId={patient.id} />}
                {activeTab === 'diagnostic'    && <DiagnosticTab patientId={patient.id} medecinNom="Dr. Jean Pierre" />}
                {activeTab === 'prescription'  && <PrescriptionsTab patientId={patient.id} patient={patient} />}
                {activeTab === 'suivi'         && <SuiviTab patientId={patient.id} />}
                {activeTab === 'cr_operatoire' && <CrOperatoireTab patientId={patient.id} />}
                {activeTab === 'resultats'     && <ResultatsParacliniquesTab patientId={patient.id} />}
                {activeTab === 'sortie'        && <SortieTab patientId={patient.id} />}
                {activeTab === 'historique'    && <HistoriqueTab patientId={patient.id} />}
                {activeTab === 'avis'          && <AvisTab patientId={patient.id} serviceCourant="Chirurgie" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
