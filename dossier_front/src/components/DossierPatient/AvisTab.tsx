'use client';

import { useState, useEffect } from 'react';
import { Send, Clock, CheckCircle, MessageSquare, X } from 'lucide-react';
import api from '@/lib/api';
import { ehr } from '@/lib/ehr-theme';

interface DemandeAvis {
  id: string;
  serviceDestinataire: string;
  motif: string;
  reponse: string | null;
  reponduPar: string | null;
  dateReponse: string | null;
  statut: 'en_attente' | 'repondue' | 'annulee';
  createdAt: string;
}

const SERVICES_CHU = [
  'Médecine interne',
  'Chirurgie générale',
  'Chirurgie orthopédique',
  'Gynécologie - Obstétrique',
  'Pédiatrie',
  'Cardiologie',
  'Neurologie',
  'Pneumologie',
  'Gastro-entérologie',
  'Urologie',
  'ORL',
  'Ophtalmologie',
  'Dermatologie',
  'Psychiatrie',
  'Anesthésie - Réanimation',
  'Soins intensifs',
  'Radiologie - Imagerie',
  'Laboratoire',
  'Anatomie pathologique',
  'Kinésithérapie',
  'Néphrologie - Dialyse',
  'Endoscopie',
  'Banque de sang',
  'Pharmacie',
];

export function AvisTab({ patientId, serviceCourant }: { patientId: string; serviceCourant: string }) {
  const [demandes, setDemandes] = useState<DemandeAvis[]>([]);
  const [destinataire, setDestinataire] = useState('');
  const [motif, setMotif] = useState('');
  const [loading, setLoading] = useState(false);
  const [reponseEnCours, setReponseEnCours] = useState<string | null>(null);
  const [reponseTexte, setReponseTexte] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [apiError, setApiError] = useState('');

  const fetchDemandes = async () => {
    try {
      const res = await api.get(`/patients/${patientId}/avis`);
      setDemandes(res.data);
      setApiError('');
    } catch (err) {
      console.error('Erreur chargement demandes:', err);
      setApiError('Erreur de chargement des demandes');
    }
  };

  useEffect(() => { fetchDemandes(); }, [patientId]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSubmit = async () => {
    if (!destinataire || !motif.trim()) {
      showToast('Veuillez sélectionner un service et saisir un motif', 'error');
      return;
    }
    setLoading(true);
    setApiError('');
    try {
      await api.post(`/patients/${patientId}/avis`, {
        serviceDemandeur: serviceCourant,
        serviceDestinataire: destinataire,
        motif: motif.trim(),
      });
      setDestinataire('');
      setMotif('');
      await fetchDemandes();
      showToast(`Demande d'avis envoyée au service ${destinataire}`);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Erreur inconnue';
      setApiError(`Erreur : ${message}`);
      showToast(`Erreur : ${message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRepondre = async (id: string) => {
    if (!reponseTexte.trim()) return;
    try {
      await api.put(`/patients/${patientId}/avis/${id}/repondre`, {
        reponse: reponseTexte,
        reponduPar: serviceCourant,
      });
      await fetchDemandes();
      setReponseEnCours(null);
      setReponseTexte('');
      showToast('Avis envoyé avec succès');
    } catch (err) {
      showToast("Erreur lors de l'envoi de l'avis", 'error');
    }
  };

  const isFormValid = !!destinataire && motif.trim().length > 0;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Toast */}
      {toast.show && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, padding: '12px 20px', borderRadius: 10,
          backgroundColor: toast.type === 'success' ? '#16a34a' : ehr.danger,
          color: '#fff', fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          {toast.type === 'success'
            ? <CheckCircle size={16} strokeWidth={2} />
            : <X size={16} strokeWidth={2} />}
          {toast.message}
        </div>
      )}

      {/* Formulaire nouvelle demande */}
      <div style={{
        backgroundColor: ehr.white,
        border: `1px solid ${ehr.border}`,
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 16,
        boxShadow: ehr.shadowCard,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: ehr.text, marginBottom: 16 }}>
          Nouvelle demande d'avis
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: ehr.text, display: 'block', marginBottom: 6 }}>
            Service destinataire <span style={{ color: ehr.danger }}>*</span>
          </label>
          <select
            value={destinataire}
            onChange={e => setDestinataire(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px',
              border: `1px solid ${ehr.border}`, borderRadius: 8,
              fontSize: 14, color: ehr.text, backgroundColor: ehr.white,
              fontFamily: "'Inter', sans-serif", cursor: 'pointer',
            }}
          >
            <option value="">— Sélectionner un service —</option>
            {SERVICES_CHU.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: ehr.text, display: 'block', marginBottom: 6 }}>
            Motif de la demande <span style={{ color: ehr.danger }}>*</span>
          </label>
          <textarea
            placeholder="Décrire le motif de la demande d'avis..."
            rows={3}
            value={motif}
            onChange={e => setMotif(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px',
              border: `1px solid ${ehr.border}`, borderRadius: 8,
              fontSize: 14, color: ehr.text, backgroundColor: ehr.inputBg,
              fontFamily: "'Inter', sans-serif", resize: 'vertical',
            }}
          />
        </div>

        {apiError && (
          <div style={{
            background: '#fef2f2', border: `1px solid ${ehr.danger}33`,
            borderRadius: 8, padding: '10px 14px',
            fontSize: 12, color: ehr.danger, marginBottom: 12,
          }}>
            {apiError}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !isFormValid}
          style={{
            backgroundColor: ehr.primary, color: ehr.white,
            border: 'none', borderRadius: 8,
            padding: '10px 20px', fontSize: 13, fontWeight: 600,
            cursor: loading || !isFormValid ? 'not-allowed' : 'pointer',
            opacity: loading || !isFormValid ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'opacity 0.15s',
          }}
        >
          <Send size={15} strokeWidth={2} />
          {loading ? 'Envoi en cours...' : 'Envoyer la demande'}
        </button>
      </div>

      {/* Liste des demandes */}
      <div style={{ fontSize: 12, fontWeight: 700, color: ehr.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        Demandes d'avis envoyées
      </div>

      {demandes.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          color: ehr.textMuted, fontSize: 13,
          border: `1px dashed ${ehr.border}`, borderRadius: 12,
          backgroundColor: ehr.white,
        }}>
          <MessageSquare size={32} strokeWidth={1.5} style={{ marginBottom: 8, color: ehr.border }} />
          <div>Aucune demande d'avis pour ce patient</div>
        </div>
      ) : (
        demandes.map(d => (
          <div key={d.id} style={{
            backgroundColor: ehr.white,
            border: `1px solid ${ehr.border}`,
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 10,
            boxShadow: ehr.shadowCard,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: ehr.text }}>
                {d.serviceDestinataire}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 700,
                padding: '4px 10px', borderRadius: 20,
                backgroundColor: d.statut === 'repondue' ? '#dcfce7' : '#fef9c3',
                color: d.statut === 'repondue' ? '#166534' : '#92400e',
              }}>
                {d.statut === 'repondue'
                  ? <CheckCircle size={12} strokeWidth={2} />
                  : <Clock size={12} strokeWidth={2} />}
                {d.statut === 'repondue' ? 'Répondu' : 'En attente'}
              </div>
            </div>

            {/* Motif */}
            <div style={{ fontSize: 13, color: ehr.textMuted, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: ehr.text }}>Motif : </span>{d.motif}
            </div>
            <div style={{ fontSize: 11, color: ehr.textMuted }}>
              {new Date(d.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>

            {/* Réponse */}
            {d.reponse && (
              <div style={{
                marginTop: 12, borderTop: `1px solid ${ehr.borderSoft}`, paddingTop: 12,
                backgroundColor: ehr.primaryLight, borderRadius: 8, padding: 12,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: ehr.primary, marginBottom: 4 }}>Réponse</div>
                <div style={{ fontSize: 13, color: ehr.text }}>{d.reponse}</div>
                <div style={{ fontSize: 11, color: ehr.textMuted, marginTop: 4 }}>
                  par {d.reponduPar} — {d.dateReponse ? new Date(d.dateReponse).toLocaleDateString('fr-FR') : ''}
                </div>
              </div>
            )}

            {/* Bouton répondre */}
            {d.statut === 'en_attente' && reponseEnCours !== d.id && (
              <button
                onClick={() => setReponseEnCours(d.id)}
                style={{
                  marginTop: 12, background: 'none',
                  border: `1px solid ${ehr.primary}`, borderRadius: 6,
                  color: ehr.primary, cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, padding: '6px 14px',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <MessageSquare size={13} strokeWidth={2} />
                Répondre
              </button>
            )}

            {/* Formulaire réponse */}
            {reponseEnCours === d.id && (
              <div style={{ marginTop: 12 }}>
                <textarea
                  placeholder="Saisir l'avis..."
                  rows={3}
                  value={reponseTexte}
                  onChange={e => setReponseTexte(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px',
                    border: `1px solid ${ehr.border}`, borderRadius: 8,
                    fontSize: 13, fontFamily: "'Inter', sans-serif",
                    backgroundColor: ehr.inputBg, color: ehr.text, resize: 'vertical',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => handleRepondre(d.id)}
                    style={{
                      backgroundColor: ehr.primary, color: ehr.white,
                      border: 'none', borderRadius: 6,
                      padding: '8px 16px', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <Send size={13} strokeWidth={2} />
                    Envoyer
                  </button>
                  <button
                    onClick={() => { setReponseEnCours(null); setReponseTexte(''); }}
                    style={{
                      background: 'none', border: `1px solid ${ehr.border}`,
                      borderRadius: 6, padding: '8px 14px',
                      cursor: 'pointer', fontSize: 12,
                      color: ehr.textMuted, fontWeight: 500,
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
