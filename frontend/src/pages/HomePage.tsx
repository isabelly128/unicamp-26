import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCommunityStore } from '../stores/communityStore';

const THEME       = 'Stay the Course';
const CAMP_DATES  = 'June 1–4, 2026';
const VERSE_REF   = 'Matthew 7:13-14';
const VERSE_FULL  = '13 "Enter through the narrow gate. For wide is the gate and broad is the road that leads to destruction, and many enter through it. 14 But small is the gate and narrow the road that leads to life, and only a few find it."';

interface FeatureCard { icon:string; label:string; labelScript:string; path:string; desc:string; accent:string; }

const FEATURE_CARDS: FeatureCard[] = [
  { icon:'📖', label:'CAMP',   labelScript:'Booklet',    path:'/booklet',     desc:'Program flow & schedule',    accent:'#f7f6dd' },
  { icon:'🕊️', label:'DAILY', labelScript:'Devotions',  path:'/devotions',   desc:'Read · Reflect · Record',    accent:'#4A90D9' },
  { icon:'📝', label:'SERMON', labelScript:'Notes',      path:'/sermons',     desc:'Session notes & questions',  accent:'#f7f6dd' },
  { icon:'📸', label:'CAMP',   labelScript:'Photos',     path:'/photos',      desc:'Camp memories',              accent:'#5A8A3C' },
  { icon:'🙏', label:'PRAYER', labelScript:'Wall',       path:'/prayer',      desc:'Submit & see requests',      accent:'#4A90D9' },
  { icon:'✝️', label:'',       labelScript:'Testimony',  path:'/testimony',   desc:'Convictions & thanksgiving', accent:'#f7f6dd' },
];

const CSS = `
  .home-page { padding:32px 40px 60px; max-width:960px; }
  .home-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:12px; }
  @media(max-width:640px){
    .home-page { padding:20px 16px 40px; }
    .home-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
  }
`;

export const HomePage: React.FC = () => {
  const { user, hasRole }           = useAuthStore();
  const { heroBgUrl, setHeroBgUrl } = useCommunityStore();
  const firstName                   = user?.name?.split(' ')[0] ?? 'friend';
  const isAdmin                     = hasRole(['administrator']);

  const [showBgUpload, setShowBgUpload] = useState(false);
  const [bgInput, setBgInput]           = useState('');

  const saveBg = (): void => { setHeroBgUrl(bgInput.trim()); setBgInput(''); setShowBgUpload(false); };

  return (
    <>
      <style>{CSS}</style>
      <div className="home-page">

        {/* Hero */}
        <div style={{ position:'relative', borderRadius:'8px', overflow:'hidden', marginBottom:'40px', background: heroBgUrl ? 'transparent' : 'linear-gradient(135deg,#0D1B4A 0%,#111D3E 100%)', border:'1px solid rgba(247,246,221,0.15)', padding:'48px 48px 40px', minHeight:'280px', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>

          {/* Background image */}
          {heroBgUrl && (
            <>
              <img src={heroBgUrl} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(10,17,40,0.95) 0%,rgba(10,17,40,0.5) 60%,rgba(10,17,40,0.3) 100%)' }}/>
            </>
          )}

          {/* Date label */}
          <div style={{ position:'absolute', top:'28px', left:'48px', fontSize:'11px', letterSpacing:'0.2em', color:'rgba(247,246,221,0.6)', fontWeight:600, textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif" }}>{CAMP_DATES}</div>

          {/* Admin photo button */}
          {isAdmin && (
            <div style={{ position:'absolute', top:'24px', right:'24px', display:'flex', gap:'8px', alignItems:'center', zIndex:2 }}>
              {showBgUpload ? (
                <>
                  <input value={bgInput} onChange={(e) => setBgInput(e.target.value)} placeholder="Paste image URL…" style={{ padding:'7px 12px', borderRadius:'4px', border:'1px solid rgba(247,246,221,0.3)', background:'rgba(10,17,40,0.9)', color:'#F0EDE4', fontSize:'12px', fontFamily:"'Barlow',sans-serif", outline:'none', width:'200px' }}/>
                  <button onClick={saveBg} style={{ padding:'7px 14px', borderRadius:'4px', border:'none', background:'#f7f6dd', color:'#0A1128', fontSize:'11px', fontWeight:800, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' }}>Save</button>
                  <button onClick={() => setShowBgUpload(false)} style={{ padding:'7px 10px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(240,237,228,0.5)', fontSize:'11px', cursor:'pointer' }}>✕</button>
                  {heroBgUrl && <button onClick={() => { setHeroBgUrl(''); setShowBgUpload(false); }} style={{ padding:'7px 10px', borderRadius:'4px', border:'1px solid rgba(220,80,80,0.3)', background:'transparent', color:'rgba(220,80,80,0.6)', fontSize:'11px', cursor:'pointer' }}>Remove</button>}
                </>
              ) : (
                <button onClick={() => setShowBgUpload(true)} style={{ padding:'6px 12px', borderRadius:'4px', border:'1px solid rgba(247,246,221,0.25)', background:'rgba(10,17,40,0.7)', color:'rgba(247,246,221,0.6)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', backdropFilter:'blur(4px)' }}>
                  🖼 {heroBgUrl ? 'Change Photo' : 'Add Photo'}
                </button>
              )}
            </div>
          )}

          {!heroBgUrl && <div style={{ position:'absolute', top:0, right:0, width:'50%', height:'100%', background:'radial-gradient(ellipse at 80% 30%,rgba(74,144,217,0.1) 0%,transparent 60%)', pointerEvents:'none' }}/>}

          {/* Headline */}
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:'14px', flexWrap:'wrap', marginBottom:'4px' }}>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'clamp(48px,8vw,88px)', lineHeight:0.9, textTransform:'uppercase', color:'#F0EDE4', letterSpacing:'-0.02em' }}>STAY THE</span>
              <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(36px,6vw,68px)', lineHeight:0.9, color:'#f7f6dd' }}>Course.</span>
            </div>
            <p style={{ fontSize:'12px', color:'rgba(240,237,228,0.35)', fontStyle:'italic', lineHeight:1.8, maxWidth:'440px', marginTop:'16px', marginBottom:'24px', fontFamily:"'Barlow',sans-serif" }}>
              {VERSE_FULL} — {VERSE_REF}
            </p>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <a href="https://open.spotify.com/playlist/your-playlist-id" target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 18px', background:'#1DB954', borderRadius:'4px', textDecoration:'none', color:'#fff', fontSize:'11px', fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' }}>🎵 Camp Playlist</a>
              <a href="https://t.me/your-group-link" target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 18px', background:'#0088cc', borderRadius:'4px', textDecoration:'none', color:'#fff', fontSize:'11px', fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' }}>💬 Telegram</a>
            </div>
          </div>
        </div>

        {/* Welcome */}
        <div style={{ marginBottom:'24px' }}>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'28px', textTransform:'uppercase', letterSpacing:'-0.01em', color:'#F0EDE4' }}>WELCOME BACK, </span>
          <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'24px', color:'#f7f6dd' }}>{firstName}.</span>
        </div>

        {/* Feature grid */}
        <div className="home-grid">
          {FEATURE_CARDS.map((card) => (
            <Link key={card.path} to={card.path} style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'20px 16px 16px', background:'#111D3E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'6px', textDecoration:'none', minHeight:'130px', position:'relative', overflow:'hidden', transition:'border-color 0.15s, transform 0.15s' }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = card.accent; el.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.06)'; el.style.transform = 'none'; }}
            >
              <div style={{ position:'absolute', top:'14px', right:'14px', fontSize:'20px', opacity:0.55 }}>{card.icon}</div>
              <div>
                {card.label && <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'10px', letterSpacing:'0.12em', textTransform:'uppercase', color:card.accent, marginBottom:'2px' }}>{card.label}</div>}
                <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'20px', color:'#F0EDE4', lineHeight:1.1, marginBottom:'6px' }}>{card.labelScript}</div>
                <div style={{ fontSize:'11px', color:'rgba(240,237,228,0.3)', fontFamily:"'Barlow',sans-serif" }}>{card.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};