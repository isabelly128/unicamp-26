import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useCommunityStore } from '../stores/communityStore';

type Tab = 'convictions' | 'thanksgiving';

const CSS = `
  .test-page { padding: 24px; max-width: 860px; }
  .test-tabs { display: flex; gap: 8px; margin-bottom: 28px; }
  .test-tabs button { flex: 1; padding: 11px 8px; border-radius: 4px; border: 1px solid; font-family: 'Barlow Condensed',sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.12s; }
  .test-wall { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; margin-top: 24px; }
  .test-card { background: #111D3E; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 18px; }
  .test-form { background: #111D3E; border: 1px solid rgba(212,230,0,0.2); border-radius: 8px; padding: 20px; margin-bottom: 24px; }
  .pastoral-card { background: #0F1A36; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 14px; margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start; }

  @media (max-width: 640px) {
    .test-page { padding: 16px 14px; }
    .test-wall { grid-template-columns: 1fr; }
  }
`;

export const TestimonyPage: React.FC = () => {
  const { user, hasRole } = useAuthStore();
  const {
    convictions, thanksgivings,
    submitConviction, approveConviction, rejectConviction, submitThanksgiving,
  } = useCommunityStore();

  const isPastoral  = hasRole(['pastoral']);
  const isAdmin     = hasRole(['administrator']);
  const canModerate = isPastoral || isAdmin;

  const [tab, setTab]           = useState<Tab>('convictions');
  const [text, setText]         = useState('');
  const [isAnon, setIsAnon]     = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (): void => {
    if (!text.trim()) return;
    if (tab === 'convictions') {
      submitConviction(text.trim());
    } else {
      submitThanksgiving(text.trim(), user?.id ?? 'anon', isAnon);
    }
    setText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const approvedConvictions = convictions.filter((c) => c.approved);
  const pendingConvictions  = convictions.filter((c) => !c.approved);
  const publicThanksgivings = thanksgivings;

  return (
    <>
      <style>{CSS}</style>
      <div className="test-page">

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#D4E600', marginBottom:'4px' }}>Community</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(28px,6vw,40px)', color:'#F0EDE4', margin:'0 0 6px', lineHeight:1 }}>Testimony Wall</h1>
          <p style={{ color:'rgba(240,237,228,0.4)', fontSize:'13px', margin:0, fontFamily:"'Barlow',sans-serif" }}>
            Share what God has placed on your heart — convictions and thanksgiving
          </p>
        </div>

        {/* Tabs */}
        <div className="test-tabs">
          {([
            { key: 'convictions',  label: 'Convictions',   icon: '💛' },
            { key: 'thanksgiving', label: 'Thanksgiving', icon: '🌿' },
          ] as { key: Tab; label: string; icon: string }[]).map(({ key, label, icon }) => (
            <button key={key} onClick={() => { setTab(key); setSubmitted(false); setText(''); }} style={{
              borderColor: tab === key ? '#D4E600' : 'rgba(255,255,255,0.08)',
              background:  tab === key ? 'rgba(212,230,0,0.1)' : 'transparent',
              color:       tab === key ? '#D4E600' : 'rgba(240,237,228,0.35)',
            }}>{icon} {label}</button>
          ))}
        </div>

        {/* Description */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'6px', padding:'14px 16px', marginBottom:'20px', fontSize:'13px', color:'rgba(240,237,228,0.5)', fontFamily:"'Barlow',sans-serif", lineHeight:1.6 }}>
          {tab === 'convictions'
            ? '💛 Share what God has placed on your heart — a conviction, a commitment, or something He\'s calling you to. Submissions are anonymous and reviewed by a leader before being shared publicly.'
            : '🌿 Share what you\'re grateful for — a blessing, an answered prayer, or something God has done. Let\'s celebrate together!'}
        </div>

        {/* Submit form */}
        <div className="test-form">
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'13px', letterSpacing:'0.1em', textTransform:'uppercase', color:'#F0EDE4', marginBottom:'12px' }}>
            {tab === 'convictions' ? 'Share a Conviction' : 'Share Thanksgiving'}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={tab === 'convictions'
              ? 'What is God calling you to commit to after camp?'
              : 'What are you thankful for?'}
            rows={4}
            style={{
              width:'100%', padding:'12px 14px', borderRadius:'4px',
              border:'1px solid rgba(255,255,255,0.08)',
              background:'rgba(255,255,255,0.04)', color:'#F0EDE4',
              fontSize:'14px', fontFamily:"'Barlow',sans-serif",
              outline:'none', resize:'vertical', boxSizing:'border-box',
              lineHeight:1.6, marginBottom:'12px',
            }}
          />
          {tab === 'thanksgiving' && (
            <label style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px', fontSize:'13px', color:'rgba(240,237,228,0.5)', fontFamily:"'Barlow',sans-serif", cursor:'pointer' }}>
              <input type="checkbox" checked={isAnon} onChange={(e) => setIsAnon(e.target.checked)} />
              Share anonymously
            </label>
          )}
          {tab === 'convictions' && (
            <p style={{ fontSize:'11px', color:'rgba(240,237,228,0.25)', fontFamily:"'Barlow',sans-serif", marginBottom:'12px', fontStyle:'italic' }}>
              All convictions are anonymous and reviewed by a leader before appearing publicly.
            </p>
          )}
          {submitted ? (
            <div style={{ padding:'12px 16px', background:'rgba(90,138,60,0.12)', border:'1px solid rgba(90,138,60,0.3)', borderRadius:'4px', fontSize:'13px', color:'#8BC34A', fontFamily:"'Barlow',sans-serif" }}>
              ✓ Submitted! {tab === 'convictions' ? 'A leader will review this shortly.' : 'Thank you for sharing!'}
            </div>
          ) : (
            <button onClick={handleSubmit} disabled={!text.trim()} style={{
              padding:'11px 24px', borderRadius:'4px', border:'none',
              background: text.trim() ? '#D4E600' : 'rgba(255,255,255,0.06)',
              color: text.trim() ? '#0A1128' : 'rgba(240,237,228,0.2)',
              fontSize:'12px', fontWeight:800, cursor: text.trim() ? 'pointer' : 'not-allowed',
              fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase',
            }}>Submit</button>
          )}
        </div>

        {/* Pastoral moderation panel (convictions) */}
        {canModerate && tab === 'convictions' && pendingConvictions.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'12px', letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(212,230,0,0.6)', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px' }}>
              🔍 Pending Review ({pendingConvictions.length})
            </div>
            {pendingConvictions.map((c) => (
              <div key={c.id} className="pastoral-card">
                <div style={{ flex:1, fontSize:'14px', color:'rgba(240,237,228,0.7)', fontFamily:"'Barlow',sans-serif", lineHeight:1.6 }}>{c.content}</div>
                <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
                  <button onClick={() => approveConviction(c.id, user?.name ?? 'Leader')} style={approveBtn}>✓ Approve</button>
                  <button onClick={() => rejectConviction(c.id)} style={rejectBtn}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Public wall */}
        <div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'12px', letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(240,237,228,0.3)', marginBottom:'16px' }}>
            {tab === 'convictions' ? `Shared Convictions (${approvedConvictions.length})` : `Thanksgiving Wall (${publicThanksgivings.length})`}
          </div>

          {tab === 'convictions' && approvedConvictions.length === 0 && (
            <p style={{ color:'rgba(240,237,228,0.25)', fontSize:'13px', fontFamily:"'Barlow',sans-serif", fontStyle:'italic' }}>No convictions shared yet. Be the first!</p>
          )}
          {tab === 'thanksgiving' && publicThanksgivings.length === 0 && (
            <p style={{ color:'rgba(240,237,228,0.25)', fontSize:'13px', fontFamily:"'Barlow',sans-serif", fontStyle:'italic' }}>No thanksgiving shared yet. Be the first!</p>
          )}

          <div className="test-wall">
            {tab === 'convictions' && approvedConvictions.map((c) => (
              <div key={c.id} className="test-card">
                <div style={{ fontSize:'20px', marginBottom:'10px' }}>💛</div>
                <div style={{ fontSize:'14px', color:'rgba(240,237,228,0.75)', lineHeight:1.7, fontFamily:"'Barlow',sans-serif", fontStyle:'italic' }}>"{c.content}"</div>
                <div style={{ marginTop:'10px', fontSize:'10px', color:'rgba(240,237,228,0.2)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' }}>Anonymous</div>
              </div>
            ))}
            {tab === 'thanksgiving' && publicThanksgivings.map((t) => (
              <div key={t.id} className="test-card">
                <div style={{ fontSize:'20px', marginBottom:'10px' }}>🌿</div>
                <div style={{ fontSize:'14px', color:'rgba(240,237,228,0.75)', lineHeight:1.7, fontFamily:"'Barlow',sans-serif", fontStyle:'italic' }}>"{t.content}"</div>
                <div style={{ marginTop:'10px', fontSize:'10px', color:'rgba(240,237,228,0.2)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' }}>
                  {t.isAnonymous ? 'Anonymous' : t.submittedBy}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const approveBtn: React.CSSProperties = {
  padding:'6px 12px', borderRadius:'4px', border:'none',
  background:'rgba(90,138,60,0.2)', color:'#8BC34A',
  fontSize:'11px', fontWeight:700, cursor:'pointer',
  fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.06em',
};
const rejectBtn: React.CSSProperties = {
  padding:'6px 10px', borderRadius:'4px', border:'none',
  background:'rgba(220,80,80,0.15)', color:'#e07070',
  fontSize:'11px', fontWeight:700, cursor:'pointer',
  fontFamily:"'Barlow Condensed',sans-serif",
};