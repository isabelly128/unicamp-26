import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDevotionStore } from '../stores/devotionStore';
import type { SermonNote } from '../stores/devotionStore';

const CSS = `
  .ser-page { padding: 24px; max-width: 960px; }
  .ser-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 12px; }
  .ser-grid-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
  .ser-grid-split { display: grid; grid-template-columns: 260px 1fr; gap: 16px; }
  .ser-upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  @media (max-width: 640px) {
    .ser-page { padding: 16px 14px; }
    .ser-header { flex-wrap: wrap; }
    .ser-grid-list { grid-template-columns: 1fr; }
    .ser-grid-split { grid-template-columns: 1fr; }
    .ser-upload-grid { grid-template-columns: 1fr; }
    .ser-detail { order: -1; }
    .ser-back { display: block !important; }
  }
`;

export const SermonsPage: React.FC = () => {
  const { user, hasRole } = useAuthStore();
  const { sermonNotes, addSermonNote, updateSermonNote, removeSermonNote } = useDevotionStore();

  const canEdit = hasRole(['comms', 'administrator']);

  const [selected,    setSelected]    = useState<SermonNote | null>(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [editingId,   setEditingId]   = useState<string | null>(null);

  // Add form state
  const [addTitle,     setAddTitle]     = useState('');
  const [addDay,       setAddDay]       = useState(1);
  const [addPdfUrl,    setAddPdfUrl]    = useState('');
  const [addQuestions, setAddQuestions] = useState('');

  // Edit form state
  const [editTitle,     setEditTitle]     = useState('');
  const [editDay,       setEditDay]       = useState(1);
  const [editPdfUrl,    setEditPdfUrl]    = useState('');
  const [editQuestions, setEditQuestions] = useState('');

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<SermonNote | null>(null);

  const openNote = (note: SermonNote): void => {
    setSelected(note);
    setEditingId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (note: SermonNote, e: React.MouseEvent): void => {
    e.stopPropagation();
    setEditingId(note.id);
    setEditTitle(note.sessionTitle);
    setEditDay(note.day);
    setEditPdfUrl(note.pdfUrl);
    setEditQuestions(note.reflectionQuestions.join('\n'));
    setSelected(null);
  };

  const saveEdit = (): void => {
    if (!editingId) return;
    updateSermonNote(editingId, {
      sessionTitle: editTitle,
      day: editDay,
      pdfUrl: editPdfUrl,
      reflectionQuestions: editQuestions.split('\n').map((q: string) => q.trim()).filter((q: string) => q.length > 0),
    });
    setEditingId(null);
  };

  const handleAdd = (): void => {
    if (!addTitle) return;
    addSermonNote({
      sessionTitle: addTitle, day: addDay, pdfUrl: addPdfUrl,
      reflectionQuestions: addQuestions.split('\n').map((q: string) => q.trim()).filter((q: string) => q.length > 0),
    });
    setAddTitle(''); setAddPdfUrl(''); setAddQuestions(''); setShowAdd(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ser-page">

        {/* Header */}
        <div className="ser-header">
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'4px' }}>Sermon</div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(28px,6vw,40px)', color:'#F0EDE4', margin:'0 0 6px', lineHeight:1 }}>Notes</h1>
            <p style={{ color:'rgba(240,237,228,0.4)', fontSize:'13px', margin:0, fontFamily:"'Barlow',sans-serif" }}>
              Session notes &amp; reflection questions — updated after each session
            </p>
          </div>
          {canEdit && (
            <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); }} style={{
              padding:'10px 16px', borderRadius:'4px',
              border:'1px solid rgba(247,246,221,0.4)', background:'rgba(247,246,221,0.08)',
              color:'#f7f6dd', fontSize:'11px', fontWeight:700, cursor:'pointer',
              fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em',
              textTransform:'uppercase', whiteSpace:'nowrap', flexShrink:0,
            }}>+ Add Notes</button>
          )}
        </div>

        {/* Add form */}
        {showAdd && canEdit && (
          <div style={{ background:'#111D3E', border:'1px solid rgba(247,246,221,0.2)', borderRadius:'8px', padding:'20px', marginBottom:'24px' }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'13px', letterSpacing:'0.08em', textTransform:'uppercase', color:'#F0EDE4', marginBottom:'14px' }}>Add Sermon Notes</div>
            <div className="ser-upload-grid">
              <input placeholder="Session Title" value={addTitle}  onChange={(e) => setAddTitle(e.target.value)}  style={inp}/>
              <input placeholder="PDF URL"       value={addPdfUrl} onChange={(e) => setAddPdfUrl(e.target.value)} style={inp}/>
              <input type="number" placeholder="Day #" value={addDay} min={1} max={4} onChange={(e) => setAddDay(parseInt(e.target.value, 10))} style={inp}/>
            </div>
            <textarea placeholder="Reflection questions — one per line" value={addQuestions} onChange={(e) => setAddQuestions(e.target.value)} rows={4} style={{ ...inp, resize:'vertical', fontFamily:"'Barlow',sans-serif", marginBottom:'12px' }}/>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={handleAdd} style={primaryBtn}>Save</button>
              <button onClick={() => setShowAdd(false)} style={ghostBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* Inline edit form */}
        {editingId && canEdit && (
          <div style={{ background:'#111D3E', border:'1px solid rgba(247,246,221,0.3)', borderRadius:'8px', padding:'20px', marginBottom:'24px' }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'13px', letterSpacing:'0.08em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'14px' }}>Editing Sermon Note</div>
            <div className="ser-upload-grid">
              <input placeholder="Session Title" value={editTitle}  onChange={(e) => setEditTitle(e.target.value)}  style={inp}/>
              <input placeholder="PDF URL"       value={editPdfUrl} onChange={(e) => setEditPdfUrl(e.target.value)} style={inp}/>
              <input type="number" placeholder="Day #" value={editDay} min={1} max={4} onChange={(e) => setEditDay(parseInt(e.target.value, 10))} style={inp}/>
            </div>
            <div style={{ fontSize:'11px', color:'rgba(240,237,228,0.3)', fontFamily:"'Barlow',sans-serif", marginBottom:'8px' }}>
              For Google Drive PDFs: Share → Anyone with link → copy URL
            </div>
            <textarea placeholder="Reflection questions — one per line" value={editQuestions} onChange={(e) => setEditQuestions(e.target.value)} rows={4} style={{ ...inp, resize:'vertical', fontFamily:"'Barlow',sans-serif", marginBottom:'12px' }}/>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={saveEdit} style={primaryBtn}>Save Changes</button>
              <button onClick={() => setEditingId(null)} style={ghostBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* Split or grid view */}
        {selected ? (
          <div className="ser-grid-split">
            {/* Detail panel */}
            <div className="ser-detail" style={{ background:'#111D3E', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', overflow:'hidden', display:'flex', flexDirection:'column' }}>
              <button onClick={() => setSelected(null)} style={{ display:'none', width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.04)', border:'none', borderBottom:'1px solid rgba(255,255,255,0.06)', color:'rgba(240,237,228,0.5)', fontSize:'12px', fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer', textAlign:'left' }} className="ser-back">← Back</button>

              {selected.pdfUrl ? (
                <iframe src={selected.pdfUrl} title={selected.sessionTitle} style={{ width:'100%', height:'320px', border:'none', background:'#000' }}/>
              ) : (
                <div style={{ height:'120px', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'8px' }}>
                  <div style={{ fontSize:'28px' }}>📄</div>
                  <div style={{ fontSize:'12px', color:'rgba(240,237,228,0.25)', fontFamily:"'Barlow',sans-serif" }}>No PDF uploaded yet</div>
                </div>
              )}

              <div style={{ padding:'20px' }}>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'12px', letterSpacing:'0.1em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'14px' }}>Reflection Questions</div>
                {selected.reflectionQuestions.length === 0 && (
                  <p style={{ color:'rgba(240,237,228,0.3)', fontSize:'13px', fontFamily:"'Barlow',sans-serif" }}>No questions added yet.</p>
                )}
                {selected.reflectionQuestions.map((q: string, i: number) => (
                  <div key={i} style={{ display:'flex', gap:'12px', marginBottom:'10px', padding:'14px', background:'rgba(247,246,221,0.04)', borderRadius:'6px', border:'1px solid rgba(247,246,221,0.1)' }}>
                    <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'14px', color:'#f7f6dd', minWidth:'20px' }}>{i + 1}.</span>
                    <span style={{ fontSize:'14px', color:'rgba(240,237,228,0.7)', lineHeight:1.6, fontFamily:"'Barlow',sans-serif" }}>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Note list */}
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {sermonNotes.map((note: SermonNote) => {
                const active = selected?.id === note.id;
                const isBeingEdited = editingId === note.id;
                return (
                  <div key={note.id} style={{ display:'flex', gap:'8px', alignItems:'stretch' }}>
                    <button onClick={() => openNote(note)} style={{ flex:1, textAlign:'left', padding:'14px 16px', borderRadius:'6px', border:`1px solid ${active ? '#f7f6dd' : isBeingEdited ? 'rgba(247,246,221,0.4)' : 'rgba(255,255,255,0.07)'}`, background: active ? 'rgba(247,246,221,0.08)' : '#111D3E', cursor:'pointer', transition:'all 0.12s', borderLeft:`3px solid ${active ? '#f7f6dd' : 'transparent'}` }}>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'4px' }}>Day {note.day}</div>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:'15px', color: active ? '#F0EDE4' : 'rgba(240,237,228,0.7)', marginBottom:'4px' }}>{note.sessionTitle}</div>
                      <div style={{ fontSize:'11px', color:'rgba(240,237,228,0.25)', fontFamily:"'Barlow',sans-serif", display:'flex', gap:'8px' }}>
                        <span>{note.reflectionQuestions.length} questions</span>
                        {note.pdfUrl && <span style={{ color:'rgba(247,246,221,0.4)' }}>· PDF ✓</span>}
                      </div>
                    </button>
                    {canEdit && (
                      <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                        <button onClick={(e) => startEdit(note, e)} style={{ padding:'6px 12px', borderRadius:'4px', border:'1px solid rgba(247,246,221,0.25)', background: isBeingEdited ? 'rgba(247,246,221,0.12)' : 'transparent', color:'rgba(247,246,221,0.7)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase', height:'50%' }}>Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(note); }} style={{ padding:'6px 12px', borderRadius:'4px', border:'1px solid rgba(220,80,80,0.25)', background:'transparent', color:'rgba(220,80,80,0.6)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", height:'50%' }}>Del</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="ser-grid-list">
            {sermonNotes.length === 0 && (
              <p style={{ color:'rgba(240,237,228,0.3)', fontSize:'13px', fontFamily:"'Barlow',sans-serif" }}>No sermon notes uploaded yet.</p>
            )}
            {sermonNotes.map((note: SermonNote) => {
              const isBeingEdited = editingId === note.id;
              return (
                <div key={note.id} style={{ position:'relative' }}>
                  <button onClick={() => openNote(note)} style={{ width:'100%', textAlign:'left', padding:'20px', borderRadius:'8px', border:`1px solid ${isBeingEdited ? 'rgba(247,246,221,0.4)' : 'rgba(255,255,255,0.07)'}`, background:'#111D3E', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#f7f6dd'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = isBeingEdited ? 'rgba(247,246,221,0.4)' : 'rgba(255,255,255,0.07)'; }}
                  >
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'6px' }}>Day {note.day}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'18px', color:'#F0EDE4', marginBottom:'8px', lineHeight:1.2 }}>{note.sessionTitle}</div>
                    <div style={{ fontSize:'12px', color:'rgba(240,237,228,0.3)', fontFamily:"'Barlow',sans-serif", display:'flex', gap:'8px' }}>
                      <span>{note.reflectionQuestions.length} reflection questions →</span>
                      {note.pdfUrl && <span style={{ color:'rgba(247,246,221,0.4)' }}>PDF ✓</span>}
                    </div>
                  </button>
                  {canEdit && (
                    <div style={{ position:'absolute', top:'12px', right:'12px', display:'flex', gap:'6px' }}>
                      <button onClick={(e) => startEdit(note, e)} style={{ padding:'4px 10px', borderRadius:'4px', border:'1px solid rgba(247,246,221,0.2)', background:'rgba(10,17,40,0.8)', color:'rgba(247,246,221,0.6)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase' }}>Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(note); }} style={{ padding:'4px 8px', borderRadius:'4px', border:'1px solid rgba(220,80,80,0.2)', background:'rgba(10,17,40,0.8)', color:'rgba(220,80,80,0.5)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif" }}>Del</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <>
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000 }} onClick={() => setConfirmDelete(null)}/>
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#111D3E', border:'1px solid rgba(220,80,80,0.3)', borderRadius:'10px', padding:'28px 32px', zIndex:1001, maxWidth:'380px', width:'90%' }}>
            <div style={{ fontSize:'28px', marginBottom:'12px' }}>⚠️</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'16px', textTransform:'uppercase', color:'#F0EDE4', marginBottom:'10px' }}>Confirm Delete</div>
            <p style={{ fontSize:'14px', color:'rgba(240,237,228,0.6)', fontFamily:"'Barlow',sans-serif", lineHeight:1.6, marginBottom:'24px' }}>
              Delete "{confirmDelete.sessionTitle}"? This cannot be undone.
            </p>
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

const inp: React.CSSProperties = {
  padding:'11px 13px', borderRadius:'4px',
  border:'1px solid rgba(255,255,255,0.08)',
  background:'rgba(255,255,255,0.04)',
  color:'#F0EDE4', fontSize:'13px', outline:'none',
  width:'100%', boxSizing:'border-box',
};
const primaryBtn: React.CSSProperties = {
  padding:'9px 18px', borderRadius:'4px', border:'none',
  background:'#f7f6dd', color:'#0A1128', fontSize:'11px', fontWeight:800, cursor:'pointer',
  fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase',
};
const ghostBtn: React.CSSProperties = {
  padding:'9px 14px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.1)',
  background:'transparent', color:'rgba(240,237,228,0.5)', fontSize:'11px', fontWeight:700, cursor:'pointer',
  fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase',
};