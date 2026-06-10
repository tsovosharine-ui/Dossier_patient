"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const FILTRES = [
  { id: 'all',   label: 'Tout',             icon: 'list' },
  { id: 'med',   label: 'Médicamenteuse',   icon: 'medication' },
  { id: 'nm',    label: 'Non Médicamenteuse', icon: 'self_care' },
  { id: 'surv',  label: 'Surveillance',     icon: 'monitor_heart' },
  { id: 'trans', label: 'Transfusion',      icon: 'bloodtype' },
  { id: 'labo',  label: 'Laboratoire',      icon: 'science' },
  { id: 'imag',  label: 'Imagerie',         icon: 'radiology' },
  { id: 'eeg',   label: 'EEG',              icon: 'neurology' },
  { id: 'kine',  label: 'Kinésithérapie',   icon: 'exercise' },
  { id: 'endo',  label: 'Endoscopie',       icon: 'visibility' },
  { id: 'dial',  label: 'Dialyse',          icon: 'water_full' },
  { id: 'ana',   label: 'Anapath',          icon: 'biotech' },
  { id: 'bloc',  label: 'Bloc Opératoire',  icon: 'medical_services' },
];

const TYPE_COLORS: Record<string, string> = {
  med:   '#3b82f6', nm:   '#8b5cf6', surv:  '#10b981',
  trans: '#ef4444', labo: '#f59e0b', imag:  '#06b6d4',
  eeg:   '#6366f1', kine: '#84cc16', endo:  '#f97316',
  dial:  '#14b8a6', ana:  '#ec4899', bloc:  '#1e40af',
};

interface PrescriptionItem {
  _type: string;
  createdAt?: string;
  date?: string;
  statut?: string;
  remarque?: string;
  remarques?: string;
  instructions?: string;
  description?: string;
  nom?: string;
  medicament?: string;
  type?: string;
  parametre?: string;
  produit?: string;
  groupe?: string;
  examen?: string;
  analyse?: string;
  seance?: string;
  seances?: any[];
  intervention?: string;
  urgence?: string;
  alertes?: string;
  renseignements?: string;
  notes?: string;
  notifierInfirmier?: boolean;
  medicaments?: PrescriptionItem[];
  items?: PrescriptionItem[];
  parametres?: PrescriptionItem[];
  analyses?: string[];
  examens?: Record<string, string[]>;
  typeEEG?: string;
  typeKine?: string;
  diagnostic?: string;
  contreIndications?: string[];
  objectifs?: string;
  typeExamen?: string;
  typeDialyse?: string;
  data?: Record<string, unknown>;
  libelle?: string;
  risqueHemorragique?: string;
  typeChirurgie?: string;
  chirurgien?: string;
  consignes?: string;
  dateIntervention?: string;
  atcdTransfusion?: boolean;
  incident?: string;
  groupage?: string;
  hb?: string;
  plaquettes?: string;
  quantite?: string;
  datePrevue?: string;
  typeLabel?: string;
  duree?: string;
  frequence?: string;
  dateDebut?: string;
  heureDebut?: string;
  seuil?: string;
  dose?: string;
  voie?: string;
}

interface Props {
  patient?: { id?: string, idPermanent?: string };
  prescripteur?: { id?: string };
  onNewPrescription?: () => void;
}

export default function HistoriqueForm({ patient, onNewPrescription }: Props) {
  const [filtre, setFiltre] = useState('all');
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<PrescriptionItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchHistorique() {
      setLoading(true);
      setError('');
      try {
        const patientId = patient?.id;
        if (!patientId) { setError('ID patient manquant'); setLoading(false); return; }

        // Utiliser l'endpoint générique avec /active pour récupérer toutes les prescriptions actives
        const url = `${API_URL}/patients/${patientId}/prescriptions/active`;
        const res = await api.get(url);
        const allPrescriptions = Array.isArray(res.data) ? res.data : [];

        // Mapping des types de l'API vers les types utilisés dans l'historique
        const typeMapping: Record<string, string> = {
          'medicament': 'med',
          'non_medicament': 'nm',
          'surveillance': 'surv',
          'transfusion': 'trans',
          'bloc': 'bloc',
          'paraclinique': 'para', // Pour labo, imag, eeg, kine, endo, dial, ana
        };

        // Parser le contenu JSON et ajouter le type
        const results: PrescriptionItem[] = allPrescriptions.map((p: any) => {
          let parsed: any = {};
          try { parsed = JSON.parse(p.contenu || '{}'); } catch {}

          // Déterminer le sous-type pour paraclinique
          let subType: string | undefined = undefined;
          if (p.type === 'paraclinique') {
            // Ignorer les prescriptions paracliniques avec seulement urgence (données incomplètes)
            const keys = Object.keys(parsed);
            if (keys.length === 1 && keys[0] === 'urgence') {
              // Ne pas inclure cette prescription dans les résultats
              return null;
            }
            if (parsed.analyses) subType = 'labo';
            else if (parsed.examens) subType = 'imag';
            else if (parsed.typeEEG) subType = 'eeg';
            else if (parsed.typeKine || parsed.seances) subType = 'kine';
            else if (parsed.typeDialyse) subType = 'dial';
            else if (parsed.typeExamen) {
              // Distinguer endo et ana
              subType = parsed.typeExamen?.toLowerCase().includes('endoscop') ? 'endo' : 'ana';
            }
          }

          const finalType = subType || typeMapping[p.type] || p.type;

          return {
            ...p,
            ...parsed,
            _type: finalType,
          };
        }).filter((item): item is PrescriptionItem => item !== null);

        // Filtrer par type si nécessaire
        const filtered = filtre === 'all'
          ? results
          : results.filter(item => item._type === filtre);

        // Trier par date décroissante
        filtered.sort((a, b) => {
          const da = new Date(a.createdAt || a.date || 0).getTime();
          const db = new Date(b.createdAt || b.date || 0).getTime();
          return db - da;
        });

        setItems(filtered);
      } catch (e: unknown) {
        setError('Erreur lors du chargement : ' + (e instanceof Error ? e.message : String(e)));
      } finally {
        setLoading(false);
      }
    }

    fetchHistorique();
  }, [filtre, patient?.id]);

  function formatDate(dateStr?: string) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }

  function getTypeLabel(type: string) {
    const label = FILTRES.find(f => f.id === type)?.label;
    if (label) return label;
    // Mapping de secours pour les types qui ne sont pas dans FILTRES
    const fallbackLabels: Record<string, string> = {
      'med': 'Médicamenteuse',
      'nm': 'Non Médicamenteuse',
      'surv': 'Surveillance',
      'trans': 'Transfusion',
      'labo': 'Laboratoire',
      'imag': 'Imagerie',
      'eeg': 'EEG',
      'kine': 'Kinésithérapie',
      'endo': 'Endoscopie',
      'dial': 'Dialyse',
      'ana': 'Anapath',
      'bloc': 'Bloc Opératoire',
      'para': 'Paraclinique',
    };
    return fallbackLabels[type] || type;
  }

  function getResume(item: PrescriptionItem, type: string) {
    switch (type) {
      case 'med':   return item.medicament || item.nom || 'Médicament';
      case 'nm':    return item.type || item.description || 'Non médicamenteuse';
      case 'surv':  return item.parametre || item.type || 'Surveillance';
      case 'trans': return item.produit || item.groupe || 'Transfusion';
      case 'labo':
        if (item.analyses && Array.isArray(item.analyses) && item.analyses.length > 0) {
          return `${item.analyses.length} analyse${item.analyses.length > 1 ? 's' : ''}`;
        }
        return 'Analyse laboratoire';
      case 'imag':
        if (item.examens && typeof item.examens === 'object') {
          const count = Object.values(item.examens).flat().length;
          return `${count} examen${count > 1 ? 's' : ''}`;
        }
        return 'Imagerie';
      case 'eeg':   return item.typeEEG || 'EEG';
      case 'kine':
        if (item.seances && Array.isArray(item.seances) && item.seances.length > 0) {
          return `${item.seances.length} séance${item.seances.length > 1 ? 's' : ''}`;
        }
        return item.typeKine || 'Kinésithérapie';
      case 'endo':  return item.typeExamen || 'Endoscopie';
      case 'dial':
        if (item.seances && Array.isArray(item.seances) && item.seances.length > 0) {
          return `${item.seances.length} séance${item.seances.length > 1 ? 's' : ''}`;
        }
        return item.typeDialyse || 'Dialyse';
      case 'ana':   return item.typeExamen || 'Anapath';
      case 'bloc':  return item.intervention || item.type || 'Bloc opératoire';
      case 'para':  return 'Paraclinique (données incomplètes)';
      default:      return item.description || item.nom || '—';
    }
  }

  function handleItemClick(item: PrescriptionItem) {
    setSelectedItem(item);
    setShowModal(true);
  }

  function renderDetailField(label: string, value: unknown) {
    if (value === undefined || value === null || value === '') return null;
    return (
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt3)' }}>{label}: </span>
        <span style={{ fontSize: 12, color: 'var(--txt)' }}>{String(value)}</span>
      </div>
    );
  }

  function getUrgenceLabel(u?: string) {
    if (!u) return 'Non spécifiée';
    const urgency = u.toLowerCase();
    switch (urgency) {
      case 'n':
      case 'normale':
      case 'normal':
        return 'Normale (non urgente)';
      case 'u':
      case 'urgente':
      case 'urgent':
        return 'Urgente (prioritaire)';
      case 'tu':
      case 'stat':
      case 'très urgente':
      case 'urgence vitale':
        return 'STAT (urgence vitale - immédiate)';
      default:
        // Si c'est déjà un texte descriptif, le retourner tel quel
        if (urgency.length > 2) {
          return u.charAt(0).toUpperCase() + u.slice(1);
        }
        return u;
    }
  }

  function renderPrescriptionDetails(item: PrescriptionItem, type: string) {
    const color = TYPE_COLORS[type] || 'var(--navy)';

    switch (type) {
      case 'med':
        return (
          <div>
            {item.remarques && renderDetailField('Remarques générales', item.remarques)}
            {item.notifierInfirmier !== undefined && renderDetailField('Notifier infirmier', item.notifierInfirmier ? 'Oui' : 'Non')}
            {item.medicaments && Array.isArray(item.medicaments) && item.medicaments.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: color, marginBottom: 8 }}>Médicaments prescrits:</div>
                {item.medicaments.map((med: PrescriptionItem, idx: number) => (
                  <div key={idx} style={{ background: 'var(--bg2)', padding: 10, borderRadius: 6, marginBottom: 8 }}>
                    {renderDetailField('Nom', med.nom)}
                    {renderDetailField('Dose', med.dose)}
                    {renderDetailField('Quantité', med.quantite)}
                    {renderDetailField('Voie', med.voie)}
                    {renderDetailField('Fréquence', med.frequence)}
                    {renderDetailField('Durée', med.duree)}
                    {renderDetailField('Date de début', med.dateDebut)}
                    {renderDetailField('Heure de début', med.heureDebut)}
                    {renderDetailField('Instructions', med.instructions)}
                    {renderDetailField('Remarques', med.remarques)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'nm':
        return (
          <div>
            {item.notifierInfirmier !== undefined && renderDetailField('Notifier infirmier', item.notifierInfirmier ? 'Oui' : 'Non')}
            {item.items && Array.isArray(item.items) && item.items.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: color, marginBottom: 8 }}>Prescriptions:</div>
                {item.items.map((itm: PrescriptionItem, idx: number) => (
                  <div key={idx} style={{ background: 'var(--bg2)', padding: 10, borderRadius: 6, marginBottom: 8 }}>
                    {renderDetailField('Type', itm.typeLabel || itm.type)}
                    {renderDetailField('Description', itm.description)}
                    {renderDetailField('Durée', itm.duree)}
                    {renderDetailField('Fréquence', itm.frequence)}
                    {renderDetailField('Date de début', itm.dateDebut)}
                    {renderDetailField('Heure de début', itm.heureDebut)}
                    {renderDetailField('Instructions', itm.instructions)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'surv':
        return (
          <div>
            {renderDetailField('Notes', item.notes)}
            {item.notifierInfirmier !== undefined && renderDetailField('Notifier infirmier', item.notifierInfirmier ? 'Oui' : 'Non')}
            {item.parametres && Array.isArray(item.parametres) && item.parametres.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: color, marginBottom: 8 }}>Paramètres à surveiller:</div>
                {item.parametres.map((param: PrescriptionItem, idx: number) => (
                  <div key={idx} style={{ background: 'var(--bg2)', padding: 10, borderRadius: 6, marginBottom: 8 }}>
                    {renderDetailField('Paramètre', param.parametre)}
                    {renderDetailField('Fréquence', param.frequence)}
                    {renderDetailField('Durée', param.duree)}
                    {renderDetailField('Seuil', param.seuil)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'trans':
        return (
          <div>
            {renderDetailField('Urgence', getUrgenceLabel(item.urgence))}
            {renderDetailField('Alertes', item.alertes)}
            {renderDetailField('Renseignements cliniques', item.renseignements)}
            {renderDetailField('Antécédents transfusionnels', item.atcdTransfusion ? 'Oui' : 'Non')}
            {renderDetailField('Incidents précédents', item.incident)}
            {renderDetailField('Groupage sanguin', item.groupage)}
            {renderDetailField('Hémoglobine', item.hb)}
            {renderDetailField('Produit', item.produit)}
            {renderDetailField('Plaquettes', item.plaquettes)}
            {renderDetailField('Quantité', item.quantite)}
            {renderDetailField('Date prévue', item.datePrevue)}
            {renderDetailField('Notes', item.notes)}
          </div>
        );

      case 'labo':
        return (
          <div>
            {renderDetailField('Urgence', getUrgenceLabel(item.urgence))}
            {renderDetailField('Alertes', item.alertes)}
            {renderDetailField('Renseignements cliniques', item.renseignements)}
            {item.analyses && Array.isArray(item.analyses) && item.analyses.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: color, marginBottom: 8 }}>Analyses demandées:</div>
                <div style={{ background: 'var(--bg2)', padding: 10, borderRadius: 6 }}>
                  {item.analyses.map((analyse: string, idx: number) => (
                    <div key={idx} style={{ fontSize: 12, marginBottom: 4 }}>• {analyse}</div>
                  ))}
                </div>
              </div>
            )}
            {renderDetailField('Notes', item.notes)}
          </div>
        );

      case 'imag':
        return (
          <div>
            {renderDetailField('Urgence', getUrgenceLabel(item.urgence))}
            {renderDetailField('Alertes', item.alertes)}
            {renderDetailField('Renseignements cliniques', item.renseignements)}
            {item.examens && typeof item.examens === 'object' && Object.keys(item.examens).length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: color, marginBottom: 8 }}>Examens demandés:</div>
                {Object.entries(item.examens).map(([type, exams]: [string, string[]]) => (
                  <div key={type} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt3)' }}>{type}:</div>
                    {Array.isArray(exams) && exams.map((exam: string, idx: number) => (
                      <div key={idx} style={{ fontSize: 12, marginLeft: 8 }}>• {exam}</div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {renderDetailField('Notes', item.notes)}
          </div>
        );

      case 'eeg':
        return (
          <div>
            {renderDetailField('Urgence', getUrgenceLabel(item.urgence))}
            {renderDetailField('Alertes', item.alertes)}
            {renderDetailField('Renseignements cliniques', item.renseignements)}
            {renderDetailField("Type d'EEG", item.typeEEG)}
            {renderDetailField('Remarques', item.remarques)}
          </div>
        );

      case 'kine':
        return (
          <div>
            {renderDetailField('Urgence', getUrgenceLabel(item.urgence))}
            {renderDetailField('Alertes', item.alertes)}
            {renderDetailField('Renseignements cliniques', item.renseignements)}
            {renderDetailField('Type de kinésithérapie', item.typeKine)}
            {renderDetailField('Diagnostic', item.diagnostic)}
            {item.seances && Array.isArray(item.seances) && item.seances.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: color, marginBottom: 8 }}>Séances:</div>
                {item.seances.map((seance: any, idx: number) => (
                  <div key={idx} style={{ background: 'var(--bg2)', padding: 10, borderRadius: 6, marginBottom: 8 }}>
                    {renderDetailField('Date', seance.date)}
                    {renderDetailField('Durée', seance.duree)}
                    {renderDetailField('Fréquence', seance.frequence)}
                  </div>
                ))}
              </div>
            )}
            {item.contreIndications && Array.isArray(item.contreIndications) && item.contreIndications.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt3)' }}>Contre-indications:</div>
                {item.contreIndications.map((ci: string, idx: number) => (
                  <div key={idx} style={{ fontSize: 12, marginLeft: 8 }}>• {ci}</div>
                ))}
              </div>
            )}
            {renderDetailField('Objectifs', item.objectifs)}
            {renderDetailField('Remarques', item.remarques)}
            {renderDetailField('Notes', item.notes)}
          </div>
        );

      case 'endo':
        return (
          <div>
            {renderDetailField('Urgence', getUrgenceLabel(item.urgence))}
            {renderDetailField('Alertes', item.alertes)}
            {renderDetailField('Renseignements cliniques', item.renseignements)}
            {renderDetailField("Type d'examen", item.typeExamen)}
            {renderDetailField('Remarques', item.remarques)}
            {renderDetailField('Notes', item.notes)}
          </div>
        );

      case 'dial':
        return (
          <div>
            {renderDetailField('Urgence', getUrgenceLabel(item.urgence))}
            {renderDetailField('Alertes', item.alertes)}
            {renderDetailField('Renseignements cliniques', item.renseignements)}
            {renderDetailField('Type de dialyse', item.typeDialyse)}
            {item.seances && Array.isArray(item.seances) && item.seances.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: color, marginBottom: 8 }}>Séances:</div>
                {item.seances.map((seance: any, idx: number) => (
                  <div key={idx} style={{ background: 'var(--bg2)', padding: 10, borderRadius: 6, marginBottom: 8 }}>
                    {renderDetailField('Date', seance.date)}
                    {renderDetailField('Durée', seance.duree)}
                    {renderDetailField('Fréquence', seance.frequence)}
                  </div>
                ))}
              </div>
            )}
            {renderDetailField('Remarques', item.remarques)}
            {renderDetailField('Notes', item.notes)}
          </div>
        );

      case 'ana':
        return (
          <div>
            {renderDetailField('Urgence', getUrgenceLabel(item.urgence))}
            {renderDetailField('Alertes', item.alertes)}
            {renderDetailField("Type d'examen", item.typeExamen)}
            {renderDetailField('Renseignements cliniques', item.renseignements)}
            {item.data && typeof item.data === 'object' && Object.keys(item.data).length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: color, marginBottom: 8 }}>Détails:</div>
                {Object.entries(item.data).map(([key, value]: [string, unknown]) => (
                  renderDetailField(key.charAt(0).toUpperCase() + key.slice(1), value)
                ))}
              </div>
            )}
            {renderDetailField('Remarques', item.remarques)}
            {renderDetailField('Notes', item.notes)}
          </div>
        );

      case 'para':
        // Cas générique pour les prescriptions paracliniques avec données incomplètes
        return (
          <div>
            {renderDetailField('Urgence', getUrgenceLabel(item.urgence))}
            {renderDetailField('Alertes', item.alertes)}
            {renderDetailField('Renseignements cliniques', item.renseignements)}
            {renderDetailField('Notes', item.notes)}
            {renderDetailField('Remarques', item.remarques)}
            <div style={{ marginTop: 12, padding: 10, background: '#fff3cd', borderRadius: 6, fontSize: 12, color: '#856404' }}>
              Prescription paraclinique avec données incomplètes. Type spécifique non détecté.
            </div>
          </div>
        );

      case 'bloc':
        return (
          <div>
            {renderDetailField('Urgence', getUrgenceLabel(item.urgence))}
            {renderDetailField('Alertes', item.alertes)}
            {renderDetailField('Libellé intervention', item.libelle)}
            {renderDetailField('Risque hémorragique', item.risqueHemorragique)}
            {renderDetailField('Type de chirurgie', item.typeChirurgie)}
            {renderDetailField('Chirurgien', item.chirurgien)}
            {renderDetailField('Consignes', item.consignes)}
            {renderDetailField('Date intervention', item.dateIntervention)}
          </div>
        );

      default:
        return (
          <div>
            {renderDetailField('Description', item.description)}
            {renderDetailField('Remarques', item.remarques)}
          </div>
        );
    }
  }

  return (
    <div>
      {/* TITRE ET BOUTON */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--txt)', margin: 0 }}>
            Historique des prescriptions
          </h2>
          <p style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 4 }}>
            {items.length} prescription{items.length > 1 ? 's' : ''} trouvée{items.length > 1 ? 's' : ''}
          </p>
        </div>
        {onNewPrescription && (
          <button
            onClick={onNewPrescription}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              background: 'var(--navy)', color: '#fff',
              border: 'none', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all .15s',
            }}
          >
            <span className="ms" style={{ fontSize: 18 }}>add</span>
            Nouvelle prescription
          </button>
        )}
      </div>

      {/* FILTRES */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {FILTRES.map(f => {
          const active = filtre === f.id;
          return (
            <button key={f.id} onClick={() => setFiltre(f.id)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              border: active ? 'none' : '1px solid var(--bdr)',
              background: active ? (f.id === 'all' ? 'var(--navy)' : TYPE_COLORS[f.id] || 'var(--navy)') : 'var(--card)',
              color: active ? '#fff' : 'var(--txt2)',
              cursor: 'pointer', transition: 'all .15s',
            }}>
              <span className="ms" style={{ fontSize: 14 }}>{f.icon}</span>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* CONTENU */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--txt3)' }}>
          <span className="ms" style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>hourglass_top</span>
          Chargement...
        </div>
      ) : error ? (
        <div style={{ background: 'var(--red-lt)', border: '1px solid var(--red-bdr)', borderRadius: 8, padding: 16, color: 'var(--red)', fontSize: 13 }}>
          {error}
        </div>
      ) : items.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item, i) => {
            const color = TYPE_COLORS[item._type] || 'var(--navy)';
            return (
              <div key={i} className="card" style={{
                padding: '12px 16px', borderLeft: `4px solid ${color}`,
                display: 'flex', alignItems: 'flex-start', gap: 12,
                cursor: 'pointer',
              }} onClick={() => handleItemClick(item)}>
                {/* Icône type */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="ms" style={{ fontSize: 18, color }}>{FILTRES.find(f => f.id === item._type)?.icon || 'description'}</span>
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 7px',
                      borderRadius: 10, background: color + '20', color,
                    }}>
                      {getTypeLabel(item._type)}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--txt3)' }}>
                      {formatDate(item.createdAt || item.date)}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--txt)', marginTop: 4 }}>
                    {getResume(item, item._type)}
                  </div>
                  {item.remarque || item.remarques || item.instructions ? (
                    <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 3 }}>
                      {item.remarque || item.remarques || item.instructions}
                    </div>
                  ) : null}
                </div>

                {/* Statut */}
                {item.statut && (
                  <div style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px',
                    borderRadius: 10, flexShrink: 0,
                    background: item.statut === 'validé' ? '#d1fae5' : '#fef3c7',
                    color: item.statut === 'validé' ? '#065f46' : '#92400e',
                  }}>
                    {item.statut}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--txt3)' }}>
          <span className="ms" style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>inbox</span>
          Aucune prescription trouvée
        </div>
      )}

      {/* MODAL DE DÉTAILS */}
      {showModal && selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowModal(false)}>
          <div className="card" style={{
            maxWidth: 600, width: '90%', maxHeight: '80vh', overflowY: 'auto',
            padding: 24, borderRadius: 12,
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: (TYPE_COLORS[selectedItem._type] || 'var(--navy)') + '20',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="ms" style={{
                    fontSize: 20, color: TYPE_COLORS[selectedItem._type] || 'var(--navy)'
                  }}>
                    {FILTRES.find(f => f.id === selectedItem._type)?.icon || 'description'}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--txt)' }}>
                    {getTypeLabel(selectedItem._type)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--txt3)' }}>
                    {formatDate(selectedItem.createdAt || selectedItem.date)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 24, color: 'var(--txt3)', padding: 4,
                }}
              >
                ×
              </button>
            </div>

            {/* Status */}
            {selectedItem.statut && (
              <div style={{
                display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '4px 10px',
                borderRadius: 10, marginBottom: 16,
                background: selectedItem.statut === 'validé' ? '#d1fae5' : '#fef3c7',
                color: selectedItem.statut === 'validé' ? '#065f46' : '#92400e',
              }}>
                Statut: {selectedItem.statut}
              </div>
            )}

            {/* Détails */}
            <div style={{ fontSize: 12, color: 'var(--txt)', lineHeight: 1.6 }}>
              {renderPrescriptionDetails(selectedItem, selectedItem._type)}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--bdr)' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: '100%', padding: 10, borderRadius: 8,
                  background: 'var(--navy)', color: '#fff',
                  border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
