import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDevotionStore } from '../stores/devotionStore';
import type { SermonNote } from '../stores/devotionStore';

const CSS = `
  .ser-page { padding: 24px; max-width: 860px; }
  .ser-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 12px; flex-wrap: wrap; }
  .ser-grid { display: grid; grid-template-columns: 240px 1fr; gap: 16px; }
  @media (max-width: 640px) {
    .ser-page { padding: 16px 14px; }
    .ser-grid { grid-template-columns: 1fr; }
    .ser-detail { order: -1; }
    .ser-back { display: block !important; }
  }
`;

export const SermonsPage: React.FC = () => {
  const { user, hasRole }                                                    = useAuthStore();
  const { sermonNotes, addSermonNote, updateSermonNote, removeSermonNote }   = useDevotionStore();
  const canEdit = hasRole(['comms', 'administrator']);

  const [selected,       setSelected]       = useState<SermonNote | null>(null);
  const [showAdd,        setShowAdd]        = useState(false);
  const [editingId,      setEditingId]      = useState<string | null>(null);
  const [confirmDelete,  setConfirmDelete]  = useState<SermonNote | null>(null);
  const [addTitle,       setAddTitle]       = useState('');
  const [addDay,         setAddDay]         = useState(1);
  const [addQuestions,   setAddQuestions]   = useState('');
  const [editTitle,      setEditTitle]      = useState('');
  const [editDay,        setEditDay]        = useState(1);
  const [editQuestions,  setEditQuestions]  = useState('');

  const openNote = (note: SermonNote): void => { setSelected(note); setEditingId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const startEdit = (note: SermonNote, e: React.MouseEvent): void => {
    e.stopPropagation();
    setEditingId(note.id); setEditTitle(note.sessionTitle); setEditDay(note.day);
    setEditQuestions(note.reflectionQuestions.join('\n')); setSelected(null);
  };

  const saveEdit = (): void => {
    if (!editingId) return;
    updateSermonNote(editingId, {
      sessionTitle: editTitle, day: editDay,
      reflectionQuestions: editQuestions.split('\n').map((q: string) => q.trim()).filter((q: string) => q.length > 0),
    });
    setEditingId(null);
  };

  const handleAdd = (): void => {
    if (!addTitle) return;
    addSermonNote({ sessionTitle: addTitle, day: addDay, pdfUrl: '',
      reflectionQuestions: addQuestions.split('\n').map((q: string) => q.trim()).filter((q: string) => q.length > 0),
    });
    setAddTitle(''); setAddDay(1); setAddQuestions(''); setShowAdd(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ser-page">

        <div className="ser-header">
          <div>
            <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'4px' }}>Sermon</div>
            <h1 style={{ fontFamily:"'Alex Brush',cursive", fontStyle:'italic', fontWeight:700, fontSize:'clamp(28px,6vw,40px)', color:'#f7f6dd', margin:'0 0 6px', lineHeight:1 }}>Reflection Questions</h1>
            <p style={{ color:'rgba(247,246,221,0.4)', fontSize:'13px', margin:0, fontFamily:"Arial,Helvetica,sans-serif" }}>Questions to reflect on after each session</p>
          </div>
          {canEdit && <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); }} style={outlineBtn}>+ Add Session</button>}
        </div>

        {showAdd && canEdit && (
          <div style={formCard}>
            <div style={formTitle}>Add Session Questions</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 80px', gap:'10px', marginBottom:'12px' }}>
              <input placeholder="Session title" value={addTitle} onChange={(e) => setAddTitle(e.target.value)} style={inp}/>
              <input type="number" placeholder="Day" value={addDay} min={1} max={4} onChange={(e) => setAddDay(parseInt(e.target.value, 10))} style={inp}/>
            </div>
            <div style={{ fontSize:'11px', color:'rgba(247,246,221,0.35)', fontFamily:"Arial,Helvetica,sans-serif", marginBottom:'8px' }}>Reflection questions — one per line</div>
            <textarea placeholder={'Where has God been calling you?\nWhat does staying the course look like for you?'} value={addQuestions} onChange={(e) => setAddQuestions(e.target.value)} rows={5} style={{ ...inp, resize:'vertical', fontFamily:"Arial,Helvetica,sans-serif", lineHeight:1.7, marginBottom:'12px' }}/>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={handleAdd} style={primaryBtn}>Save</button>
              <button onClick={() => setShowAdd(false)} style={ghostBtn}>Cancel</button>
            </div>
          </div>
        )}

        {editingId && canEdit && (
          <div style={{ ...formCard, borderColor:'rgba(247,246,221,0.3)' }}>
            <div style={{ ...formTitle, color:'#f7f6dd' }}>Editing Session</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 80px', gap:'10px', marginBottom:'12px' }}>
              <input placeholder="Session title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inp}/>
              <input type="number" placeholder="Day" value={editDay} min={1} max={4} onChange={(e) => setEditDay(parseInt(e.target.value, 10))} style={inp}/>
            </div>
            <div style={{ fontSize:'11px', color:'rgba(247,246,221,0.35)', fontFamily:"Arial,Helvetica,sans-serif", marginBottom:'8px' }}>Reflection questions — one per line</div>
            <textarea value={editQuestions} onChange={(e) => setEditQuestions(e.target.value)} rows={5} style={{ ...inp, resize:'vertical', fontFamily:"Arial,Helvetica,sans-serif", lineHeight:1.7, marginBottom:'12px' }}/>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={saveEdit} style={primaryBtn}>Save Changes</button>
              <button onClick={() => setEditingId(null)} style={ghostBtn}>Cancel</button>
            </div>
          </div>
        )}

        {sermonNotes.length === 0 ? (
          <div style={{ textAlign:'center', padding:'56px 24px', background:'#111D3E', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:'36px', marginBottom:'12px' }}>📝</div>
            <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:900, fontSize:'18px', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'6px' }}>No sessions yet</div>
            <p style={{ color:'rgba(247,246,221,0.3)', fontSize:'13px', fontFamily:"Arial,Helvetica,sans-serif", margin:0 }}>{canEdit ? 'Click "+ Add Session" above.' : 'Check back after each session.'}</p>
          </div>
        ) : (
          <div className={selected ? 'ser-grid' : ''} style={selected ? {} : { display:'flex', flexDirection:'column', gap:'8px' }}>

            {selected && (
              <div className="ser-detail" style={{ background:'#111D3E', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', overflow:'hidden' }}>
                <button onClick={() => setSelected(null)} className="ser-back" style={{ display:'none', width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.04)', border:'none', borderBottom:'1px solid rgba(255,255,255,0.06)', color:'rgba(247,246,221,0.5)', fontSize:'12px', fontWeight:700, fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', textAlign:'left' }}>← Back</button>
                <div style={{ padding:'20px' }}>
                  <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(247,246,221,0.4)', marginBottom:'4px' }}>Day {selected.day}</div>
                  <div style={{ fontFamily:"'Alex Brush',cursive", fontStyle:'italic', fontWeight:700, fontSize:'18px', color:'#f7f6dd', marginBottom:'20px', lineHeight:1.2 }}>{selected.sessionTitle}</div>
                  <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'14px' }}>Reflection Questions</div>
                  {selected.reflectionQuestions.length === 0 && <p style={{ color:'rgba(247,246,221,0.3)', fontSize:'13px', fontFamily:"Arial,Helvetica,sans-serif" }}>No questions added yet.</p>}
                  {selected.reflectionQuestions.map((q: string, i: number) => (
                    <div key={i} style={{ display:'flex', gap:'12px', marginBottom:'12px', padding:'14px', background:'rgba(247,246,221,0.04)', borderRadius:'6px', border:'1px solid rgba(247,246,221,0.08)' }}>
                      <span style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:800, fontSize:'16px', color:'#f7f6dd', minWidth:'24px', lineHeight:1.4 }}>{i + 1}.</span>
                      <span style={{ fontSize:'14px', color:'rgba(247,246,221,0.75)', lineHeight:1.7, fontFamily:"Arial,Helvetica,sans-serif" }}>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {sermonNotes.map((note: SermonNote) => {
                const active        = selected?.id === note.id;
                const isBeingEdited = editingId === note.id;
                return (
                  <div key={note.id} style={{ display:'flex', gap:'8px' }}>
                    <button onClick={() => openNote(note)} style={{ flex:1, textAlign:'left', padding:'16px', borderRadius:'6px', border:`1px solid ${active ? '#f7f6dd' : isBeingEdited ? 'rgba(247,246,221,0.35)' : 'rgba(255,255,255,0.07)'}`, background: active ? 'rgba(247,246,221,0.08)' : '#111D3E', cursor:'pointer', transition:'all 0.12s', borderLeft:`3px solid ${active ? '#f7f6dd' : 'transparent'}` }}>
                      <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:700, fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'4px' }}>Day {note.day}</div>
                      <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:700, fontSize:'15px', color: active ? '#f7f6dd' : 'rgba(247,246,221,0.7)', marginBottom:'4px' }}>{note.sessionTitle}</div>
                      <div style={{ fontSize:'11px', color:'rgba(247,246,221,0.25)', fontFamily:"Arial,Helvetica,sans-serif" }}>{note.reflectionQuestions.length} question{note.reflectionQuestions.length !== 1 ? 's' : ''}</div>
                    </button>
                    {canEdit && (
                      <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                        <button onClick={(e) => startEdit(note, e)} style={{ ...ghostBtn, padding:'6px 12px', fontSize:'10px', height:'50%' }}>Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(note); }} style={{ padding:'6px 10px', borderRadius:'4px', border:'1px solid rgba(220,80,80,0.25)', background:'transparent', color:'rgba(220,80,80,0.6)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", height:'50%' }}>Del</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {confirmDelete && (
        <>
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000 }} onClick={() => setConfirmDelete(null)}/>
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#111D3E', border:'1px solid rgba(220,80,80,0.3)', borderRadius:'10px', padding:'28px 32px', zIndex:1001, maxWidth:'380px', width:'90%' }}>
            <div style={{ fontSize:'28px', marginBottom:'12px' }}>⚠️</div>
            <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:800, fontSize:'16px', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'10px' }}>Confirm Delete</div>
            <p style={{ fontSize:'14px', color:'rgba(247,246,221,0.6)', fontFamily:"Arial,Helvetica,sans-serif", lineHeight:1.6, marginBottom:'24px' }}>Delete "{confirmDelete.sessionTitle}"? This cannot be undone.</p>
            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={ghostBtn}>Cancel</button>
              <button onClick={() => { removeSermonNote(confirmDelete.id); if (selected?.id === confirmDelete.id) setSelected(null); setConfirmDelete(null); }} style={{ ...primaryBtn, background:'rgba(220,80,80,0.9)', color:'#fff' }}>Delete</button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const inp: React.CSSProperties = { padding:'11px 13px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#f7f6dd', fontSize:'13px', outline:'none', width:'100%', boxSizing:'border-box' };
const primaryBtn: React.CSSProperties = { padding:'9px 18px', borderRadius:'4px', border:'none', background:'#f7f6dd', color:'#0A1128', fontSize:'11px', fontWeight:800, cursor:'pointer', fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", letterSpacing:'0.1em', textTransform:'uppercase' };
const ghostBtn: React.CSSProperties = { padding:'9px 14px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(247,246,221,0.5)', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' };
const outlineBtn: React.CSSProperties = { padding:'10px 16px', borderRadius:'4px', border:'1px solid rgba(247,246,221,0.4)', background:'rgba(247,246,221,0.08)', color:'#f7f6dd', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap', flexShrink:0 };
const formCard: React.CSSProperties = { background:'#111D3E', border:'1px solid rgba(247,246,221,0.2)', borderRadius:'8px', padding:'20px', marginBottom:'24px' };
const formTitle: React.CSSProperties = { fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:800, fontSize:'13px', letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(247,246,221,0.7)', marginBottom:'14px' };
