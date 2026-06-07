import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'HOME',   script: 'Home',        path: '/',             icon: '⛺' },
  { label: 'CAMP',   script: 'Booklet',     path: '/booklet',      icon: '📖' },
  { label: 'DAILY',  script: 'Devotions',   path: '/devotions',    icon: '🕊️' },
  { label: 'SERMON', script: 'Notes',       path: '/sermons',      icon: '📝' },
  { label: 'CAMP',   script: 'Photos',      path: '/photos',       icon: '📸' },
  { label: 'PRAYER', script: 'Wall',        path: '/prayer',       icon: '🙏' },
  { label: '',       script: 'Testimony',   path: '/testimony',    icon: '✝️' },
];

const QUICK_LINKS = [
  { label: 'Spotify Playlist', url: 'https://open.spotify.com/playlist/your-id', icon: '🎵' },
  { label: 'Telegram Group',   url: 'https://t.me/your-group',                   icon: '💬' },
];

export const MemberNavbar: React.FC = () => {
  const location = useLocation();
  const [staffHover, setStaffHover] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '220px',
        background: '#060D1E', borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', zIndex: 100, overflowY: 'auto',
      }} className="sidebar">

        {/* Logo */}
        <div style={{ padding: '28px 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'22px', textTransform:'uppercase', letterSpacing:'-0.01em', color:'#F0EDE4', lineHeight:1 }}>
            UNI<span style={{ color: '#f7f6dd' }}>CAMP</span>
          </div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:'11px', color:'rgba(240,237,228,0.35)', marginTop:'4px' }}>
            Stay the Course
          </div>
          <div style={{ marginTop:'10px', display:'inline-block', padding:'3px 10px', borderRadius:'100px', background:'rgba(247,246,221,0.1)', border:'1px solid rgba(247,246,221,0.2)', fontSize:'10px', fontWeight:700, letterSpacing:'0.1em', color:'#f7f6dd', textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif" }}>
            Member
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'9px 10px', borderRadius:'4px', marginBottom:'2px',
                textDecoration:'none',
                background: active ? 'rgba(247,246,221,0.08)' : 'transparent',
                borderLeft: active ? '2px solid #f7f6dd' : '2px solid transparent',
                transition:'all 0.12s',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={{ fontSize:'15px', opacity: active ? 1 : 0.5 }}>{item.icon}</span>
                <div>
                  {item.label && (
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:'10px', letterSpacing:'0.12em', textTransform:'uppercase', color: active ? '#f7f6dd' : 'rgba(240,237,228,0.3)', lineHeight:1 }}>{item.label}</div>
                  )}
                  <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:'13px', color: active ? '#F0EDE4' : 'rgba(240,237,228,0.55)', lineHeight:1.2 }}>{item.script}</div>
                </div>
              </Link>
            );
          })}

          {/* Quick links */}
          <div style={{ margin:'20px 0 8px', fontSize:'9px', fontWeight:700, color:'rgba(240,237,228,0.2)', letterSpacing:'0.15em', paddingLeft:'10px', fontFamily:"'Barlow Condensed',sans-serif", textTransform:'uppercase' }}>Quick Links</div>
          {QUICK_LINKS.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" style={{
              display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px',
              borderRadius:'4px', marginBottom:'2px', textDecoration:'none',
              fontSize:'13px', color:'rgba(240,237,228,0.4)', fontFamily:"'Barlow',sans-serif",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(240,237,228,0.7)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(240,237,228,0.4)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{ fontSize:'14px' }}>{link.icon}</span>
              {link.label}
              <span style={{ marginLeft:'auto', fontSize:'10px' }}>↗</span>
            </a>
          ))}
        </nav>

        {/* Staff portal link */}
        <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <a href="/staff/login" style={{
            display:'block', width:'100%', padding:'9px', textAlign:'center',
            borderRadius:'4px', border:'1px solid rgba(255,255,255,0.08)',
            background:'transparent',
            color: staffHover ? 'rgba(247,246,221,0.6)' : 'rgba(240,237,228,0.25)',
            fontSize:'10px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
            fontFamily:"'Barlow Condensed',sans-serif", textDecoration:'none', transition:'color 0.15s',
          }}
          onMouseEnter={() => setStaffHover(true)}
          onMouseLeave={() => setStaffHover(false)}
          >
            Staff Portal →
          </a>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav style={{
        display:'none', position:'fixed', bottom:0, left:0, right:0,
        background:'#060D1E', borderTop:'1px solid rgba(255,255,255,0.06)',
        zIndex:100, overflowX:'auto', overflowY:'hidden',
        WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
        scrollbarWidth: 'none' as React.CSSProperties['scrollbarWidth'],
      }} className="mobile-nav">
        <div style={{ display:'flex', alignItems:'stretch', width:'max-content' }}>
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{
                display:'flex', flexDirection:'column', alignItems:'center',
                justifyContent:'center', padding:'8px 16px 10px',
                textDecoration:'none', minWidth:'64px',
                borderBottom: active ? '2px solid #f7f6dd' : '2px solid transparent',
              }}>
                <span style={{ fontSize:'22px', lineHeight:1 }}>{item.icon}</span>
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'9px', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color: active ? '#f7f6dd' : 'rgba(240,237,228,0.3)', marginTop:'3px', whiteSpace:'nowrap' }}>{item.script}</span>
              </Link>
            );
          })}

          <div style={{ width:'1px', background:'rgba(255,255,255,0.08)', margin:'10px 4px', flexShrink:0 }}/>

          {/* Staff portal at end of scroll */}
          <a href="/staff/login" style={{
            display:'flex', flexDirection:'column', alignItems:'center',
            justifyContent:'center', padding:'8px 16px 10px',
            textDecoration:'none', minWidth:'64px', borderBottom:'2px solid transparent',
          }}>
            <span style={{ fontSize:'22px', lineHeight:1 }}>🔐</span>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'9px', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'rgba(247,246,221,0.45)', marginTop:'3px', whiteSpace:'nowrap' }}>Staff</span>
          </a>
        </div>
      </nav>

      <style>{`
        .mobile-nav::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};