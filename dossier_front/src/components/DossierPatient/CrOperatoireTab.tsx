'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ChecklistMoment {
  items: Record<string, boolean>;
  valideA: string;
  commentaire: string;
}

interface CrOperatoire {
  id?: string;
  patientId?: string;
  numeroOp?: string;
  nomIntervention?: string;
  dateIntervention?: string;
  duree?: string;
  chirurgienPrincipal?: string;
  aideOperatoire?: string;
  anesthesiste?: string;
  typeAnesthesie?: string;
  classeAsa?: string;
  checklistAvantInduction?: ChecklistMoment;
  checklistAvantIncision?: ChecklistMoment;
  checklistAvantSortie?: ChecklistMoment;
  installation?: string;
  exploration?: string;
  geste?: string;
  prelevements?: string;
  scoreSccre?: string;
  complications?: string;
  statut?: string;
}

const defaultChecklist = (): ChecklistMoment => ({ items: {}, valideA: '', commentaire: '' });

const defaultCr = (): CrOperatoire => ({
  numeroOp: '', nomIntervention: '', dateIntervention: '', duree: '',
  chirurgienPrincipal: '', aideOperatoire: '', anesthesiste: '',
  typeAnesthesie: '', classeAsa: '',
  checklistAvantInduction: defaultChecklist(),
  checklistAvantIncision: defaultChecklist(),
  checklistAvantSortie: defaultChecklist(),
  installation: '', exploration: '', geste: '',
  prelevements: '', scoreSccre: '', complications: '', statut: 'PLANIFIE',
});

const CHECKLIST_INDUCTION = ['Identité confirmée','Site marqué','Consentement signé','Matériel vérifié','Risque hémorragique évalué','Allergies vérifiées'];
const CHECKLIST_INCISION  = ['Équipe introduite','Confirmation patient/site/procédure','Antibioprophylaxie administrée','Imagerie disponible','Problèmes anticipés discutés'];
const CHECKLIST_SORTIE    = ['Instruments/compresses vérifiés','Pièce anatomique labellisée','Problèmes équipement signalés','Consignes post-op transmises'];

const ASA_COLORS: Record<string, string> = {
  '1':'#16a34a','2':'#1d4ed8','3':'#f59e0b','4':'#ef4444','5':'#7c3aed','6':'#1e293b',
};

// ── SVG icons ─────────────────────────────────────────────────────────────────
const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconFlask = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6l1 7H8L9 3z"/><path d="M8 10l-3 9a1 1 0 001 1h12a1 1 0 001-1l-3-9"/>
    <line x1="9" y1="3" x2="9" y2="10"/><line x1="15" y1="3" x2="15" y2="10"/>
  </svg>
);
const IconActivity = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconCheck = ({ size = 12, color = 'white' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconSave = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconLock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconAlert = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
// ─────────────────────────────────────────────────────────────────────────────

export function CrOperatoireTab({ patientId }: { patientId: string }) {
  const [list, setList]       = useState<CrOperatoire[]>([]);
  const [selected, setSelected] = useState<CrOperatoire | null>(null);
  const [form, setForm]       = useState<CrOperatoire>(defaultCr());
  const [mode, setMode]       = useState<'view'|'edit'|'new'>('view');
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [openSec, setOpenSec] = useState<Record<string,boolean>>({ '01':true,'02':true,'03':true,'04':true });

  useEffect(() => { fetchList(); }, [patientId]);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await api.get(`/patients/${patientId}/cr-operatoire`);
      const data = Array.isArray(res.data) ? res.data : [];
      setList(data);
      if (data.length > 0) { setSelected(data[0]); setForm(data[0]); setMode('view'); }
      else { setMode('new'); setForm(defaultCr()); }
    } catch { setList([]); setMode('new'); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      let saved: CrOperatoire;
      if (form.id) {
        const res = await api.put(`/patients/${patientId}/cr-operatoire/${form.id}`, form);
        saved = res.data;
      } else {
        const res = await api.post(`/patients/${patientId}/cr-operatoire`, form);
        saved = res.data;
      }
      await fetchList();
      setSelected(saved); setForm(saved); setMode('view');
    } catch { alert('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  }

  function setChecklist(key: 'checklistAvantInduction'|'checklistAvantIncision'|'checklistAvantSortie', field: string, value: boolean|string) {
    setForm(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || defaultChecklist()),
        ...(field === 'valideA' || field === 'commentaire'
          ? { [field]: value }
          : { items: { ...(prev[key]?.items || {}), [field]: value } }),
      },
    }));
  }

  function getJPostOp(): string {
    if (!form.dateIntervention) return '';
    const diff = Math.floor((new Date().getTime() - new Date(form.dateIntervention).getTime()) / 86400000);
    return diff >= 0 ? `J${diff} post-op` : '';
  }

  const toggle = (k: string) => setOpenSec(p => ({ ...p, [k]: !p[k] }));
  const isView = mode === 'view';

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', color:'#94a3b8', fontFamily:"'Inter',sans-serif" }}>
      Chargement...
    </div>
  );

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", color:'#1e293b', paddingBottom:'40px' }}>

      {/* Barre CR */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', flexWrap:'wrap', gap:'10px' }}>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {list.map((cr, i) => (
            <button key={cr.id} onClick={() => { setSelected(cr); setForm(cr); setMode('view'); }} style={{
              padding:'5px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:600,
              border: selected?.id === cr.id ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
              backgroundColor: selected?.id === cr.id ? '#eff6ff' : '#f8fafc',
              color: selected?.id === cr.id ? '#1d4ed8' : '#475569', cursor:'pointer',
            }}>
              {cr.numeroOp || `OP #${i+1}`}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          {isView && selected && (
            <button onClick={() => setMode('edit')} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', fontSize:'12px', fontWeight:600, backgroundColor:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', borderRadius:'8px', cursor:'pointer' }}>
              <IconEdit /> Modifier
            </button>
          )}
          <button onClick={() => { setForm(defaultCr()); setSelected(null); setMode('new'); }} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', fontSize:'12px', fontWeight:600, backgroundColor:'#1d4ed8', color:'white', border:'none', borderRadius:'8px', cursor:'pointer' }}>
            <IconPlus /> Nouveau CR
          </button>
        </div>
      </div>

      {/* Section 01 — En-tête intervention */}
      <Section num="01" title="Compte-rendu opératoire" subtitle="Intervention, date et repère post-op"
        complete={!!(form.nomIntervention?.trim() && form.dateIntervention)}
        open={openSec['01']} onToggle={() => toggle('01')}
        headerRight={
          isView && form.numeroOp
            ? <span style={{ backgroundColor:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'3px 12px', fontSize:'12px', fontWeight:600, color:'#475569' }}>#{form.numeroOp}</span>
            : !isView
            ? <input placeholder="N° opération" value={form.numeroOp||''} onChange={e => setForm({...form, numeroOp:e.target.value})} style={{...IS, width:'200px'}} />
            : null
        }
      >
        <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#475569', fontSize:'14px', marginBottom:'4px' }}>
          <span style={{ color:'#1d4ed8' }}><IconCalendar /></span>
          {isView ? (
            <span style={{ fontWeight:500 }}>
              {form.nomIntervention || '—'}
              {form.dateIntervention ? ` – ${new Date(form.dateIntervention).toLocaleDateString('fr-FR')}` : ''}
              {getJPostOp() ? ` (${getJPostOp()})` : ''}
            </span>
          ) : (
            <div style={{ display:'flex', gap:'10px', flex:1, flexWrap:'wrap' }}>
              <input placeholder="Nom de l'intervention *" value={form.nomIntervention||''} onChange={e => setForm({...form, nomIntervention:e.target.value})} style={{...IS, flex:2, minWidth:'200px'}} />
              <input type="datetime-local" value={form.dateIntervention||''} onChange={e => setForm({...form, dateIntervention:e.target.value})} style={{...IS, flex:1, minWidth:'180px'}} />
            </div>
          )}
        </div>
      </Section>

      {/* Section 02 — Équipe + Checklist + Description */}
      <Section num="02" title="Équipe, checklist & technique opératoire" complete={!!(form.chirurgienPrincipal?.trim())} open={openSec['02']} onToggle={() => toggle('02')}>
        <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:'24px' }}>

          {/* Gauche */}
          <div>
            {/* Infos opératoires */}
            <p style={SL}>INFORMATIONS OPÉRATOIRES</p>

            <InfoField label="CHIRURGIEN PRINCIPAL" value={form.chirurgienPrincipal} isView={isView} placeholder="Dr. ..." onChange={v => setForm({...form, chirurgienPrincipal:v})} required icon={<IconUser />} />
            <InfoField label="AIDE-OPÉRATOIRE" value={form.aideOperatoire} isView={isView} placeholder="Dr. ..." onChange={v => setForm({...form, aideOperatoire:v})} icon={<IconUser />} />
            <InfoField label="ANESTHÉSISTE" value={form.anesthesiste} isView={isView} placeholder="Dr. ..." onChange={v => setForm({...form, anesthesiste:v})} icon={<IconUser />} />

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              <div style={{ marginBottom:'10px' }}>
                <p style={FL}>DATE / HEURE</p>
                <div style={{ display:'flex', alignItems:'center', gap:'5px', color:'#64748b' }}>
                  <IconClock />
                  <span style={{ fontSize:'13px', fontWeight:600, color:'#1e293b' }}>
                    {form.dateIntervention ? new Date(form.dateIntervention).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'}
                  </span>
                </div>
              </div>
              <InfoField label="DURÉE" value={form.duree} isView={isView} placeholder="ex: 1h15" onChange={v => setForm({...form, duree:v})} icon={<IconClock />} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
              <InfoField label="ANESTHÉSIE" value={form.typeAnesthesie} isView={isView} placeholder="Générale..." onChange={v => setForm({...form, typeAnesthesie:v})} />
              <div style={{ marginBottom:'10px' }}>
                <p style={FL}>CLASSE ASA</p>
                {isView
                  ? <span style={{ fontSize:'15px', fontWeight:700, color:ASA_COLORS[form.classeAsa||'']||'#1e293b' }}>{form.classeAsa||'—'}</span>
                  : <select value={form.classeAsa||''} onChange={e => setForm({...form, classeAsa:e.target.value})} style={{...IS, height:'36px'}}>
                      <option value="">—</option>
                      {['1','2','3','4','5','6','ASAE'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                }
              </div>
            </div>

            {/* Checklist OMS */}
            <p style={{ ...SL, marginTop:'16px' }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:'5px' }}><IconShield /> CHECKLIST SÉCURITÉ OMS</span>
            </p>
            <ChecklistBlock label="Avant l'induction" items={CHECKLIST_INDUCTION} data={form.checklistAvantInduction||defaultChecklist()} isView={isView} onChange={(f,v) => setChecklist('checklistAvantInduction',f,v)} />
            <ChecklistBlock label="Avant l'incision"  items={CHECKLIST_INCISION}  data={form.checklistAvantIncision||defaultChecklist()}  isView={isView} onChange={(f,v) => setChecklist('checklistAvantIncision',f,v)} />
            <ChecklistBlock label="Sortie du bloc"    items={CHECKLIST_SORTIE}    data={form.checklistAvantSortie||defaultChecklist()}    isView={isView} onChange={(f,v) => setChecklist('checklistAvantSortie',f,v)} />
          </div>

          {/* Droite — Description chirurgicale */}
          <div>
            <p style={SL}>DESCRIPTION CHIRURGICALE / TECHNIQUE OPÉRATOIRE</p>
            <div style={{ backgroundColor:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'18px' }}>
              <TextBlock label="Installation" value={form.installation} isView={isView} placeholder="Positionnement du patient..." onChange={v => setForm({...form, installation:v})} />
              <TextBlock label="Exploration"  value={form.exploration}  isView={isView} placeholder="Findings per-opératoires..."  onChange={v => setForm({...form, exploration:v})} />
              <TextBlock label="Geste"        value={form.geste}        isView={isView} placeholder="Description du geste chirurgical..." onChange={v => setForm({...form, geste:v})} last />
            </div>
          </div>
        </div>
      </Section>

      {/* Section 03 — Prélèvements + Post-op */}
      <Section num="03" title="Prélèvements & évolution post-opératoire" complete={!!(form.scoreSccre)} open={openSec['03']} onToggle={() => toggle('03')}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

          {/* Prélèvements */}
          <div style={{ backgroundColor:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'12px', padding:'16px' }}>
            <p style={{ ...SL, color:'#1d4ed8', display:'flex', alignItems:'center', gap:'5px' }}>
              <IconFlask /> PRÉLÈVEMENTS & HISTOLOGIE
            </p>
            {isView
              ? <div style={{ display:'flex', alignItems:'flex-start', gap:'8px', fontSize:'13px', color:'#1e293b' }}>
                  <span style={{ color:'#1d4ed8', flexShrink:0, marginTop:'1px' }}><IconFlask /></span>
                  <span>{form.prelevements || 'Aucun prélèvement renseigné'}</span>
                </div>
              : <textarea placeholder="Ex: Pièce envoyée en anapath..." value={form.prelevements||''} onChange={e => setForm({...form, prelevements:e.target.value})} style={{...IS, height:'90px', resize:'none', fontSize:'12px'}} />
            }
          </div>

          {/* Évolution post-op */}
          <div style={{ backgroundColor:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'12px', padding:'16px' }}>
            <p style={{ ...SL, color:'#16a34a', display:'flex', alignItems:'center', gap:'5px' }}>
              <IconActivity /> ÉVOLUTION POST-OP IMMÉDIATE
            </p>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
              <span style={{ fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em' }}>SCORE SCCRE</span>
              {isView
                ? <span style={{ fontSize:'16px', fontWeight:700, color:Number(form.scoreSccre)>=9?'#16a34a':'#ef4444' }}>{form.scoreSccre||'—'}/10</span>
                : <select value={form.scoreSccre||''} onChange={e => setForm({...form, scoreSccre:e.target.value})} style={{...IS, width:'80px', height:'32px', textAlign:'center'}}>
                    <option value="">—</option>
                    {Array.from({length:11},(_,i) => <option key={i} value={String(i)}>{i}</option>)}
                  </select>
              }
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
              <span style={{ fontSize:'11px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em' }}>COMPLICATIONS</span>
              {isView
                ? <span style={{ fontSize:'13px', fontWeight:600, color:form.complications&&form.complications!=='Aucune'?'#ef4444':'#16a34a' }}>{form.complications||'Aucune'}</span>
                : <input value={form.complications||''} onChange={e => setForm({...form, complications:e.target.value})} placeholder="Aucune" style={{...IS, width:'130px', height:'32px', fontSize:'12px'}} />
              }
            </div>

            {form.scoreSccre && Number(form.scoreSccre) >= 9 && (
              <div style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color:'#16a34a', fontWeight:600 }}>
                <IconCheck size={11} color="#16a34a" /> Score SCCRE ≥ 9 — Sortie de salle de réveil autorisée
              </div>
            )}
            {form.scoreSccre && Number(form.scoreSccre) < 9 && (
              <div style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color:'#ef4444', fontWeight:600 }}>
                <IconAlert /> Score SCCRE {'<'} 9 — Maintien en salle de réveil requis
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Section 04 — Enregistrement */}
      {!isView && (
        <Section num="04" title="Enregistrement du compte-rendu" open={openSec['04']} onToggle={() => toggle('04')}>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', flexWrap:'wrap' }}>
            {list.length > 0 && (
              <button onClick={() => { setForm(selected||list[0]); setMode('view'); }} style={btnSec}>Annuler</button>
            )}
            <button onClick={handleSave} disabled={saving} style={{ ...btnPri, opacity:saving?0.7:1, display:'flex', alignItems:'center', gap:'6px' }}>
              <IconSave /> {saving ? 'Sauvegarde...' : 'Valider le CR opératoire'}
            </button>
          </div>
        </Section>
      )}

      {/* Footer traçabilité */}
      {isView && form.statut === 'TERMINE' && (
        <div style={{ marginTop:'16px', textAlign:'center', fontSize:'12px', color:'#94a3b8', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
          <IconLock /> Compte-rendu opératoire validé – Traçabilité complète exigée par le SIH CHU
        </div>
      )}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ num, title, subtitle, complete, open, onToggle, children, headerRight }: {
  num: string; title: string; subtitle?: string; complete?: boolean;
  open: boolean; onToggle: () => void; children: React.ReactNode; headerRight?: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor:'white', border:'1px solid #e2e8f0', borderRadius:'12px', overflow:'hidden', marginBottom:'12px' }}>
      <div onClick={onToggle} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'28px', height:'28px', borderRadius:'50%', flexShrink:0, backgroundColor:complete?'#16a34a':'#1e293b', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700 }}>
            {complete ? <IconCheck /> : num}
          </div>
          <div>
            <div style={{ fontSize:'14px', fontWeight:600, color:'#1e293b' }}>{title}</div>
            {subtitle && <div style={{ fontSize:'12px', color:'#94a3b8', marginTop:'1px' }}>{subtitle}</div>}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {headerRight}
          {complete && (
            <div style={{ width:'20px', height:'20px', borderRadius:'50%', backgroundColor:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <IconCheck size={10} />
            </div>
          )}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ transform:open?'rotate(180deg)':'none', transition:'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
      {open
        ? <div style={{ padding:'0 18px 18px 18px' }}>{children}</div>
        : <div style={{ padding:'0 18px 12px 58px' }}><span style={{ fontSize:'12px', color:'#94a3b8', fontStyle:'italic' }}>Cliquez pour ouvrir</span></div>
      }
    </div>
  );
}

// ── InfoField ─────────────────────────────────────────────────────────────────
function InfoField({ label, value, isView, placeholder, onChange, required, icon }: {
  label: string; value?: string; isView: boolean; placeholder?: string;
  onChange: (v: string) => void; required?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom:'10px' }}>
      <p style={FL}>{label}{required && <span style={{ color:'#ef4444' }}> *</span>}</p>
      {isView
        ? <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
            {icon && <span style={{ color:'#94a3b8' }}>{icon}</span>}
            <span style={{ fontSize:'13px', fontWeight:600, color:'#1e293b' }}>{value||'—'}</span>
          </div>
        : <input value={value||''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={IS} />
      }
    </div>
  );
}

// ── TextBlock ─────────────────────────────────────────────────────────────────
function TextBlock({ label, value, isView, placeholder, onChange, last }: {
  label: string; value?: string; isView: boolean; placeholder?: string;
  onChange: (v: string) => void; last?: boolean;
}) {
  return (
    <div style={{ marginBottom:last?0:'16px' }}>
      <p style={{ fontSize:'13px', fontWeight:700, color:'#1d4ed8', margin:'0 0 6px 0' }}>{label} :</p>
      {isView
        ? <p style={{ fontSize:'13px', color:'#334155', margin:0, lineHeight:1.6 }}>{value||'—'}</p>
        : <textarea value={value||''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{...IS, height:'80px', resize:'vertical', fontSize:'13px'}} />
      }
    </div>
  );
}

// ── ChecklistBlock ────────────────────────────────────────────────────────────
function ChecklistBlock({ label, items, data, isView, onChange }: {
  label: string; items: string[]; data: ChecklistMoment;
  isView: boolean; onChange: (f: string, v: boolean|string) => void;
}) {
  const allChecked = items.every(item => data.items?.[item]);
  const validated  = !!data.valideA;

  return (
    <div style={{ marginBottom:'10px', backgroundColor:validated?'#f0fdf4':'#f8fafc', border:`1px solid ${validated?'#bbf7d0':'#e2e8f0'}`, borderRadius:'10px', padding:'12px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:(!isView&&items.length>0)?'8px':0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'20px', height:'20px', borderRadius:'50%', backgroundColor:validated?'#16a34a':'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {validated && <IconCheck size={10} />}
          </div>
          <span style={{ fontSize:'13px', fontWeight:600, color:'#1e293b' }}>{label}</span>
        </div>
        {validated && <span style={{ fontSize:'11px', color:'#16a34a', fontWeight:500 }}>Validé ({data.valideA})</span>}
      </div>

      {!isView && items.map(item => (
        <label key={item} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px', cursor:'pointer', fontSize:'12px', color:'#475569' }}>
          <input type="checkbox" checked={!!data.items?.[item]} onChange={e => onChange(item, e.target.checked)} />
          {item}
        </label>
      ))}
      {!isView && allChecked && (
        <div style={{ marginTop:'8px' }}>
          <label style={{ fontSize:'11px', color:'#64748b', display:'block', marginBottom:'3px' }}>Heure de validation</label>
          <input type="time" value={data.valideA||''} onChange={e => onChange('valideA', e.target.value)} style={{...IS, height:'30px', fontSize:'12px', width:'100px'}} />
        </div>
      )}
      {isView && !validated && (
        <p style={{ fontSize:'12px', color:'#94a3b8', margin:'4px 0 0 28px', fontStyle:'italic' }}>Non validé</p>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const SL: React.CSSProperties = { fontSize:'10px', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 10px 0' };
const FL: React.CSSProperties = { fontSize:'10px', fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 3px 0' };
const IS: React.CSSProperties = { width:'100%', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'7px 10px', fontSize:'13px', color:'#1e293b', outline:'none', fontFamily:"'Inter',sans-serif", boxSizing:'border-box', backgroundColor:'#ffffff' };
const btnPri: React.CSSProperties = { padding:'10px 20px', fontSize:'13px', fontWeight:600, backgroundColor:'#1d4ed8', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontFamily:"'Inter',sans-serif" };
const btnSec: React.CSSProperties = { padding:'10px 20px', fontSize:'13px', fontWeight:600, backgroundColor:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', borderRadius:'8px', cursor:'pointer', fontFamily:"'Inter',sans-serif" };
