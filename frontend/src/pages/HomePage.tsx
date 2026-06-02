import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCommunityStore } from '../stores/communityStore';
import { toDirectImageUrl, getImageUrlHint } from '../utils/imageUtils';

interface FeatureCard {
  icon: string; label: string; labelScript: string;
  path: string; desc: string; accent: string;
}

const FEATURE_CARDS: FeatureCard[] = [
  { icon:'📖', label:'CAMP',   labelScript:'Booklet',   path:'/booklet',   desc:'Program flow & schedule',    accent:'#D4E600' },
  { icon:'🕊️', label:'DAILY', labelScript:'Devotions', path:'/devotions', desc:'Read · Reflect · Record',    accent:'#4A90D9' },
  { icon:'📝', label:'SERMON', labelScript:'Notes',     path:'/sermons',   desc:'Session notes & questions',  accent:'#D4E600' },
  { icon:'📸', label:'CAMP',   labelScript:'Photos',    path:'/photos',    desc:'Camp memories',              accent:'#5A8A3C' },
  { icon:'🙏', label:'PRAYER', labelScript:'Wall',      path:'/prayer',    desc:'Submit & see requests',      accent:'#4A90D9' },
  { icon:'✝️', label:'',       labelScript:'Testimony', path:'/testimony', desc:'Convictions & thanksgiving', accent:'#D4E600' },
];

const CAMP_DATES  = 'June 1–4, 2026';
const THEME_VERSE = '"Then I heard the voice of the Lord saying, \'Whom shall I send?\' And I said, \'Here am I. Send me!\'" — Isaiah 6:8';

const CSS = `
  .home-page { padding: 32px 40px 60px; max-width: 960px; }
  .home-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
  .home-card { position: relative; min-height: 130px; border-radius: 6px; overflow: visible; border: 1px solid rgba(255,255,255,0.06); transition: border-color 0.15s, transform 0.15s; }
  .home-card:hover { transform: translateY(-2px); }
  .home-card-inner { border-radius: 6px; overflow: hidden; position: relative; height: 100%; min-height: 130px; }
  .home-card-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
  .home-card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,17,40,0.92) 0%, rgba(10,17,40,0.5) 60%, rgba(10,17,40,0.25) 100%); }
  .home-card-content { position: relative; z-index: 1; height: 100%; min-height: 130px; display: flex; flex-direction: column; justify-content: flex-end; padding: 20px 16px 16px; }
  .home-card-edit-btn { position: absolute; top: 8px; right: 8px; z-index: 10; opacity: 0; transition: opacity 0.15s; }
  .home-card:hover .home-card-edit-btn { opacity: 1; }
  .edit-popover { position: absolute; top: calc(100% + 6px); right: 0; background: #0D1635; border: 1px solid rgba(212,230,0,0.3); border-radius: 8px; padding: 14px; width: 270px; z-index: 999; box-shadow: 0 12px 32px rgba(0,0,0,0.6); }
  @media (max-width: 640px) {
    .home-page { padding: 20px 16px 40px; }
    .home-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .home-card-edit-btn { opacity: 1; }
    .edit-popover { width: 220px; right: auto; left: 0; }
  }
`;

function useOutsideClick(ref: React.RefObject<HTMLElement>, onClose: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

// ── Image preview with load/error state ──────────────────────────────────────
const ImagePreview: React.FC<{ url: string }> = ({ url }) => {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => { setStatus('loading'); }, [url]);

  if (!url) return null;

  return (
    <div style={{ marginBottom: '8px' }}>
      {status !== 'error' && (
        <img
          src={url}
          alt="preview"
          onLoad={() => setStatus('ok')}
          onError={() => setStatus('error')}
          style={{
            width: '100%', height: '70px', objectFit: 'cover',
            borderRadius: '4px', display: 'block',
            opacity: status === 'loading' ? 0.4 : 1,
            transition: 'opacity 0.2s',
          }}
        />
      )}
      {status === 'error' && (
        <div style={{
          padding: '8px 10px', borderRadius: '4px',
          background: 'rgba(220,80,80,0.1)', border: '1px solid rgba(220,80,80,0.25)',
          fontSize: '11px', color: '#e07070', fontFamily: "'Barlow',sans-serif", lineHeight: 1.5,
        }}>
          ✕ Image failed to load.<br/>
          <span style={{ opacity: 0.7 }}>
            For imgbb: use the <strong>Direct link</strong> from the upload page
            (starts with <code style={{ fontSize:'10px' }}>i.ibb.co</code>, not <code style={{ fontSize:'10px' }}>ibb.co</code>).<br/>
            For Google Drive: make sure sharing is <strong>Anyone with the link → Viewer</strong>.
          </span>
        </div>
      )}
      {status === 'ok' && (
        <div style={{ fontSize:'10px', color:'rgba(90,200,90,0.8)', fontFamily:"'Barlow',sans-serif", marginTop:'4px' }}>
          ✓ Image loaded successfully
        </div>
      )}
    </div>
  );
};

// ── Self-contained per-card edit popover ─────────────────────────────────────
const CardEditPopover: React.FC<{
  bgUrl: string;
  onSave: (url: string) => void;
  onRemove: () => void;
}> = ({ bgUrl, onSave, onRemove }) => {
  const [open, setOpen]         = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [preview, setPreview]   = useState('');
  const containerRef            = useRef<HTMLDivElement>(null!);

  useOutsideClick(containerRef, () => setOpen(false));

  // Auto-convert URL as user types
  useEffect(() => {
    const converted = toDirectImageUrl(rawInput);
    setPreview(converted);
  }, [rawInput]);

  const handleSave = () => {
    const url = toDirectImageUrl(rawInput.trim());
    if (url) onSave(url);
    setRawInput('');
    setPreview('');
    setOpen(false);
  };

  const handleRemove = () => { onRemove(); setOpen(false); };
  const hint = getImageUrlHint(rawInput);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); setRawInput(''); setPreview(''); }}
        style={{
          padding: '4px 9px', borderRadius: '4px',
          border: '1px solid rgba(212,230,0,0.4)',
          background: 'rgba(10,17,40,0.85)', color: 'rgba(212,230,0,0.85)',
          fontSize: '10px', fontWeight: 700, cursor: 'pointer',
          fontFamily: "'Barlow Condensed',sans-serif",
          letterSpacing: '0.08em', textTransform: 'uppercase',
          backdropFilter: 'blur(6px)', whiteSpace: 'nowrap',
        }}
      >
        🖼 {bgUrl ? 'Change' : 'Add Photo'}
      </button>

      {open && (
        <div className="edit-popover" onClick={(e) => e.stopPropagation()}>

          <div style={{ fontSize:'10px', color:'rgba(212,230,0,0.6)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'8px' }}>
            Card background image
          </div>

          {/* Current image */}
          {bgUrl && !rawInput && <ImagePreview url={bgUrl} />}

          {/* URL input */}
          <input
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); e.stopPropagation(); }}
            placeholder="Paste image URL…"
            autoFocus
            style={{
              width: '100%', padding: '8px 10px', borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)', color: '#F0EDE4',
              fontSize: '12px', outline: 'none', boxSizing: 'border-box',
              fontFamily: "'Barlow',sans-serif", marginBottom: '6px',
            }}
          />

          {/* Hint for known hosts */}
          {hint && (
            <div style={{ fontSize:'10px', color:'rgba(212,230,0,0.55)', fontFamily:"'Barlow',sans-serif", marginBottom:'6px', lineHeight:1.5 }}>
              ℹ️ {hint}
            </div>
          )}

          {/* Live preview of converted URL */}
          {preview && <ImagePreview url={preview} />}

          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'4px' }}>
            <button onClick={(e) => { e.stopPropagation(); handleSave(); }} style={smPrimary}>Save</button>
            {bgUrl && <button onClick={(e) => { e.stopPropagation(); handleRemove(); }} style={smDanger}>Remove</button>}
            <button onClick={(e) => { e.stopPropagation(); setOpen(false); }} style={smGhost}>Cancel</button>
          </div>

          {/* How-to guide */}
          <div style={{ marginTop:'12px', paddingTop:'10px', borderTop:'1px solid rgba(255,255,255,0.06)', fontSize:'10px', color:'rgba(240,237,228,0.3)', fontFamily:"'Barlow',sans-serif", lineHeight:1.7 }}>
            <strong style={{ color:'rgba(240,237,228,0.5)' }}>How to get a working URL:</strong><br/>
            <strong>imgbb:</strong> upload → copy <em>Direct link</em> (i.ibb.co/…)<br/>
            <strong>Drive:</strong> share → Anyone → copy link → paste here<br/>
            <strong>Imgur:</strong> right-click image → Copy image address
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main page ────────────────────────────────────────────────────────────────
export const HomePage: React.FC = () => {
  const { user, hasRole }                                        = useAuthStore();
  const { heroBgUrl, setHeroBgUrl, cardImages, setCardImage, removeCardImage } = useCommunityStore();

  const firstName = user?.name?.split(' ')[0] ?? 'friend';
  const isAdmin   = hasRole(['administrator']);

  const [showHeroUpload, setShowHeroUpload] = useState(false);
  const [heroBgInput, setHeroBgInput]       = useState('');
  const [heroPreview, setHeroPreview]       = useState('');

  useEffect(() => { setHeroPreview(toDirectImageUrl(heroBgInput)); }, [heroBgInput]);

  const saveHeroBg = () => {
    const url = toDirectImageUrl(heroBgInput.trim());
    if (url) setHeroBgUrl(url);
    setHeroBgInput('');
    setHeroPreview('');
    setShowHeroUpload(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="home-page">

        {/* ── Hero ── */}
        <div style={{
          position:'relative', borderRadius:'8px', overflow:'hidden', marginBottom:'40px',
          background: heroBgUrl ? 'transparent' : 'linear-gradient(135deg,#0D1B4A 0%,#111D3E 100%)',
          border:'1px solid rgba(212,230,0,0.15)',
          padding:'48px 48px 40px', minHeight:'280px',
          display:'flex', flexDirection:'column', justifyContent:'flex-end',
        }}>
          {heroBgUrl && (
            <>
              <img src={heroBgUrl} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(10,17,40,0.95) 0%,rgba(10,17,40,0.5) 60%,rgba(10,17,40,0.3) 100%)' }}/>
            </>
          )}
          {!heroBgUrl && <div style={{ position:'absolute', top:0, right:0, width:'50%', height:'100%', background:'radial-gradient(ellipse at 80% 30%,rgba(74,144,217,0.1) 0%,transparent 60%)', pointerEvents:'none' }}/>}

          <div style={{ position:'absolute', top:'28px', left:'48px', fontSize:'11px', letterSpacing:'0.2em', color:'rgba(212,230,0,0.6)', fontWeight:600, textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif" }}>{CAMP_DATES}</div>

          {isAdmin && (
            <div style={{ position:'absolute', top:'20px', right:'20px', zIndex:2 }}>
              {showHeroUpload ? (
                <div style={{ background:'#0D1635', border:'1px solid rgba(212,230,0,0.3)', borderRadius:'8px', padding:'14px', width:'280px', boxShadow:'0 12px 32px rgba(0,0,0,0.6)' }}>
                  <div style={{ fontSize:'10px', color:'rgba(212,230,0,0.6)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'8px' }}>Hero background image</div>
                  <input
                    value={heroBgInput} onChange={(e) => setHeroBgInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveHeroBg(); }}
                    placeholder="Paste image URL…"
                    autoFocus
                    style={{ width:'100%', padding:'8px 10px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'#F0EDE4', fontSize:'12px', outline:'none', boxSizing:'border-box', fontFamily:"'Barlow',sans-serif", marginBottom:'8px' }}
                  />
                  {heroPreview && <ImagePreview url={heroPreview} />}
                  <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                    <button onClick={saveHeroBg} style={smPrimary}>Save</button>
                    {heroBgUrl && <button onClick={() => { setHeroBgUrl(''); setShowHeroUpload(false); }} style={smDanger}>Remove</button>}
                    <button onClick={() => setShowHeroUpload(false)} style={smGhost}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowHeroUpload(true)} style={{ padding:'6px 12px', borderRadius:'4px', border:'1px solid rgba(212,230,0,0.25)', background:'rgba(10,17,40,0.7)', color:'rgba(212,230,0,0.6)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', backdropFilter:'blur(4px)' }}>
                  🖼 {heroBgUrl ? 'Change Photo' : 'Add Photo'}
                </button>
              )}
            </div>
          )}

          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:'14px', flexWrap:'wrap', marginBottom:'4px' }}>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'clamp(48px,8vw,88px)', lineHeight:0.9, textTransform:'uppercase', color:'#F0EDE4', letterSpacing:'-0.02em' }}>HERE</span>
              <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(36px,6vw,68px)', lineHeight:0.9, color:'#D4E600' }}>I Am,</span>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'clamp(48px,8vw,88px)', lineHeight:0.9, textTransform:'uppercase', color:'#F0EDE4', letterSpacing:'-0.02em' }}>LORD.</span>
            </div>
            <p style={{ fontSize:'12px', color:'rgba(240,237,228,0.35)', fontStyle:'italic', lineHeight:1.7, maxWidth:'420px', marginTop:'16px', marginBottom:'24px', fontFamily:"'Barlow',sans-serif" }}>{THEME_VERSE}</p>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <a href="https://open.spotify.com/playlist/your-playlist-id" target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 18px', background:'#1DB954', borderRadius:'4px', textDecoration:'none', color:'#fff', fontSize:'11px', fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' }}>🎵 Camp Playlist</a>
              <a href="https://t.me/your-group-link" target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 18px', background:'#0088cc', borderRadius:'4px', textDecoration:'none', color:'#fff', fontSize:'11px', fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' }}>💬 Telegram</a>
            </div>
          </div>
        </div>

        {/* ── Welcome ── */}
        <div style={{ marginBottom:'24px' }}>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'28px', textTransform:'uppercase', letterSpacing:'-0.01em', color:'#F0EDE4' }}>WELCOME BACK, </span>
          <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'24px', color:'#D4E600' }}>{firstName}.</span>
        </div>

        {/* ── Feature grid ── */}
        <div className="home-grid">
          {FEATURE_CARDS.map((card) => {
            const bgUrl = cardImages[card.path] ?? '';
            return (
              <div
                key={card.path}
                className="home-card"
                style={{ borderColor:'rgba(255,255,255,0.06)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = card.accent; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                {isAdmin && (
                  <div className="home-card-edit-btn">
                    <CardEditPopover
                      bgUrl={bgUrl}
                      onSave={(url) => setCardImage(card.path, url)}
                      onRemove={() => removeCardImage(card.path)}
                    />
                  </div>
                )}

                <div className="home-card-inner">
                  {bgUrl
                    ? <div className="home-card-bg" style={{ backgroundImage:`url(${bgUrl})` }}/>
                    : <div className="home-card-bg" style={{ background:'#111D3E' }}/>
                  }
                  {bgUrl && <div className="home-card-overlay"/>}

                  <Link to={card.path} style={{ textDecoration:'none', display:'block' }}>
                    <div className="home-card-content">
                      <div style={{ position:'absolute', top:'14px', right:'14px', fontSize:'20px', opacity: bgUrl ? 0.8 : 0.55 }}>{card.icon}</div>
                      <div>
                        {card.label && <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'10px', letterSpacing:'0.12em', textTransform:'uppercase', color:card.accent, marginBottom:'2px' }}>{card.label}</div>}
                        <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'20px', color:'#F0EDE4', lineHeight:1.1, marginBottom:'6px' }}>{card.labelScript}</div>
                        <div style={{ fontSize:'11px', color: bgUrl ? 'rgba(240,237,228,0.55)' : 'rgba(240,237,228,0.3)', fontFamily:"'Barlow',sans-serif" }}>{card.desc}</div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const smPrimary: React.CSSProperties = { padding:'6px 12px', borderRadius:'4px', border:'none', background:'#D4E600', color:'#0A1128', fontSize:'10px', fontWeight:800, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' };
const smGhost:   React.CSSProperties = { padding:'6px 10px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(240,237,228,0.5)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif" };
const smDanger:  React.CSSProperties = { padding:'6px 10px', borderRadius:'4px', border:'1px solid rgba(220,80,80,0.3)', background:'transparent', color:'rgba(220,80,80,0.6)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif" };