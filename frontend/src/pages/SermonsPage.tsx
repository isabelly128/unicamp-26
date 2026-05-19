import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDevotionStore } from '../stores/devotionStore';
import type { SermonNote } from '../types';

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
  const { user, hasRole }              = useAuthStore();
  const { sermonNotes, addSermonNote } = useDevotionStore();

  const [selected, setSelected]     = useState<SermonNote | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle]           = useState('');
  const [day, setDay]               = useState(1);
  const [pdfUrl, setPdfUrl]         = useState('');
  const [questions, setQuestions]   = useState('');

  const canUpload = hasRole(['comms']);

  const openNote = (note: SermonNote): void => {
    setSelected(note);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpload = (): void => {
    if (!title || !pdfUrl) return;
    addSermonNote({
      sessionTitle: title, day, pdfUrl,
      reflectionQuestions: questions.split('\n').map((q) => q.trim()).filter(Boolean),
    });
    setTitle(''); setPdfUrl(''); setQuestions(''); setShowUpload(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ser-page">

        {/* Header */}
        <div className="ser-header">
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#D4E600', marginBottom:'4px' }}>Sermon</div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(28px,6vw,40px)', color:'#F0EDE4', margin:'0 0 6px', lineHeight:1 }}>Notes</h1>
            <p style={{ color:'rgba(240,237,228,0.4)', fontSize:'13px', margin:0, fontFamily:"'Barlow',sans-serif" }}>
              Session notes &amp; reflection questions — updated after each session
            </p>
          </div>
          {canUpload && (
            <button onClick={() => setShowUpload(!showUpload)} style={{
              padding:'10px 16px', borderRadius:'4px',
              border:'1px solid rgba(212,230,0,0.4)', background:'rgba(212,230,0,0.08)',
              color:'#D4E600', fontSize:'11px', fontWeight:700, cursor:'pointer',
              fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em',
              textTransform:'uppercase', whiteSpace:'nowrap', flexShrink:0,
            }}>+ Upload Notes</button>
          )}
        </div>

        {/* Upload form */}
        {showUpload && (
          <div style={{ background:'#111D3E', border:'1px solid rgba(212,230,0,0.2)', borderRadius:'8px', padding:'20px', marginBottom:'24px' }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'14px', letterSpacing:'0.08em', textTransform:'uppercase', color:'#F0EDE4', marginBottom:'14px' }}>Upload Sermon Notes</div>
            <div className="ser-upload-grid">
              <input placeholder="Session Title" value={title} onChange={(e) => setTitle(e.target.value)} style={inp}/>
              <input placeholder="PDF URL" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} style={inp}/>
              <input type="number" placeholder="Day #" value={day} min={1} max={4} onChange={(e) => setDay(parseInt(e.target.value, 10))} style={inp}/>
            </div>
            <textarea
              placeholder="Reflection questions — one per line"
              value={questions} onChange={(e) => setQuestions(e.target.value)}
              rows={4}
              style={{ ...inp, resize:'vertical', fontFamily:"'Barlow',sans-serif", marginBottom:'12px' }}
            />
            <button onClick={handleUpload} style={primaryBtn}>Upload</button>
          </div>
        )}

        {/* Split view when a note is selected, card grid otherwise */}
        {selected ? (
          <div className="ser-grid-split">

            {/* Detail panel — shows above list on mobile */}
            <div className="ser-detail" style={{ background:'#111D3E', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', overflow:'hidden', display:'flex', flexDirection:'column' }}>
              {/* Mobile back button */}
              <button onClick={() => setSelected(null)} style={{
                display:'none', width:'100%', padding:'12px 16px',
                background:'rgba(255,255,255,0.04)', border:'none',
                borderBottom:'1px solid rgba(255,255,255,0.06)',
                color:'rgba(240,237,228,0.5)', fontSize:'12px', fontWeight:700,
                fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em',
                textTransform:'uppercase', cursor:'pointer', textAlign:'left',
              }} className="ser-back">← Back to list</button>

              <iframe src={selected.pdfUrl} title={selected.sessionTitle} style={{ width:'100%', height:'320px', border:'none', background:'#000' }}/>

              <div style={{ padding:'20px' }}>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'13px', letterSpacing:'0.08em', textTransform:'uppercase', color:'#D4E600', marginBottom:'14px' }}>
                  Reflection Questions
                </div>
                {selected.reflectionQuestions.length === 0 && (
                  <p style={{ color:'rgba(240,237,228,0.3)', fontSize:'13px', fontFamily:"'Barlow',sans-serif" }}>No questions added.</p>
                )}
                {selected.reflectionQuestions.map((q, i) => (
                  <div key={i} style={{
                    display:'flex', gap:'12px', marginBottom:'10px',
                    padding:'14px', background:'rgba(212,230,0,0.04)',
                    borderRadius:'6px', border:'1px solid rgba(212,230,0,0.1)',
                  }}>
                    <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'14px', color:'#D4E600', minWidth:'20px' }}>{i + 1}.</span>
                    <span style={{ fontSize:'14px', color:'rgba(240,237,228,0.7)', lineHeight:1.6, fontFamily:"'Barlow',sans-serif" }}>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Note list — right col on desktop, below viewer on mobile */}
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {sermonNotes.map((note: SermonNote) => {
                const active = selected?.id === note.id;
                return (
                  <button key={note.id} onClick={() => openNote(note)} style={{
                    textAlign:'left', padding:'16px', borderRadius:'6px',
                    border:`1px solid ${active ? '#D4E600' : 'rgba(255,255,255,0.07)'}`,
                    background: active ? 'rgba(212,230,0,0.08)' : '#111D3E',
                    cursor:'pointer', transition:'all 0.12s',
                    borderLeft:`3px solid ${active ? '#D4E600' : 'transparent'}`,
                  }}>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase', color:'#D4E600', marginBottom:'4px' }}>Day {note.day}</div>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:'15px', color: active ? '#F0EDE4' : 'rgba(240,237,228,0.7)', marginBottom:'4px' }}>{note.sessionTitle}</div>
                    <div style={{ fontSize:'11px', color:'rgba(240,237,228,0.25)', fontFamily:"'Barlow',sans-serif" }}>{note.reflectionQuestions.length} questions</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Card grid when nothing selected */
          <div className="ser-grid-list">
            {sermonNotes.length === 0 && (
              <p style={{ color:'rgba(240,237,228,0.3)', fontSize:'13px', fontFamily:"'Barlow',sans-serif" }}>No sermon notes uploaded yet.</p>
            )}
            {sermonNotes.map((note: SermonNote) => (
              <button key={note.id} onClick={() => openNote(note)} style={{
                textAlign:'left', padding:'20px', borderRadius:'8px',
                border:'1px solid rgba(255,255,255,0.07)',
                background:'#111D3E', cursor:'pointer', transition:'all 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#D4E600'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', color:'#D4E600', marginBottom:'6px' }}>Day {note.day}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'18px', color:'#F0EDE4', marginBottom:'8px', lineHeight:1.2 }}>{note.sessionTitle}</div>
                <div style={{ fontSize:'12px', color:'rgba(240,237,228,0.3)', fontFamily:"'Barlow',sans-serif" }}>{note.reflectionQuestions.length} reflection questions →</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const inp: React.CSSProperties = {
  padding:'12px 14px', borderRadius:'4px',
  border:'1px solid rgba(255,255,255,0.08)',
  background:'rgba(255,255,255,0.04)',
  color:'#F0EDE4', fontSize:'14px', outline:'none',
  width:'100%', boxSizing:'border-box',
};

const primaryBtn: React.CSSProperties = {
  padding:'10px 20px', borderRadius:'4px', border:'none',
  background:'#D4E600', color:'#0A1128',
  fontSize:'12px', fontWeight:800, cursor:'pointer',
  fontFamily:"'Barlow Condensed',sans-serif",
  letterSpacing:'0.1em', textTransform:'uppercase',
};
