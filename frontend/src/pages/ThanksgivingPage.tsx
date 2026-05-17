import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useCommunityStore } from '../stores/communityStore';
import { MEMBER_USER } from '../stores/authStore';

export const ThanksgivingPage: React.FC = () => {
  const { user }                              = useAuthStore();
  const { thanksgivings, submitThanksgiving } = useCommunityStore();

  const [content, setContent]         = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [showPopup, setShowPopup]     = useState<boolean>(false);

  // Members on the public site have no auth user — fall back to MEMBER_USER
  const effectiveUser = user ?? MEMBER_USER;

  const handleSubmit = (): void => {
    if (!content.trim()) return;
    submitThanksgiving(content.trim(), effectiveUser.id, isAnonymous);
    setContent('');
    setIsAnonymous(false);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3500);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', position: 'relative' }}>

      {/* ── Success popup ── */}
      {showPopup && (
        <div style={{
          position: 'fixed', top: '32px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999,
          background: '#111D3E',
          border: '1px solid rgba(90,138,60,0.4)',
          borderRadius: '8px',
          padding: '16px 28px',
          display: 'flex', alignItems: 'center', gap: '12px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          animation: 'slideDown 0.25s ease',
        }}>
          <span style={{ fontSize: '20px' }}>🌿</span>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'14px', letterSpacing:'0.05em', textTransform:'uppercase', color:'#8BC34A' }}>
              Thanksgiving Shared!
            </div>
            <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:'12px', color:'rgba(240,237,228,0.5)', marginTop:'2px' }}>
              Your gratitude has been added to the wall.
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity:0; transform:translateX(-50%) translateY(-12px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#5A8A3C', marginBottom:'6px' }}>
          Gratitude
        </div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'40px', color:'#F0EDE4', margin:'0 0 8px', lineHeight:1 }}>
          Thanksgiving Wall
        </h1>
        <p style={{ color:'rgba(240,237,228,0.4)', fontSize:'13px', margin:0, fontFamily:"'Barlow',sans-serif" }}>
          What are you grateful for? Share the goodness of God with the community.
        </p>
      </div>

      {/* Submit form */}
      <div style={{ background:'#111D3E', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'24px', marginBottom:'36px' }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'13px', letterSpacing:'0.1em', textTransform:'uppercase', color:'#F0EDE4', marginBottom:'14px' }}>
          Give Thanks
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="I am thankful for... / God has been faithful in..."
          rows={3}
          style={{
            width:'100%', padding:'12px 16px', borderRadius:'4px',
            border:'1px solid rgba(255,255,255,0.08)',
            background:'rgba(255,255,255,0.04)', color:'#F0EDE4',
            fontSize:'14px', outline:'none', resize:'vertical',
            fontFamily:"'Barlow',sans-serif", lineHeight:1.7,
            boxSizing:'border-box', marginBottom:'14px',
          }}
        />

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'rgba(240,237,228,0.4)', cursor:'pointer', fontFamily:"'Barlow',sans-serif" }}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              style={{ accentColor:'#5A8A3C' }}
            />
            Post anonymously
          </label>

          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            style={{
              padding:'11px 24px', borderRadius:'4px', border:'none',
              background: content.trim() ? '#5A8A3C' : 'rgba(255,255,255,0.06)',
              color: content.trim() ? '#fff' : 'rgba(240,237,228,0.2)',
              fontSize:'12px', fontWeight:800, cursor: content.trim() ? 'pointer' : 'not-allowed',
              fontFamily:"'Barlow Condensed',sans-serif",
              letterSpacing:'0.12em', textTransform:'uppercase',
              transition:'background 0.15s',
            }}
          >
            Give Thanks 🌿
          </button>
        </div>
      </div>

      {/* Wall */}
      {thanksgivings.length === 0 && (
        <div style={{ padding:'48px', textAlign:'center', color:'rgba(240,237,228,0.25)', fontSize:'14px', fontFamily:"'Barlow',sans-serif", fontStyle:'italic', background:'#111D3E', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px' }}>
          Be the first to give thanks 🌿
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'12px' }}>
        {[...thanksgivings].reverse().map((t) => (
          <div key={t.id} style={{
            background:'linear-gradient(135deg, rgba(90,138,60,0.1), rgba(90,138,60,0.04))',
            border:'1px solid rgba(90,138,60,0.2)',
            borderRadius:'8px', padding:'20px',
          }}>
            <div style={{ fontSize:'18px', marginBottom:'10px' }}>🌿</div>
            <p style={{ margin:'0 0 12px', fontSize:'14px', color:'#F0EDE4', lineHeight:1.7, fontStyle:'italic', fontFamily:"'Playfair Display',serif" }}>
              &ldquo;{t.content}&rdquo;
            </p>
            <div style={{ fontSize:'11px', color:'rgba(240,237,228,0.25)', fontFamily:"'Barlow',sans-serif" }}>
              {t.isAnonymous ? 'Anonymous' : t.submittedBy}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
