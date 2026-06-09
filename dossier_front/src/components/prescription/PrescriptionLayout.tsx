"use client";
import { useState } from 'react';
import NotificationBell from '@/components/ui/NotificationBell';

export type Section =
  | 'med' | 'nm' | 'surv' | 'trans'
  | 'labo' | 'imag' | 'eeg' | 'kine' | 'endo' | 'dial' | 'ana'
  | 'bloc' | 'para' | 'hist';

interface PrescriptionLayoutProps {
  patient?: {
    nom?: string; prenom?: string;
    dateNaissance?: string;
    idPermanent?: string;
    allergies?: string[];
    sexe?: string;
    categorie?: string;
    groupeSanguin?: string;
    chambre?: string;
    lit?: string;
    service?: string;
    typeHospital?: string;
  };
  prescripteur?: { id?: string; nom?: string; prenoms?: string; poste?: string; service?: string };
  children: (activeSection: Section) => React.ReactNode;
}

function calcAge(dateNaissance?: string): number | null {
  if (!dateNaissance) return null;
  const diff = Date.now() - new Date(dateNaissance).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function PrescriptionLayout({ patient, prescripteur, children }: PrescriptionLayoutProps) {
  const [activeSection, setActiveSection] = useState<Section>('med');
  const [activeParaSection, setActiveParaSection] = useState<Section>('labo');

  const mainItems = [
    {id:'med',  icon:'medication',       label:'Médicamenteuse'},
    {id:'nm',   icon:'self_care',        label:'Non Médicamenteuse'},
    {id:'surv', icon:'monitor_heart',    label:'Surveillance'},
    {id:'trans',icon:'bloodtype',        label:'Transfusion'},
    {id:'para', icon:'biotech',          label:'Para-clinique'},
    {id:'bloc', icon:'medical_services', label:'Bloc Opératoire'},
    {id:'hist', icon:'history',          label:'Historique'},
  ];

  const paraItems = [
    {id:'labo', icon:'science',    label:'Laboratoire'},
    {id:'imag', icon:'radiology',  label:'Imagerie'},
    {id:'eeg',  icon:'neurology',  label:'EEG'},
    {id:'kine', icon:'exercise',   label:'Kinésithérapie'},
    {id:'endo', icon:'visibility', label:'Endoscopie'},
    {id:'dial', icon:'water_full', label:'Dialyse'},
    {id:'ana',  icon:'biotech',    label:'Anapath'},
  ];

  const currentSection = activeSection === 'para' ? activeParaSection : activeSection;
  const initiale = prescripteur?.nom?.[0]?.toUpperCase() || 'N';
  const age = calcAge(patient?.dateNaissance);
  const sexeLabel = patient?.sexe === 'M' ? 'Masculin' : patient?.sexe === 'F' ? 'Féminin' : patient?.sexe;
  const chambreLabel = [patient?.chambre, patient?.lit].filter(Boolean).join(' — ');

  return (
    <div style={{display:'flex', flexDirection:'column', flex:1, overflow:'hidden'}}>

      {/* HEADER BLEU */}
      <div style={{background:'var(--navy)', flexShrink:0, padding:'0 16px'}}>
        <div style={{maxWidth:'900px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:52}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <button style={{background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', padding:0}} onClick={() => window.history.back()}>
              <span className="ms" style={{fontSize:22, color:'#fff'}}>arrow_back_ios</span>
            </button>
            <span style={{color:'#fff', fontSize:17, fontWeight:700, letterSpacing:'.2px'}}>Prescriptions</span>
            {prescripteur && (
              <span style={{color:'rgba(255,255,255,0.7)', fontSize:12, marginLeft:8}}>
                Dr {prescripteur.nom} — {prescripteur.poste}
              </span>
            )}
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <NotificationBell userId={prescripteur?.id || 'guest'} service={prescripteur?.poste} />
            <div style={{width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:15, fontWeight:700}}>
              {initiale}
            </div>
          </div>
        </div>
      </div>

      {/* BARRE PATIENT */}
      {patient && (
        <div style={{
          background:'#fff', borderBottom:'1px solid var(--bdr)',
          padding:'10px 16px', flexShrink:0,
        }}>
          <div style={{maxWidth:'900px', margin:'0 auto', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap'}}>

            {/* ID + Nom */}
            <div style={{display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0}}>
              <div style={{
                background:'var(--navy)', color:'#fff', borderRadius:6,
                padding:'3px 9px', fontSize:11, fontWeight:700, flexShrink:0,
              }}>
                {patient.idPermanent}
              </div>
              <div>
                <div style={{fontWeight:700, fontSize:15, color:'var(--txt)'}}>
                  {patient.sexe === 'M' ? 'M.' : patient.sexe === 'F' ? 'Mme' : ''} {patient.nom} {patient.prenom}
                </div>
                <div style={{display:'flex', alignItems:'center', gap:6, marginTop:2, flexWrap:'wrap'}}>
                  {/* Groupe sanguin */}
                  {patient.groupeSanguin && (
                    <span style={{fontSize:11, color:'var(--txt2)', fontWeight:500}}>
                      {patient.groupeSanguin}
                    </span>
                  )}
                  {patient.groupeSanguin && (age || sexeLabel) && <div style={{width:3, height:3, borderRadius:'50%', background:'var(--txt3)'}}/>}
                  {/* Âge / Sexe */}
                  {(age || sexeLabel) && (
                    <span style={{fontSize:11, color:'var(--txt2)'}}>
                      {[age ? `${age} ans` : null, sexeLabel].filter(Boolean).join(' / ')}
                    </span>
                  )}
                  {(chambreLabel || patient?.service) && <div style={{width:3, height:3, borderRadius:'50%', background:'var(--txt3)'}}/>}
                  {patient?.service && (
                    <span style={{fontSize:11, color:'var(--txt2)'}}>
                      {patient.service}
                    </span>
                  )}
                  {chambreLabel && <div style={{width:3, height:3, borderRadius:'50%', background:'var(--txt3)'}}/>}
                  {/* Chambre */}
                  {chambreLabel && (
                    <span style={{fontSize:11, color:'var(--txt2)'}}>
                      {patient.typeHospital && `${patient.typeHospital} — `}{chambreLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Catégorie */}
            {patient.categorie && (
              <div style={{
                background:'var(--navy)', color:'#fff',
                borderRadius:6, padding:'3px 10px',
                fontSize:11, fontWeight:700, flexShrink:0,
              }}>
                {patient.categorie}
              </div>
            )}

            {/* Allergies */}
            {patient.allergies && patient.allergies.length > 0 && (
              <div style={{
                background:'#fef3c7', border:'1px solid #fbbf24',
                borderRadius:6, padding:'3px 8px',
                fontSize:11, fontWeight:600, color:'#92400e',
                display:'flex', alignItems:'center', gap:4, flexShrink:0,
              }}>
                <span className="ms" style={{fontSize:14}}>warning</span>
                Allergies : {patient.allergies.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* NAVIGATION PRINCIPALE */}
      <div style={{background:'var(--card)', borderBottom:'1px solid var(--bdr)', flexShrink:0}}>
        <div style={{maxWidth:'900px', margin:'0 auto', display:'flex', overflowX:'auto', gap:0, justifyContent:'center'}}>
          {mainItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button key={item.id}
                onClick={() => setActiveSection(item.id as Section)}
                style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                  padding:'10px 14px', border:'none', background:'none', cursor:'pointer',
                  borderBottom: isActive ? '2px solid var(--navy)' : '2px solid transparent',
                  color: isActive ? 'var(--navy)' : 'var(--txt2)',
                  fontWeight: isActive ? 700 : 500, fontSize:11,
                  whiteSpace:'nowrap', transition:'all .15s', flexShrink:0,
                }}>
                <span className="ms" style={{fontSize:20}}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SOUS-NAVIGATION PARA-CLINIQUE */}
      {activeSection === 'para' && (
        <div style={{background:'var(--navy-lt)', borderBottom:'1px solid var(--navy-mid)', flexShrink:0}}>
          <div style={{maxWidth:'900px', margin:'0 auto', display:'flex', overflowX:'auto', gap:0, justifyContent:'center'}}>
            {paraItems.map(item => {
              const isActive = activeParaSection === item.id;
              return (
                <button key={item.id}
                  onClick={() => setActiveParaSection(item.id as Section)}
                  style={{
                    display:'flex', alignItems:'center', gap:5,
                    padding:'8px 12px', border:'none', background:'none', cursor:'pointer',
                    borderBottom: isActive ? '2px solid var(--navy)' : '2px solid transparent',
                    color: isActive ? 'var(--navy)' : 'var(--txt2)',
                    fontWeight: isActive ? 700 : 500, fontSize:11,
                    whiteSpace:'nowrap', transition:'all .15s', flexShrink:0,
                  }}>
                  <span className="ms" style={{fontSize:16}}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENU */}
      <div style={{flex:1, overflowY:'auto'}}>
        <div style={{maxWidth:'900px', margin:'0 auto', padding:'16px'}}>
          {children(currentSection)}
        </div>
      </div>

    </div>
  );
}
