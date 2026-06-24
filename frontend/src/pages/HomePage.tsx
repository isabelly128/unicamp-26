import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCommunityStore } from '../stores/communityStore';

const CAMP_DATES = 'June 1–4, 2026';
const VERSE_REF  = 'Matthew 7:13-14';
const VERSE_FULL = '13 "Enter through the narrow gate. For wide is the gate and broad is the road that leads to destruction, and many enter through it. 14 But small is the gate and narrow the road that leads to life, and only a few find it."';

interface FeatureCard {
  icon: string; label: string; labelScript: string;
  path: string; desc: string; accent: string;
}

const FEATURE_CARDS: FeatureCard[] = [
  { icon:'📖', label:'CAMP',   labelScript:'Booklet',   path:'/booklet',   desc:'Program flow & schedule',    accent:'#f7f6dd' },
  { icon:'🕊️', label:'DAILY', labelScript:'Devotions', path:'/devotions', desc:'Read · Reflect · Record',    accent:'#4A90D9' },
  { icon:'📝', label:'SERMON', labelScript:'Notes',     path:'/sermons',   desc:'Session notes & questions',  accent:'#f7f6dd' },
  { icon:'📸', label:'CAMP',   labelScript:'Photos',    path:'/photos',    desc:'Camp memories',              accent:'#5A8A3C' },
  { icon:'🙏', label:'PRAYER', labelScript:'Wall',      path:'/prayer',    desc:'Submit & see requests',      accent:'#4A90D9' },
  { icon:'✝️', label:'',       labelScript:'Testimony', path:'/testimony', desc:'Convictions & thanksgiving', accent:'#f7f6dd' },
];

const CSS = `
  .home-page { padding: 32px 40px 60px; max-width: 960px; }
  .home-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }

  /* Card — background-image set inline via style prop, works everywhere */
  .feat-card {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 20px 16px 16px;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 6px;
    text-decoration: none;
    min-height: 140px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.15s, transform 0.15s;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  .feat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(10,17,40,0.93) 0%, rgba(10,17,40,0.45) 60%, rgba(10,17,40,0.2) 100%);
    pointer-events: none;
  }
  .feat-card:hover { transform: translateY(-2px); }

  /* Admin edit overlay */
  .card-edit-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding: 10px;
    opacity: 0;
    transition: opacity 0.15s;
    pointer-events: none;
    z-index: 10;
  }
  .card-wrap:hover .card-edit-overlay,
  .card-wrap:focus-within .card-edit-overlay {
    opacity: 1;
    pointer-events: auto;
  }

  @media (max-width: 640px) {
    .home-page { padding: 20px 16px 40px; }
    .home-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .feat-card { min-height: 120px; }
    /* Always show edit button on mobile (no hover) */
    .card-edit-overlay { opacity: 1 !important; pointer-events: auto !important; }
  }
`;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const HomePage: React.FC = () => {
  const { user, hasRole }                         = useAuthStore();
  const { heroBgUrl, setHeroBgUrl,
          cardImages, setCardImage }               = useCommunityStore();
  const firstName                                 = user?.name?.split(' ')[0] ?? 'friend';
  const isAdmin                                   = hasRole(['administrator']);

  const heroBgRef                                 = useRef<HTMLInputElement>(null);
  const [heroBgLoading, setHeroBgLoading]         = useState(false);
  const cardRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleHeroBgFile = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroBgLoading(true);
    const dataUrl = await fileToDataUrl(file);
    setHeroBgUrl(dataUrl);
    setHeroBgLoading(false);
    e.target.value = '';
  };

  const handleCardFile = async (path: string, e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setCardImage(path, dataUrl);
    e.target.value = '';
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="home-page">

        {/* ── Hero ── */}
        <div style={{
          position: 'relative', borderRadius: '8px', overflow: 'hidden',
          marginBottom: '40px',
          border: '1px solid rgba(247,246,221,0.15)',
          padding: '48px 48px 40px', minHeight: '280px',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          backgroundImage: heroBgUrl ? `url(${heroBgUrl})` : 'none',
          backgroundSize: 'cover', backgroundPosition: 'center',
          backgroundColor: heroBgUrl ? 'transparent' : 'transparent',
          background: heroBgUrl
            ? `url(${heroBgUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg,#0D1B4A 0%,#111D3E 100%)',
        }}>
          {/* Gradient overlay — always present, stronger when image loaded */}
          <div style={{
            position: 'absolute', inset: 0,
            background: heroBgUrl
              ? 'linear-gradient(to top,rgba(10,17,40,0.95) 0%,rgba(10,17,40,0.5) 55%,rgba(10,17,40,0.25) 100%)'
              : 'radial-gradient(ellipse at 80% 30%,rgba(74,144,217,0.1) 0%,transparent 60%)',
            pointerEvents: 'none',
          }}/>

          {/* Date label */}
          <div style={{ position:'absolute', top:'28px', left:'48px', fontSize:'11px', letterSpacing:'0.2em', color:'rgba(247,246,221,0.6)', fontWeight:600, textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif", zIndex:1 }}>{CAMP_DATES}</div>

          {/* Admin hero photo upload */}
          {isAdmin && (
            <div style={{ position:'absolute', top:'24px', right:'24px', zIndex:2, display:'flex', gap:'8px', alignItems:'center' }}>
              <input ref={heroBgRef} type="file" accept="image/png,image/jpeg,image/jpg" style={{ display:'none' }} onChange={handleHeroBgFile}/>
              <button onClick={() => heroBgRef.current?.click()} disabled={heroBgLoading} style={{ padding:'6px 12px', borderRadius:'4px', border:'1px solid rgba(247,246,221,0.25)', background:'rgba(10,17,40,0.75)', color:'rgba(247,246,221,0.7)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', backdropFilter:'blur(4px)' }}>
                {heroBgLoading ? 'Uploading…' : `🖼 ${heroBgUrl ? 'Change Photo' : 'Add Photo'}`}
              </button>
              {heroBgUrl && (
                <button onClick={() => setHeroBgUrl('')} style={{ padding:'6px 10px', borderRadius:'4px', border:'1px solid rgba(220,80,80,0.3)', background:'rgba(10,17,40,0.75)', color:'rgba(220,80,80,0.6)', fontSize:'10px', cursor:'pointer', backdropFilter:'blur(4px)' }}>Remove</button>
              )}
            </div>
          )}

          {/* Headline */}
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:'14px', flexWrap:'wrap', marginBottom:'4px' }}>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'clamp(48px,8vw,88px)', lineHeight:0.9, textTransform:'uppercase', color:'#f7f6dd', letterSpacing:'-0.02em' }}>The</span>
              <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(36px,6vw,68px)', lineHeight:0.9, color:'#f7f6dd' }}>Call.</span>
            </div>
            <p style={{ fontSize:'12px', color:'rgba(247,246,221,0.35)', fontStyle:'italic', lineHeight:1.8, maxWidth:'440px', marginTop:'16px', marginBottom:'24px', fontFamily:"'Barlow',sans-serif" }}>
              {VERSE_FULL} — {VERSE_REF}
            </p>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <a href="https://open.spotify.com/playlist/2glknYShkjRa8AGoLLEITH?si=u9r9qzrzTfyzD9DnRGTbrw" target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 18px', background:'#1DB954', borderRadius:'4px', textDecoration:'none', color:'#fff', fontSize:'11px', fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' }}>🎵 Camp Playlist</a>
              <a href="https://t.me/+byIFKl5mFR43ZjI1" target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 18px', background:'#0088cc', borderRadius:'4px', textDecoration:'none', color:'#fff', fontSize:'11px', fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' }}>💬 Telegram</a>
            </div>
          </div>
        </div>

        {/* Welcome */}
        <div style={{ marginBottom:'24px' }}>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'28px', textTransform:'uppercase', letterSpacing:'-0.01em', color:'#f7f6dd' }}>WELCOME BACK, </span>
          <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'24px', color:'#f7f6dd' }}>{firstName}.</span>
        </div>

        {/* Feature grid */}
        <div className="home-grid">
          {FEATURE_CARDS.map((card) => {
            const bgUrl = (cardImages as Record<string, string>)?.[card.path] ?? '';

            return (
              <div key={card.path} className="card-wrap" style={{ position:'relative' }}>

                {/* Hidden file input — admin only */}
                {isAdmin && (
                  <input
                    ref={(el) => { cardRefs.current[card.path] = el; }}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    style={{ display:'none' }}
                    onChange={(e) => handleCardFile(card.path, e)}
                  />
                )}

                {/* Card — uses CSS background-image so it works on all browsers/devices */}
                <Link
                  to={card.path}
                  className="feat-card"
                  style={{
                    backgroundImage: bgUrl ? `url(${bgUrl})` : 'none',
                    backgroundColor: '#111D3E',
                    borderColor: 'rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = card.accent; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  {/* Icon — sits above the gradient */}
                  <div style={{ position:'absolute', top:'14px', right:'14px', fontSize:'20px', opacity: bgUrl ? 0.9 : 0.55, zIndex:1 }}>{card.icon}</div>

                  {/* Text — sits above the gradient overlay (::before) */}
                  <div style={{ position:'relative', zIndex:1 }}>
                    {card.label && (
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'10px', letterSpacing:'0.12em', textTransform:'uppercase', color: card.accent, marginBottom:'2px' }}>{card.label}</div>
                    )}
                    <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'20px', color:'#f7f6dd', lineHeight:1.1, marginBottom:'6px' }}>{card.labelScript}</div>
                    <div style={{ fontSize:'11px', color: bgUrl ? 'rgba(247,246,221,0.55)' : 'rgba(247,246,221,0.35)', fontFamily:"'Barlow',sans-serif" }}>{card.desc}</div>
                  </div>
                </Link>

                {/* Admin edit overlay — hover on desktop, always visible on mobile */}
                {isAdmin && (
                  <div className="card-edit-overlay">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); cardRefs.current[card.path]?.click(); }}
                      style={{
                        padding:'4px 10px', borderRadius:'4px',
                        border:'1px solid rgba(247,246,221,0.35)',
                        background:'rgba(10,17,40,0.88)',
                        color:'rgba(247,246,221,0.8)',
                        fontSize:'9px', fontWeight:700, cursor:'pointer',
                        fontFamily:"'Barlow Condensed',sans-serif",
                        letterSpacing:'0.08em', textTransform:'uppercase',
                        backdropFilter:'blur(6px)',
                      }}
                    >
                      🖼 {bgUrl ? 'Change' : 'Add Photo'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isAdmin && (
          <p style={{ marginTop:'16px', fontSize:'11px', color:'rgba(247,246,221,0.2)', fontFamily:"'Barlow',sans-serif", fontStyle:'italic' }}>
            Hover over a card and click 🖼 to upload a PNG or JPG background photo.
          </p>
        )}
      </div>
    </>
  );
};