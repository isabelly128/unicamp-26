import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useCommunityStore } from '../stores/communityStore';
import { MEMBER_USER } from '../stores/authStore';
import type { PrayerRequest } from '../types';

export const PrayerPage: React.FC = () => {
  const { user, hasRole }                             = useAuthStore();
  const { prayerRequests, submitPrayerRequest, markPrayed } = useCommunityStore();

  const [content, setContent]         = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [showPopup, setShowPopup]     = useState<boolean>(false);

  const isPastoral = hasRole(['pastoral']);
  // Members on the public site have no auth user — fall back to MEMBER_USER
  const effectiveUser = user ?? MEMBER_USER;

  const handleSubmit = (): void => {
    if (!content.trim()) return;
    submitPrayerRequest(content.trim(), effectiveUser.id, isAnonymous);
    setContent('');
    setIsAnonymous(false);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3500);
  };

  const visibleRequests: PrayerRequest[] = isPastoral
    ? prayerRequests
    : prayerRequests.filter((r) => r.submittedBy === effectiveUser.id);

  return (
    <div style={{ padding: '40px', maxWidth: '800px', position: 'relative' }}>

      {/* ── Success popup ── */}
      {showPopup && (
        <div style={{
          position: 'fixed', top: '32px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999,
          background: '#111D3E',
          border: '1px solid rgba(247,246,221,0.35)',
          borderRadius: '8px',
          padding: '16px 28px',
          display: 'flex', alignItems: 'center', gap: '12px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          animation: 'slideDown 0.25s ease',
        }}>
          <span style={{ fontSize: '20px' }}>🙏</span>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'14px', letterSpacing:'0.05em', textTransform:'uppercase', color:'#f7f6dd' }}>
              Request Sent
            </div>
            <div style={{ fontFamily:"'Barlow',sans-serif", fontSize:'12px', color:'rgba(247,246,221,0.5)', marginTop:'2px' }}>
              Our prayer team has been notified. God hears you.
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
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'6px' }}>
          Prayer
        </div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'40px', color:'#f7f6dd', margin:'0 0 8px', lineHeight:1 }}>
          Wall
        </h1>
        <p style={{ color:'rgba(247,246,221,0.4)', fontSize:'13px', margin:0, fontFamily:"'Barlow',sans-serif" }}>
          Submit your prayer requests. Our prayer ministers will be notified.
        </p>
        {isPastoral && (
          <div style={{ marginTop:'12px', display:'inline-flex', alignItems:'center', gap:'6px', padding:'6px 14px', background:'rgba(90,138,60,0.12)', border:'1px solid rgba(90,138,60,0.3)', borderRadius:'4px', fontSize:'11px', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#8BC34A', fontFamily:"'Barlow Condensed',sans-serif" }}>
            Pastoral View — all requests visible
          </div>
        )}
      </div>

      {/* Submit form */}
      <div style={{ background:'#111D3E', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'24px', marginBottom:'32px' }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'13px', letterSpacing:'0.1em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'14px' }}>
          Submit a Prayer Request
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share what you would like prayer for... You are seen and loved."
          rows={4}
          style={{
            width:'100%', padding:'12px 16px', borderRadius:'4px',
            border:'1px solid rgba(255,255,255,0.08)',
            background:'rgba(255,255,255,0.04)', color:'#f7f6dd',
            fontSize:'14px', outline:'none', resize:'vertical',
            fontFamily:"'Barlow',sans-serif", lineHeight:1.7,
            boxSizing:'border-box', marginBottom:'14px',
          }}
        />

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'rgba(247,246,221,0.4)', cursor:'pointer', fontFamily:"'Barlow',sans-serif" }}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              style={{ accentColor:'#f7f6dd' }}
            />
            Submit anonymously
          </label>

          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            style={{
              padding:'11px 24px', borderRadius:'4px', border:'none',
              background: content.trim() ? '#f7f6dd' : 'rgba(255,255,255,0.06)',
              color: content.trim() ? '#0A1128' : 'rgba(247,246,221,0.2)',
              fontSize:'12px', fontWeight:800, cursor: content.trim() ? 'pointer' : 'not-allowed',
              fontFamily:"'Barlow Condensed',sans-serif",
              letterSpacing:'0.12em', textTransform:'uppercase',
              transition:'background 0.15s',
            }}
          >
            Send Request →
          </button>
        </div>
      </div>

      {/* Pastoral: full list */}
      {isPastoral && (
        <div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'13px', letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(247,246,221,0.5)', marginBottom:'16px' }}>
            All Prayer Requests ({prayerRequests.length})
          </div>
          {visibleRequests.length === 0 && (
            <p style={{ color:'rgba(247,246,221,0.3)', fontSize:'13px', fontFamily:"'Barlow',sans-serif" }}>No requests yet.</p>
          )}
          {visibleRequests.map((req: PrayerRequest) => (
            <div key={req.id} style={{
              background:'#111D3E', border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:'8px', padding:'18px', marginBottom:'10px',
              opacity: req.status === 'prayed' ? 0.5 : 1,
              borderLeft: req.status === 'prayed' ? '3px solid rgba(139,195,74,0.4)' : '3px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{ margin:'0 0 12px', fontSize:'14px', color:'#f7f6dd', lineHeight:1.7, fontFamily:"'Barlow',sans-serif" }}>
                {req.content}
              </p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontSize:'11px', color:'rgba(247,246,221,0.25)', fontFamily:"'Barlow',sans-serif" }}>
                  {req.isAnonymous ? 'Anonymous' : req.submittedBy}
                  {' · '}
                  {new Date(req.submittedAt).toLocaleDateString()}
                </div>
                {req.status === 'pending' ? (
                  <button onClick={() => markPrayed(req.id)} style={{
                    padding:'6px 14px', borderRadius:'4px',
                    border:'1px solid rgba(139,195,74,0.3)',
                    background:'rgba(139,195,74,0.08)', color:'#8BC34A',
                    fontSize:'11px', fontWeight:700, cursor:'pointer',
                    fontFamily:"'Barlow Condensed',sans-serif",
                    letterSpacing:'0.08em', textTransform:'uppercase',
                  }}>✓ Mark Prayed</button>
                ) : (
                  <span style={{ fontSize:'11px', color:'#8BC34A', fontFamily:"'Barlow Condensed',sans-serif" }}>Prayed 🙏</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member reassurance */}
      {!isPastoral && (
        <div style={{ padding:'24px', background:'rgba(247,246,221,0.04)', border:'1px solid rgba(247,246,221,0.1)', borderRadius:'8px' }}>
          <p style={{ fontSize:'13px', color:'rgba(247,246,221,0.4)', fontStyle:'italic', lineHeight:1.8, margin:0, fontFamily:"'Barlow',sans-serif" }}>
            Your request has been sent to our prayer team. They will be praying for you.
            Rest in the knowledge that God hears every prayer. 🙏
          </p>
        </div>
      )}
    </div>
  );
};