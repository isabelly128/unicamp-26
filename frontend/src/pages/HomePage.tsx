import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCommunityStore } from '../stores/communityStore';

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

// Hosts known to block hotlinking
const BLOCKED_HOSTS = ['imgur.com', 'i.imgur.com', 'instagram.com', 'facebook.com', 'twitter.com', 'x.com'];

function isBlockedUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    return BLOCKED_HOSTS.some((b) => host === b || host.endsWith('.' + b));
  } catch {
    return false;
  }
}

const SUGGESTED_HOSTS = `• Cloudinary (cloudinary.com) — free, reliable
• imgbb.com — free direct links
• Unsplash (images.unsplash.com) — free photos
• Your own Vercel/GitHub hosted image
• Google Drive: use format
  drive.google.com/uc?export=view&id=FILE_ID`;

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
  .edit-popover { position: absolute; top: calc(100% + 6px); right: 0; background: #0D1635; border: 1px solid rgba(212,230,0,0.3); border-radius: 8px; padding: 14px; width: 280px; z-index: 999; box-shadow: 0 12px 32px rgba(0,0,0,0.6); }
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

// Tests whether an image URL actually loads cross-origin
function useImageTest(url: string): 'idle' | 'loading' | 'ok' | 'error' {
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'error'>('idle');
  useEffect(() => {
    if (!url) { setStatus('idle'); return; }
    setStatus('loading');
    const img = new Image();
    img.onload  = () => setStatus('ok');
    img.onerror = () => setStatus('error');
    img.src = url;
  }, [url]);
  return status;
}

const CardEditPopover: React.FC<{
  cardPath: string;
  bgUrl: string;
  onSave: (url: string) => void;
  onRemove: () => void;
}> = ({ cardPath: _cardPath, bgUrl, onSave, onRemove }) => {
  const [open, setOpen]         = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [warning, setWarning]   = useState('');
  const containerRef            = useRef<HTMLDivElement>(null!);
  const testStatus              = useImageTest(urlInput.trim());

  useOutsideClick(containerRef, () => { setOpen(false); setWarning(''); });

  const validate = (url: string): string => {
    if (!url) return '';
    if (isBlockedUrl(url)) return `⚠️ Imgur blocks images on external sites. Please use a different host (see below).`;
    if (!url.startsWith('http')) return '⚠️ URL must start with https://';
    return '';
  };

  const handleSave = () => {
    const url = urlInput.trim();
    if (!url) return;
    const err = validate(url);
    if (err) { setWarning(err); return; }
    if (testStatus === 'error') { setWarning('⚠️ This image failed to load. The host may be blocking external use.'); return; }
    onSave(url);
    setUrlInput('');
    setWarning('');
    setOpen(false);
  };

  const handleRemove = () => { onRemove(); setOpen(false); };

  const inputBorder = urlInput
    ? testStatus === 'ok'   ? '1px solid rgba(90,138,60,0.6)'
    : testStatus === 'error'? '1px solid rgba(220,80,80,0.5)'
    : '1px solid rgba(255,255,255,0.12)'
    : '1px solid rgba(255,255,255,0.12)';

  return (
    <div ref={containerRef} style={{ position:'relative' }}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); setWarning(''); }}
        style={{ padding:'4px 9px', borderRadius:'4px', border:'1px solid rgba(212,230,0,0.4)', background:'rgba(10,17,40,0.85)', color:'rgba(212,230,0,0.85)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase', backdropFilter:'blur(6px)', whiteSpace:'nowrap' }}
      >
        🖼 {bgUrl ? 'Change' : 'Add Photo'}
      </button>

      {open && (
        <div className="edit-popover" onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize:'10px', color:'rgba(212,230,0,0.6)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'8px' }}>
            Card background image
          </div>

          {/* Preview of current image */}
          {bgUrl && (
            <img src={bgUrl} alt="current bg" style={{ width:'100%', height:'60px', objectFit:'cover', borderRadius:'4px', marginBottom:'8px', display:'block' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; }}/>
          )}

          <input
            value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); setWarning(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleSave(); } }}
            placeholder="Paste a direct image URL…"
            autoFocus
            style={{ width:'100%', padding:'8px 10px', borderRadius:'4px', border: inputBorder, background:'rgba(255,255,255,0.06)', color:'#F0EDE4', fontSize:'12px', outline:'none', boxSizing:'border-box', fontFamily:"'Barlow',sans-serif", marginBottom:'6px', transition:'border-color 0.2s' }}
          />

          {/* Live load status */}
          {urlInput && (
            <div style={{ fontSize:'11px', marginBottom:'8px', fontFamily:"'Barlow',sans-serif",
              color: testStatus==='ok'    ? '#8BC34A'
                   : testStatus==='error' ? '#e07070'
                   : 'rgba(240,237,228,0.35)'
            }}>
              {testStatus==='loading' && '⏳ Testing image…'}
              {testStatus==='ok'      && '✓ Image loaded successfully'}
              {testStatus==='error'   && '✕ Image failed to load — this host may block external use'}
            </div>
          )}

          {/* Warning */}
          {warning && (
            <div style={{ fontSize:'11px', color:'#e07070', fontFamily:"'Barlow',sans-serif", marginBottom:'8px', lineHeight:1.5, background:'rgba(220,80,80,0.08)', borderRadius:'4px', padding:'8px 10px', border:'1px solid rgba(220,80,80,0.2)' }}>
              {warning}
            </div>
          )}

          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'10px' }}>
            <button onClick={(e) => { e.stopPropagation(); handleSave(); }} style={smPrimary}>Save</button>
            {bgUrl && <button onClick={(e) => { e.stopPropagation(); handleRemove(); }} style={smDanger}>Remove</button>}
            <button onClick={(e) => { e.stopPropagation(); setOpen(false); }} style={smGhost}>Cancel</button>
          </div>

          {/* Suggested hosts */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'10px' }}>
            <div style={{ fontSize:'9px', color:'rgba(212,230,0,0.5)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'5px' }}>✅ Works well with</div>
            <pre style={{ fontSize:'10px', color:'rgba(240,237,228,0.35)', fontFamily:"'Barlow',sans-serif", whiteSpace:'pre-wrap', lineHeight:1.6, margin:0 }}>{SUGGESTED_HOSTS}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export const HomePage: React.FC = () => {
  const { user, hasRole }   = useAuthStore();
  const { heroBgUrl, setHeroBgUrl, cardImages, setCardImage, removeCardImage } = useCommunityStore();

  const firstName = user?.name?.split(' ')[0] ?? 'friend';
  const isAdmin   = hasRole(['administrator']);

  const [showHeroUpload, setShowHeroUpload]     = useState(false);
  const [heroBgInput, setHeroBgInput]           = useState('');
  const [heroWarning, setHeroWarning]           = useState('');
  const heroTestStatus                          = useImageTest(heroBgInput.trim());

  const saveHeroBg = () => {
    const url = heroBgInput.trim();
    if (!url) return;
    if (isBlockedUrl(url)) { setHeroWarning('⚠️ Imgur blocks images on external sites. Please use imgbb.com, Cloudinary, or a direct Google Drive link instead.'); return; }
    if (heroTestStatus === 'error') { setHeroWarning('⚠️ This image failed to load. Try a different host.'); return; }
    setHeroBgUrl(url);
    setHeroBgInput('');
    setHeroWarning('');
    setShowHeroUpload(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="home-page">

        {/* ── Hero ── */}
        <div style={{ position:'relative', borderRadius:'8px', overflow:'hidden', marginBottom:'40px', background: heroBgUrl ? 'transparent' : 'linear-gradient(135deg,#0D1B4A 0%,#111D3E 100%)', border:'1px solid rgba(212,230,0,0.15)', padding:'48px 48px 40px', minHeight:'280px', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>

          {heroBgUrl && (
            <>
              <img
                src={heroBgUrl} alt=""
                style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
                onError={(e) => {
                  // Image failed — hide it and show fallback bg
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(10,17,40,0.95) 0%,rgba(10,17,40,0.5) 60%,rgba(10,17,40,0.3) 100%)' }}/>
            </>
          )}
          {!heroBgUrl && <div style={{ position:'absolute', top:0, right:0, width:'50%', height:'100%', background:'radial-gradient(ellipse at 80% 30%,rgba(74,144,217,0.1) 0%,transparent 60%)', pointerEvents:'none' }}/>}

          <div style={{ position:'absolute', top:'28px', left:'48px', fontSize:'11px', letterSpacing:'0.2em', color:'rgba(212,230,0,0.6)', fontWeight:600, textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif" }}>{CAMP_DATES}</div>

          {isAdmin && (
            <div style={{ position:'absolute', top:'20px', right:'20px', zIndex:2 }}>
              {showHeroUpload ? (
                <div style={{ background:'#0D1635', border:'1px solid rgba(212,230,0,0.3)', borderRadius:'8px', padding:'14px', width:'300px', boxShadow:'0 12px 32px rgba(0,0,0,0.6)' }}>
                  <div style={{ fontSize:'10px', color:'rgba(212,230,0,0.6)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'8px' }}>Hero background image</div>
                  <input
                    value={heroBgInput}
                    onChange={(e) => { setHeroBgInput(e.target.value); setHeroWarning(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveHeroBg(); }}
                    placeholder="Paste a direct image URL…"
                    autoFocus
                    style={{ width:'100%', padding:'8px 10px', borderRadius:'4px', border: heroTestStatus==='ok' ? '1px solid rgba(90,138,60,0.6)' : heroTestStatus==='error' ? '1px solid rgba(220,80,80,0.5)' : '1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'#F0EDE4', fontSize:'12px', outline:'none', boxSizing:'border-box' as const, fontFamily:"'Barlow',sans-serif", marginBottom:'6px' }}
                  />
                  {heroBgInput && (
                    <div style={{ fontSize:'11px', marginBottom:'6px', fontFamily:"'Barlow',sans-serif", color: heroTestStatus==='ok' ? '#8BC34A' : heroTestStatus==='error' ? '#e07070' : 'rgba(240,237,228,0.35)' }}>
                      {heroTestStatus==='loading' && '⏳ Testing…'}
                      {heroTestStatus==='ok'      && '✓ Image loaded successfully'}
                      {heroTestStatus==='error'   && '✕ Image failed — try a different host'}
                    </div>
                  )}
                  {heroWarning && <div style={{ fontSize:'11px', color:'#e07070', fontFamily:"'Barlow',sans-serif", marginBottom:'8px', lineHeight:1.5 }}>{heroWarning}</div>}
                  <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                    <button onClick={saveHeroBg} style={smPrimary}>Save</button>
                    {heroBgUrl && <button onClick={() => { setHeroBgUrl(''); setShowHeroUpload(false); }} style={smDanger}>Remove</button>}
                    <button onClick={() => { setShowHeroUpload(false); setHeroWarning(''); }} style={smGhost}>Cancel</button>
                  </div>
                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:'10px', paddingTop:'10px' }}>
                    <pre style={{ fontSize:'10px', color:'rgba(240,237,228,0.3)', fontFamily:"'Barlow',sans-serif", whiteSpace:'pre-wrap', lineHeight:1.6, margin:0 }}>{SUGGESTED_HOSTS}</pre>
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
              <div key={card.path} className="home-card"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = card.accent; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                {isAdmin && (
                  <div className="home-card-edit-btn">
                    <CardEditPopover cardPath={card.path} bgUrl={bgUrl} onSave={(url) => setCardImage(card.path, url)} onRemove={() => removeCardImage(card.path)}/>
                  </div>
                )}

                <div className="home-card-inner">
                  <CardBackground bgUrl={bgUrl} />
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

// Renders card background — falls back to solid dark if image errors
const CardBackground: React.FC<{ bgUrl: string }> = ({ bgUrl }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => { setFailed(false); }, [bgUrl]);

  if (!bgUrl || failed) {
    return <div className="home-card-bg" style={{ background: '#111D3E' }}/>;
  }

  return (
    <div
      className="home-card-bg"
      style={{ backgroundImage: `url(${bgUrl})` }}
      // CSS background doesn't fire onerror — use a hidden img to detect failure
    >
      <img
        src={bgUrl} alt=""
        style={{ position:'absolute', width:1, height:1, opacity:0, pointerEvents:'none' }}
        onError={() => setFailed(true)}
      />
    </div>
  );
};

const smPrimary: React.CSSProperties = { padding:'6px 12px', borderRadius:'4px', border:'none', background:'#D4E600', color:'#0A1128', fontSize:'10px', fontWeight:800, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' };
const smGhost:   React.CSSProperties = { padding:'6px 10px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(240,237,228,0.5)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif" };
const smDanger:  React.CSSProperties = { padding:'6px 10px', borderRadius:'4px', border:'1px solid rgba(220,80,80,0.3)', background:'transparent', color:'rgba(220,80,80,0.6)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif" };