'use client';

import { useState } from 'react';
import MedicaleForm from '@/components/prescription/MedicaleForm';
import NonMedicaleForm from '@/components/prescription/NonMedicaleForm';
import SurveillanceForm from '@/components/prescription/SurveillanceForm';
import TransfusionForm from '@/components/prescription/TransfusionForm';
import BlocForm from '@/components/prescription/BlocForm';
import LaboForm from '@/components/prescription/para/LaboForm';
import ImagerieForm from '@/components/prescription/para/ImagerieForm';
import AnapathForm from '@/components/prescription/para/AnapathForm';
import EEGForm from '@/components/prescription/para/EEGForm';
import KineForm from '@/components/prescription/para/KineForm';
import DiaryseForm from '@/components/prescription/para/DiaryseForm';
import EndoscopieForm from '@/components/prescription/para/EndoscopieForm';
import HistoriquePrescriptions from '@/components/prescription/HistoriquePrescriptions';

type Section = 'med' | 'nm' | 'surv' | 'trans' | 'bloc' | 'labo' | 'imag' | 'ana' | 'eeg' | 'kine' | 'dial' | 'endo' | 'histo' | 'para';

const mainItems = [
  { id: 'med',   icon: 'medication',       label: 'Médicamenteuse' },
  { id: 'nm',    icon: 'self_care',        label: 'Non Médicamenteuse' },
  { id: 'surv',  icon: 'monitor_heart',    label: 'Surveillance' },
  { id: 'trans', icon: 'bloodtype',        label: 'Transfusion' },
  { id: 'para', icon: 'biotech', label: 'Para-clinique' },
  { id: 'bloc',  icon: 'medical_services', label: 'Bloc Opératoire' },
  { id: 'histo', icon: 'history',          label: 'Historique' },
];

const paraItems = [
  { id: 'labo', icon: 'science',    label: 'Laboratoire' },
  { id: 'imag', icon: 'radiology',  label: 'Imagerie' },
  { id: 'eeg',  icon: 'neurology',  label: 'EEG' },
  { id: 'kine', icon: 'exercise',   label: 'Kinésithérapie' },
  { id: 'endo', icon: 'visibility', label: 'Endoscopie' },
  { id: 'dial', icon: 'water_full', label: 'Dialyse' },
  { id: 'ana',  icon: 'biotech',    label: 'Anapath' },
];

interface Props {
  patientId: string;
  patient?: any;
  prescripteur?: any;
}

export function PrescriptionsTab({ patientId, patient, prescripteur }: Props) {
  const [activeSection, setActiveSection] = useState<Section>('med');
  const [activeParaSection, setActiveParaSection] = useState<Section>('labo');

  const currentSection = activeSection === 'histo' ? 'histo' : (activeSection === 'para' ? activeParaSection : activeSection);

  const patientData = {
    id: patientId,
    idPermanent: patient?.idPermanent || patientId,
    nom: patient?.nom || '',
    prenom: patient?.prenom || '',
    sexe: patient?.sexe || 'M',
    dateNaissance: patient?.dateNaissance,
    allergies: patient?.allergies || [],
  };

  const prescripteurData = prescripteur || { id: 'f24b4c27-fa00-4035-8abe-f2cffd3b231e', nom: 'RASOLO', prenom: 'Michel', poste: 'Médecin interniste' };

  return (
    <div style={{ margin: '-24px' }}>
      {/* NAV PRINCIPALE */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', overflowX: 'auto' }}>
        {mainItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as Section)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 4, padding: '10px 18px',
              border: 'none', borderBottom: activeSection === item.id ? '3px solid #003178' : '3px solid transparent',
              background: 'none', cursor: 'pointer',
              color: activeSection === item.id ? '#003178' : '#6b7280',
              fontSize: 11.5, fontWeight: activeSection === item.id ? 700 : 500,
              whiteSpace: 'nowrap', flexShrink: 0, transition: 'all .15s',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            <span className="ms" style={{ fontSize: 20, color: activeSection === item.id ? '#003178' : '#6b7280' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* SOUS-NAV PARA */}
      {activeSection === 'para' && (
        <div style={{ background: '#e8eef8', borderBottom: '2px solid #d0dcf4', display: 'flex', overflowX: 'auto' }}>
          {paraItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveParaSection(item.id as Section)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 14px', border: 'none', background: 'none',
                cursor: 'pointer', fontSize: 12, fontWeight: activeParaSection === item.id ? 700 : 500,
                color: '#003178', whiteSpace: 'nowrap', flexShrink: 0,
                borderBottom: activeParaSection === item.id ? '2px solid #003178' : '2px solid transparent',
                fontFamily: 'DM Sans, sans-serif', opacity: activeParaSection === item.id ? 1 : 0.65,
              }}
            >
              <span className="ms" style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* CONTENU */}
      <div style={{ padding: 16, background: '#f0f2f7', minHeight: 400 }}>
        {currentSection === 'med'   && <MedicaleForm     patient={patientData} prescripteur={prescripteurData} />}
        {currentSection === 'nm'    && <NonMedicaleForm  patient={patientData} prescripteur={prescripteurData} />}
        {currentSection === 'surv'  && <SurveillanceForm patient={patientData} prescripteur={prescripteurData} />}
        {currentSection === 'trans' && <TransfusionForm  patient={patientData} prescripteur={prescripteurData} />}
        {currentSection === 'bloc'  && <BlocForm         patient={patientData} prescripteur={prescripteurData} />}
        {currentSection === 'labo'  && <LaboForm         patient={patientData} prescripteur={prescripteurData} />}
        {currentSection === 'imag'  && <ImagerieForm     patient={patientData} prescripteur={prescripteurData} />}
        {currentSection === 'ana'   && <AnapathForm      patient={patientData} prescripteur={prescripteurData} />}
        {currentSection === 'eeg'   && <EEGForm          patient={patientData} prescripteur={prescripteurData} />}
        {currentSection === 'kine'  && <KineForm         patient={patientData} prescripteur={prescripteurData} />}
        {currentSection === 'dial'  && <DiaryseForm      patient={patientData} prescripteur={prescripteurData} />}
        {currentSection === 'endo'  && <EndoscopieForm   patient={patientData} prescripteur={prescripteurData} />}
        {currentSection === 'histo' && <HistoriquePrescriptions patientId={patientId} />}
      </div>
    </div>
  );
}
