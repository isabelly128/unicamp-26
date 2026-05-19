import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDevotionStore } from '../stores/devotionStore';
import type { Devotion } from '../types';

type Phase = 'pre' | 'during' | 'post';

const PHASE_LABELS: Record<Phase, string> = {
  pre:    'Pre-Camp',
  during: 'During Camp',
  post:   'Post-Camp',
};

const CSS = `
  .dev-page { padding: 24px; max-width: 960px; }
  .dev-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 12px; }
  .dev-phases { display: flex; gap: 8px; margin-bottom: 24px; }
  .dev-phases button { flex: 1; padding: 10px 8px; border-radius: 4px; border: 1px solid; font-family: 'Barlow Condensed',sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; }
  .dev-grid { display: grid; grid-template-columns: 260px 1fr; gap: 16px; }
  .dev-list { display: flex; flex-direction: column; gap: 8px; }
  .dev-upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }

  /* Mobile */
  @media (max-width: 640px) {
    .dev-page { padding: 16px 14px; }
    .dev-header { flex-wrap: wrap; }
    .dev-phases button { font-size: 10px; padding: 9px 4px; }
    .dev-grid { grid-template-columns: 1fr; }
    .dev-viewer { order: -1; }
    .dev-upload-grid { grid-template-columns: 1fr; }
  }
`;

export const DevotionsPage: React.FC = () => {
  const { user, hasRole }          = useAuthStore();
  const { devotions, addDevotion } = useDevotionStore();

  const [activePhase, setActivePhase]           = useState<Phase>('during');
  const [selectedDevotion, setSelectedDevotion] = useState<Devotion | null>(null);
  const [reflection, setReflection]             = useState('');
  const [copied, setCopied]                     = useState(false);

  const [showUpload, setShowUpload]   = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDay, setUploadDay]     = useState(1);
  const [uploadPhase, setUploadPhase] = useState<Phase>('during');
  const [uploadUrl, setUploadUrl]     = useState('');

  const canUpload = hasRole(['comms']);
  const filtered  = devotions.filter((d: Devotion) => d.phase === activePhase);

  const openDevotion = (d: Devotion): void => {
    setSelectedDevotion(d);
    setReflection('');
    setCopied(false);
    // Smooth scroll to top on mobile so viewer is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = (): void => {
    if (!reflection.trim()) return;
    void navigator.clipboard.writeText(reflection).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleUpload = (): void => {
    if (!uploadTitle || !uploadUrl) return;
    addDevotion({ title: uploadTitle, day: uploadDay, phase: uploadPhase, pdfUrl: uploadUrl, uploadedBy: user?.name ?? 'Admin' });
    setUploadTitle(''); setUploadUrl(''); setShowUpload(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="dev-page">

        {/* Header */}
        <div className="dev-header">
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#D4E600', marginBottom:'4px' }}>Daily</div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(28px,6vw,40px)', color:'#F0EDE4', margin:'0 0 6px', lineHeight:1 }}>Devotions</h1>
            <p style={{ color:'rgba(240,237,228,0.4)', fontSize:'13px', margin:0, fontFamily:"'Barlow',sans-serif" }}>
              Read · Reflect · Copy to share with your mentor or leader
            </p>
          </div>
          {canUpload && (
            <button onClick={() => setShowUpload(!showUpload)} style={{
              padding:'10px 16px', borderRadius:'4px',
              border:'1px solid rgba(212,230,0,0.4)', background:'rgba(212,230,0,0.08)',
              color:'#D4E600', fontSize:'11px', fontWeight:700, cursor:'pointer',
              fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em',
              textTransform:'uppercase', whiteSpace:'nowrap', flexShrink:0,
            }}>+ Upload Devotion</button>
          )}
        </div>

        {/* Upload form */}
        {showUpload && (
          <div style={{ background:'#111D3E', border:'1px solid rgba(212,230,0,0.2)', borderRadius:'8px', padding:'20px', marginBottom:'24px' }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'14px', letterSpacing:'0.08em', textTransform:'uppercase', color:'#F0EDE4', marginBottom:'14px' }}>Upload New Devotion</div>
            <div className="dev-upload-grid">
              <input placeholder="Title" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} style={inp}/>
              <input placeholder="PDF URL" value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} style={inp}/>
              <select value={uploadPhase} onChange={(e) => setUploadPhase(e.target.value as Phase)} style={inp}>
                <option value="pre">Pre-Camp</option>
                <option value="during">During Camp</option>
                <option value="post">Post-Camp</option>
              </select>
              <input type="number" placeholder="Day #" value={uploadDay} min={0} max={10} onChange={(e) => setUploadDay(parseInt(e.target.value, 10))} style={inp}/>
            </div>
            <button onClick={handleUpload} style={primaryBtn}>Upload</button>
          </div>
        )}

        {/* Phase tabs */}
        <div className="dev-phases">
          {(['pre','during','post'] as Phase[]).map((phase) => (
            <button key={phase} onClick={() => { setActivePhase(phase); setSelectedDevotion(null); setReflection(''); }} style={{
              borderColor: activePhase === phase ? '#D4E600' : 'rgba(255,255,255,0.08)',
              background:  activePhase === phase ? 'rgba(212,230,0,0.1)' : 'transparent',
              color:       activePhase === phase ? '#D4E600' : 'rgba(240,237,228,0.35)',
            }}>{PHASE_LABELS[phase]}</button>
          ))}
        </div>

        {/* List + viewer */}
        <div className={selectedDevotion ? 'dev-grid' : 'dev-list'} style={selectedDevotion ? {} : { display:'flex', flexDirection:'column', gap:'8px' }}>

          {/* Viewer — renders above list on mobile (order:-1) */}
          {selectedDevotion && (
            <div className="dev-viewer" style={{ background:'#111D3E', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', overflow:'hidden' }}>
              {/* Back button on mobile */}
              <button onClick={() => setSelectedDevotion(null)} style={{
                display:'none', width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.04)',
                border:'none', borderBottom:'1px solid rgba(255,255,255,0.06)',
                color:'rgba(240,237,228,0.5)', fontSize:'12px', fontWeight:700,
                fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em',
                textTransform:'uppercase', cursor:'pointer', textAlign:'left',
              }} className="dev-back">← Back to list</button>

              <iframe src={selectedDevotion.pdfUrl} title={selectedDevotion.title} style={{ width:'100%', height:'340px', border:'none', background:'#000' }}/>

              {/* Scratchpad */}
              <div style={{ padding:'20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px', gap:'12px', flexWrap:'wrap' }}>
                  <div>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.15em', textTransform:'uppercase', color:'#D4E600', marginBottom:'2px' }}>My Reflection</div>
                    <div style={{ fontSize:'11px', color:'rgba(240,237,228,0.25)', fontFamily:"'Barlow',sans-serif" }}>Private scratchpad — nothing is saved or shared</div>
                  </div>
                  <button onClick={handleCopy} disabled={!reflection.trim()} style={{
                    padding:'9px 16px', borderRadius:'4px', flexShrink:0,
                    border:`1px solid ${copied ? 'rgba(90,138,60,0.6)' : 'rgba(255,255,255,0.1)'}`,
                    background: copied ? 'rgba(90,138,60,0.15)' : 'rgba(255,255,255,0.04)',
                    color: copied ? '#8BC34A' : reflection.trim() ? 'rgba(240,237,228,0.6)' : 'rgba(240,237,228,0.2)',
                    fontSize:'11px', fontWeight:700, cursor: reflection.trim() ? 'pointer' : 'not-allowed',
                    fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase',
                    transition:'all 0.15s',
                  }}>{copied ? '✓ Copied!' : 'Copy Text'}</button>
                </div>
                <textarea
                  value={reflection}
                  onChange={(e) => { setReflection(e.target.value); setCopied(false); }}
                  placeholder="Write freely... What is God saying to you? This stays on your screen only."
                  rows={5}
                  style={{ ...inp, width:'100%', resize:'vertical', lineHeight:1.7, boxSizing:'border-box', fontFamily:"'Barlow',sans-serif", fontSize:'14px' }}
                />
                <p style={{ marginTop:'10px', fontSize:'11px', color:'rgba(240,237,228,0.2)', fontFamily:"'Barlow',sans-serif", fontStyle:'italic' }}>
                  💛 Consider sharing your reflection with your mentor or cell leader — copy it and send it over.
                </p>
              </div>
            </div>
          )}

          {/* Devotion list */}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {filtered.length === 0 && (
              <p style={{ color:'rgba(240,237,228,0.3)', fontSize:'13px', fontFamily:"'Barlow',sans-serif" }}>No devotions uploaded yet.</p>
            )}
            {filtered.map((d: Devotion) => {
              const active = selectedDevotion?.id === d.id;
              return (
                <button key={d.id} onClick={() => openDevotion(d)} style={{
                  textAlign:'left', padding:'16px', borderRadius:'6px',
                  border:`1px solid ${active ? '#D4E600' : 'rgba(255,255,255,0.07)'}`,
                  background: active ? 'rgba(212,230,0,0.08)' : '#111D3E',
                  cursor:'pointer', transition:'all 0.12s',
                  borderLeft:`3px solid ${active ? '#D4E600' : 'transparent'}`,
                }}>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:'14px', color: active ? '#F0EDE4' : 'rgba(240,237,228,0.7)', marginBottom:'4px' }}>{d.title}</div>
                  <div style={{ fontSize:'11px', color:'rgba(240,237,228,0.25)', fontFamily:"'Barlow',sans-serif" }}>{d.uploadedBy}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Show back button on mobile when viewer is open */}
      <style>{`
        @media (max-width: 640px) {
          .dev-back { display: block !important; }
        }
      `}</style>
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