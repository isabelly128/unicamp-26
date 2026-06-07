import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDevotionStore } from '../stores/devotionStore';
import type { Devotion } from '../stores/devotionStore';

type Phase = 'pre' | 'during' | 'post';
const PHASE_LABELS: Record<Phase, string> = { pre:'Pre-Camp', during:'During Camp', post:'Post-Camp' };

// ── Confirm delete modal ──────────────────────────────────────────────────────
const ConfirmModal: React.FC<{ message: string; onConfirm: () => void; onCancel: () => void }> = ({ message, onConfirm, onCancel }) => (
  <>
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000 }} onClick={onCancel}/>
    <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#111D3E', border:'1px solid rgba(220,80,80,0.3)', borderRadius:'10px', padding:'28px 32px', zIndex:1001, maxWidth:'380px', width:'90%', boxShadow:'0 16px 48px rgba(0,0,0,0.5)' }}>
      <div style={{ fontSize:'28px', marginBottom:'12px' }}>⚠️</div>
      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'16px', textTransform:'uppercase', color:'#F0EDE4', marginBottom:'10px' }}>Confirm Delete</div>
      <p style={{ fontSize:'14px', color:'rgba(240,237,228,0.6)', fontFamily:"'Barlow',sans-serif", lineHeight:1.6, marginBottom:'24px' }}>{message}</p>
      <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
        <button onClick={onCancel} style={ghostBtn}>Cancel</button>
        <button onClick={onConfirm} style={{ ...primaryBtn, background:'rgba(220,80,80,0.9)', color:'#fff' }}>Yes, Delete</button>
      </div>
    </div>
  </>
);

const CSS = `
  .dev-page { padding: 24px; max-width: 960px; }
  .dev-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 12px; }
  .dev-phases { display: flex; gap: 8px; margin-bottom: 24px; }
  .dev-phases button { flex: 1; padding: 10px 8px; border-radius: 4px; border: 1px solid; font-family: 'Barlow Condensed',sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; }
  .dev-grid { display: grid; grid-template-columns: 260px 1fr; gap: 16px; }
  .dev-upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .dev-edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
  @media (max-width: 640px) {
    .dev-page { padding: 16px 14px; }
    .dev-header { flex-wrap: wrap; }
    .dev-phases button { font-size: 10px; padding: 9px 4px; }
    .dev-grid { grid-template-columns: 1fr; }
    .dev-viewer { order: -1; }
    .dev-upload-grid { grid-template-columns: 1fr; }
    .dev-edit-grid { grid-template-columns: 1fr; }
    .dev-back { display: block !important; }
  }
`;

export const DevotionsPage: React.FC = () => {
  const { user, hasRole }                                       = useAuthStore();
  const { devotions, addDevotion, updateDevotion, removeDevotion } = useDevotionStore();

  const canEdit = hasRole(['comms', 'administrator']);

  const [activePhase, setActivePhase]         = useState<Phase>('during');
  const [selectedDevotion, setSelected]       = useState<Devotion | null>(null);
  const [reflection, setReflection]           = useState('');
  const [copied, setCopied]                   = useState(false);

  // Add form
  const [showAdd, setShowAdd]       = useState(false);
  const [addTitle, setAddTitle]     = useState('');
  const [addDay, setAddDay]         = useState(1);
  const [addPhase, setAddPhase]     = useState<Phase>('during');
  const [addPdfUrl, setAddPdfUrl]   = useState('');

  // Edit form
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editTitle, setEditTitle]   = useState('');
  const [editDay, setEditDay]       = useState(1);
  const [editPhase, setEditPhase]   = useState<Phase>('during');
  const [editPdfUrl, setEditPdfUrl] = useState('');

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState<Devotion | null>(null);

  const filtered = devotions.filter((d: Devotion) => d.phase === activePhase);

  const openDevotion = (d: Devotion) => {
    setSelected(d); setReflection(''); setCopied(false);
    setEditingId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (d: Devotion, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(d.id); setEditTitle(d.title); setEditDay(d.day);
    setEditPhase(d.phase); setEditPdfUrl(d.pdfUrl);
    setSelected(null);
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateDevotion(editingId, { title: editTitle, day: editDay, phase: editPhase, pdfUrl: editPdfUrl });
    // Update selected if it was the one being edited
    if (selectedDevotion?.id === editingId) {
      const updated = devotions.find((d: Devotion) => d.id === editingId);
      if (updated) setSelected({ ...updated, title: editTitle, day: editDay, phase: editPhase, pdfUrl: editPdfUrl });
    }
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!addTitle) return;
    addDevotion({ title: addTitle, day: addDay, phase: addPhase, pdfUrl: addPdfUrl, uploadedBy: user?.name ?? 'Admin' });
    setAddTitle(''); setAddPdfUrl(''); setShowAdd(false);
  };

  const handleCopy = () => {
    if (!reflection.trim()) return;
    void navigator.clipboard.writeText(reflection).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="dev-page">

        {/* Header */}
        <div className="dev-header">
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'4px' }}>Daily</div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(28px,6vw,40px)', color:'#F0EDE4', margin:'0 0 6px', lineHeight:1 }}>Devotions</h1>
            <p style={{ color:'rgba(240,237,228,0.4)', fontSize:'13px', margin:0, fontFamily:"'Barlow',sans-serif" }}>Read · Reflect · Copy to share with your mentor or leader</p>
          </div>
          {canEdit && (
            <button onClick={() => setShowAdd(!showAdd)} style={{ padding:'10px 16px', borderRadius:'4px', border:'1px solid rgba(247,246,221,0.4)', background:'rgba(247,246,221,0.08)', color:'#f7f6dd', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap', flexShrink:0 }}>
              + Add Devotion
            </button>
          )}
        </div>

        {/* Add form */}
        {showAdd && canEdit && (
          <div style={{ background:'#111D3E', border:'1px solid rgba(247,246,221,0.2)', borderRadius:'8px', padding:'20px', marginBottom:'24px' }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'14px', letterSpacing:'0.08em', textTransform:'uppercase', color:'#F0EDE4', marginBottom:'14px' }}>Add New Devotion</div>
            <div className="dev-upload-grid">
              <input placeholder="Title" value={addTitle} onChange={(e) => setAddTitle(e.target.value)} style={inp}/>
              <input placeholder="PDF URL" value={addPdfUrl} onChange={(e) => setAddPdfUrl(e.target.value)} style={inp}/>
              <select value={addPhase} onChange={(e) => setAddPhase(e.target.value as Phase)} style={inp}>
                <option value="pre">Pre-Camp</option>
                <option value="during">During Camp</option>
                <option value="post">Post-Camp</option>
              </select>
              <input type="number" placeholder="Day #" value={addDay} min={0} max={10} onChange={(e) => setAddDay(parseInt(e.target.value,10))} style={inp}/>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={handleAdd} style={primaryBtn}>Save</button>
              <button onClick={() => setShowAdd(false)} style={ghostBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* Inline edit form (when editing an existing devotion) */}
        {editingId && canEdit && (
          <div style={{ background:'#111D3E', border:'1px solid rgba(247,246,221,0.3)', borderRadius:'8px', padding:'20px', marginBottom:'24px' }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'13px', letterSpacing:'0.08em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'14px' }}>
              Editing Devotion
            </div>
            <div className="dev-edit-grid">
              <input placeholder="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inp}/>
              <input placeholder="PDF URL (Google Drive or direct link)" value={editPdfUrl} onChange={(e) => setEditPdfUrl(e.target.value)} style={inp}/>
              <select value={editPhase} onChange={(e) => setEditPhase(e.target.value as Phase)} style={inp}>
                <option value="pre">Pre-Camp</option>
                <option value="during">During Camp</option>
                <option value="post">Post-Camp</option>
              </select>
              <input type="number" placeholder="Day #" value={editDay} min={0} max={10} onChange={(e) => setEditDay(parseInt(e.target.value,10))} style={inp}/>
            </div>
            <div style={{ fontSize:'11px', color:'rgba(240,237,228,0.3)', fontFamily:"'Barlow',sans-serif", marginBottom:'12px' }}>
              For Google Drive PDFs: Share → Anyone with link → copy URL
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={saveEdit} style={primaryBtn}>Save Changes</button>
              <button onClick={() => setEditingId(null)} style={ghostBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* Phase tabs */}
        <div className="dev-phases">
          {(['pre','during','post'] as Phase[]).map((phase) => (
            <button key={phase} onClick={() => { setActivePhase(phase); setSelected(null); setReflection(''); setEditingId(null); }} style={{
              borderColor: activePhase === phase ? '#f7f6dd' : 'rgba(255,255,255,0.08)',
              background:  activePhase === phase ? 'rgba(247,246,221,0.1)' : 'transparent',
              color:       activePhase === phase ? '#f7f6dd' : 'rgba(240,237,228,0.35)',
            }}>{PHASE_LABELS[phase]}</button>
          ))}
        </div>

        {/* List + viewer */}
        <div className={selectedDevotion ? 'dev-grid' : ''} style={selectedDevotion ? {} : { display:'flex', flexDirection:'column', gap:'8px' }}>

          {/* Viewer — above list on mobile */}
          {selectedDevotion && (
            <div className="dev-viewer" style={{ background:'#111D3E', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', overflow:'hidden' }}>
              <button onClick={() => setSelected(null)} style={{ display:'none', width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.04)', border:'none', borderBottom:'1px solid rgba(255,255,255,0.06)', color:'rgba(240,237,228,0.5)', fontSize:'12px', fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', textAlign:'left' }} className="dev-back">← Back</button>

              {selectedDevotion.pdfUrl ? (
                <iframe src={selectedDevotion.pdfUrl} title={selectedDevotion.title} style={{ width:'100%', height:'340px', border:'none', background:'#000' }}/>
              ) : (
                <div style={{ height:'140px', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'8px' }}>
                  <div style={{ fontSize:'32px' }}>📄</div>
                  <div style={{ fontSize:'13px', color:'rgba(240,237,228,0.3)', fontFamily:"'Barlow',sans-serif" }}>No PDF uploaded yet</div>
                  {canEdit && <div style={{ fontSize:'11px', color:'rgba(247,246,221,0.4)', fontFamily:"'Barlow',sans-serif" }}>Click Edit on this devotion to add a PDF URL</div>}
                </div>
              )}

              <div style={{ padding:'20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px', gap:'12px', flexWrap:'wrap' }}>
                  <div>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.15em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'2px' }}>My Reflection</div>
                    <div style={{ fontSize:'11px', color:'rgba(240,237,228,0.25)', fontFamily:"'Barlow',sans-serif" }}>Private scratchpad — nothing is saved or shared</div>
                  </div>
                  <button onClick={handleCopy} disabled={!reflection.trim()} style={{ padding:'9px 16px', borderRadius:'4px', flexShrink:0, border:`1px solid ${copied ? 'rgba(90,138,60,0.6)' : 'rgba(255,255,255,0.1)'}`, background: copied ? 'rgba(90,138,60,0.15)' : 'rgba(255,255,255,0.04)', color: copied ? '#8BC34A' : reflection.trim() ? 'rgba(240,237,228,0.6)' : 'rgba(240,237,228,0.2)', fontSize:'11px', fontWeight:700, cursor: reflection.trim() ? 'pointer' : 'not-allowed', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase', transition:'all 0.15s' }}>
                    {copied ? '✓ Copied!' : 'Copy Text'}
                  </button>
                </div>
                <textarea value={reflection} onChange={(e) => { setReflection(e.target.value); setCopied(false); }} placeholder="Write freely... What is God saying to you? This stays on your screen only." rows={5} style={{ ...inp, resize:'vertical', lineHeight:1.7, fontFamily:"'Barlow',sans-serif", fontSize:'14px' }}/>
                <p style={{ marginTop:'10px', fontSize:'11px', color:'rgba(240,237,228,0.2)', fontFamily:"'Barlow',sans-serif", fontStyle:'italic' }}>
                  💛 Consider sharing your reflection with your mentor or cell leader.
                </p>
              </div>
            </div>
          )}

          {/* Devotion list */}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {filtered.length === 0 && (
              <p style={{ color:'rgba(240,237,228,0.3)', fontSize:'13px', fontFamily:"'Barlow',sans-serif" }}>No devotions for this phase yet.</p>
            )}
            {filtered.map((d: Devotion) => {
              const active = selectedDevotion?.id === d.id;
              const isBeingEdited = editingId === d.id;
              return (
                <div key={d.id} style={{ display:'flex', gap:'8px', alignItems:'stretch' }}>
                  {/* Main card */}
                  <button onClick={() => openDevotion(d)} style={{ flex:1, textAlign:'left', padding:'14px 16px', borderRadius:'6px', border:`1px solid ${active ? '#f7f6dd' : isBeingEdited ? 'rgba(247,246,221,0.4)' : 'rgba(255,255,255,0.07)'}`, background: active ? 'rgba(247,246,221,0.08)' : '#111D3E', cursor:'pointer', transition:'all 0.12s', borderLeft:`3px solid ${active ? '#f7f6dd' : isBeingEdited ? 'rgba(247,246,221,0.5)' : 'transparent'}` }}>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:'14px', color: active ? '#F0EDE4' : 'rgba(240,237,228,0.7)', marginBottom:'2px' }}>{d.title}</div>
                    <div style={{ fontSize:'11px', color:'rgba(240,237,228,0.25)', fontFamily:"'Barlow',sans-serif", display:'flex', gap:'8px' }}>
                      <span>{d.uploadedBy}</span>
                      {d.pdfUrl && <span style={{ color:'rgba(247,246,221,0.4)' }}>· PDF ✓</span>}
                      {!d.pdfUrl && canEdit && <span style={{ color:'rgba(220,120,80,0.5)' }}>· No PDF</span>}
                    </div>
                  </button>

                  {/* Admin action buttons */}
                  {canEdit && (
                    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                      <button onClick={(e) => startEdit(d, e)} style={{ padding:'6px 12px', borderRadius:'4px', border:'1px solid rgba(247,246,221,0.25)', background: isBeingEdited ? 'rgba(247,246,221,0.15)' : 'transparent', color:'rgba(247,246,221,0.7)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase', height:'50%' }}>
                        Edit
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(d); }} style={{ padding:'6px 12px', borderRadius:'4px', border:'1px solid rgba(220,80,80,0.25)', background:'transparent', color:'rgba(220,80,80,0.6)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", height:'50%' }}>
                        Del
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <ConfirmModal
          message={`Are you sure you want to delete "${confirmDelete.title}"? This cannot be undone.`}
          onConfirm={() => { removeDevotion(confirmDelete.id); if (selectedDevotion?.id === confirmDelete.id) setSelected(null); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
};

const inp: React.CSSProperties = { padding:'11px 13px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#F0EDE4', fontSize:'13px', outline:'none', width:'100%', boxSizing:'border-box' };
const primaryBtn: React.CSSProperties = { padding:'9px 18px', borderRadius:'4px', border:'none', background:'#f7f6dd', color:'#0A1128', fontSize:'11px', fontWeight:800, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase' };
const ghostBtn: React.CSSProperties = { padding:'9px 14px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(240,237,228,0.5)', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' };