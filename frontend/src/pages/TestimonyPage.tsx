import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../services/supabase';

type Tab = 'convictions' | 'thanksgiving';

interface Conviction {
  id: string;
  content: string;
  submitted_at: string;
  approved: boolean;
  approved_by: string | null;
}

interface Thanksgiving {
  id: string;
  content: string;
  submitted_by: string;
  submitted_at: string;
  is_anonymous: boolean;
}

const CSS = `
  .test-page { padding: 24px; max-width: 860px; }
  .test-tabs { display: flex; gap: 8px; margin-bottom: 28px; }
  .test-tabs button { flex: 1; padding: 11px 8px; border-radius: 4px; border: 1px solid; font-family: 'Arial Black','Arial Bold',Gadget,sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.12s; }
  .test-wall { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; margin-top: 24px; }
  .test-card { background: #111D3E; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 18px; }
  .test-form { background: #111D3E; border: 1px solid rgba(247,246,221,0.2); border-radius: 8px; padding: 20px; margin-bottom: 24px; }
  .pastoral-card { background: #0F1A36; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 14px; margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start; }
  @media (max-width: 640px) {
    .test-page { padding: 16px 14px; }
    .test-wall { grid-template-columns: 1fr; }
  }
`;

export const TestimonyPage: React.FC = () => {
  const { user, hasRole } = useAuthStore();

  const isPastoral  = hasRole(['pastoral']);
  const isAdmin     = hasRole(['administrator']);
  const canModerate = isPastoral || isAdmin;

  const [tab, setTab]               = useState<Tab>('convictions');
  const [text, setText]             = useState('');
  const [isAnon, setIsAnon]         = useState(true);
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data from Supabase
  const [convictions,  setConvictions]  = useState<Conviction[]>([]);
  const [thanksgivings, setThanksgivings] = useState<Thanksgiving[]>([]);
  const [loading, setLoading]           = useState(true);

  // ── Load on mount and tab switch ────────────────────────────────────────────
  useEffect(() => {
    void loadAll();
  }, []);

  const loadAll = async (): Promise<void> => {
    setLoading(true);
    const [{ data: cvData }, { data: tgData }] = await Promise.all([
      supabase.from('convictions').select('*').order('submitted_at', { ascending: false }),
      supabase.from('thanksgivings').select('*').order('submitted_at', { ascending: false }),
    ]);
    if (cvData) setConvictions(cvData as Conviction[]);
    if (tgData) setThanksgivings(tgData as Thanksgiving[]);
    setLoading(false);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (): Promise<void> => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);

    if (tab === 'convictions') {
      const { error } = await supabase.from('convictions').insert({
        content:      text.trim(),
        approved:     false,
        approved_by:  null,
        submitted_at: new Date().toISOString(),
      });
      if (error) { alert('Failed to submit. Please try again.'); setSubmitting(false); return; }
    } else {
      const { error } = await supabase.from('thanksgivings').insert({
        content:      text.trim(),
        submitted_by: isAnon ? 'anonymous' : (user?.name ?? 'Member'),
        is_anonymous: isAnon,
        submitted_at: new Date().toISOString(),
      });
      if (error) { alert('Failed to submit. Please try again.'); setSubmitting(false); return; }
    }

    setText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setSubmitting(false);
    void loadAll();
  };

  // ── Approve conviction ───────────────────────────────────────────────────────
  const handleApprove = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('convictions')
      .update({ approved: true, approved_by: user?.name ?? 'Leader' })
      .eq('id', id);
    if (!error) void loadAll();
  };

  // ── Reject / delete conviction ────────────────────────────────────────────────
  const handleReject = async (id: string): Promise<void> => {
    const { error } = await supabase.from('convictions').delete().eq('id', id);
    if (!error) void loadAll();
  };

  const approvedConvictions = convictions.filter((c) => c.approved);
  const pendingConvictions  = convictions.filter((c) => !c.approved);

  return (
    <>
      <style>{CSS}</style>
      <div className="test-page">

        {/* Header */}
        <div style={{ marginBottom:'28px' }}>
          <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'4px' }}>Community</div>
          <h1 style={{ fontFamily:"'Alex Brush',cursive", fontStyle:'italic', fontWeight:700, fontSize:'clamp(28px,6vw,40px)', color:'#f7f6dd', margin:'0 0 6px', lineHeight:1 }}>Testimony Wall</h1>
          <p style={{ color:'rgba(247,246,221,0.4)', fontSize:'13px', margin:0, fontFamily:'Arial,Helvetica,sans-serif' }}>
            Share what God has placed on your heart — convictions and thanksgiving
          </p>
        </div>

        {/* Tabs */}
        <div className="test-tabs">
          {([
            { key:'convictions',  label:'Convictions',  icon:'💛' },
            { key:'thanksgiving', label:'Thanksgiving',  icon:'🌿' },
          ] as { key:Tab; label:string; icon:string }[]).map(({ key, label, icon }) => (
            <button key={key} onClick={() => { setTab(key); setSubmitted(false); setText(''); }} style={{
              borderColor: tab === key ? '#f7f6dd' : 'rgba(255,255,255,0.08)',
              background:  tab === key ? 'rgba(247,246,221,0.1)' : 'transparent',
              color:       tab === key ? '#f7f6dd' : 'rgba(247,246,221,0.35)',
            }}>{icon} {label}</button>
          ))}
        </div>

        {/* Description */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'6px', padding:'14px 16px', marginBottom:'20px', fontSize:'13px', color:'rgba(247,246,221,0.5)', fontFamily:'Arial,Helvetica,sans-serif', lineHeight:1.6 }}>
          {tab === 'convictions'
            ? "💛 Share what God has placed on your heart — a conviction, a commitment, or something He's calling you to. Submissions are anonymous and reviewed by a leader before being shared publicly."
            : "🌿 Share what you're grateful for — a blessing, an answered prayer, or something God has done. Let's celebrate together!"}
        </div>

        {/* Submit form */}
        <div className="test-form">
          <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:800, fontSize:'13px', letterSpacing:'0.1em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'12px' }}>
            {tab === 'convictions' ? 'Share a Conviction' : 'Share Thanksgiving'}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={tab === 'convictions' ? 'What is God calling you to commit to after camp?' : 'What are you thankful for?'}
            rows={4}
            style={{
              width:'100%', padding:'12px 14px', borderRadius:'4px',
              border:'1px solid rgba(255,255,255,0.08)',
              background:'rgba(255,255,255,0.04)', color:'#f7f6dd',
              fontSize:'14px', fontFamily:'Arial,Helvetica,sans-serif',
              outline:'none', resize:'vertical', boxSizing:'border-box', lineHeight:1.6, marginBottom:'12px',
            }}
          />
          {tab === 'thanksgiving' && (
            <label style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px', fontSize:'13px', color:'rgba(247,246,221,0.5)', fontFamily:'Arial,Helvetica,sans-serif', cursor:'pointer' }}>
              <input type="checkbox" checked={isAnon} onChange={(e) => setIsAnon(e.target.checked)}/>
              Share anonymously
            </label>
          )}
          {tab === 'convictions' && (
            <p style={{ fontSize:'11px', color:'rgba(247,246,221,0.25)', fontFamily:'Arial,Helvetica,sans-serif', marginBottom:'12px', fontStyle:'italic' }}>
              All convictions are anonymous and reviewed by a leader before appearing publicly.
            </p>
          )}
          {submitted ? (
            <div style={{ padding:'12px 16px', background:'rgba(90,138,60,0.12)', border:'1px solid rgba(90,138,60,0.3)', borderRadius:'4px', fontSize:'13px', color:'#8BC34A', fontFamily:'Arial,Helvetica,sans-serif' }}>
              ✓ Submitted! {tab === 'convictions' ? 'A leader will review this shortly.' : 'Thank you for sharing!'}
            </div>
          ) : (
            <button onClick={handleSubmit} disabled={!text.trim() || submitting} style={{
              padding:'11px 24px', borderRadius:'4px', border:'none',
              background: text.trim() && !submitting ? '#f7f6dd' : 'rgba(255,255,255,0.06)',
              color: text.trim() && !submitting ? '#0A1128' : 'rgba(247,246,221,0.2)',
              fontSize:'12px', fontWeight:800,
              cursor: text.trim() && !submitting ? 'pointer' : 'not-allowed',
              fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", letterSpacing:'0.1em', textTransform:'uppercase',
            }}>{submitting ? 'Saving…' : 'Submit'}</button>
          )}
        </div>

        {/* Pastoral moderation panel */}
        {canModerate && tab === 'convictions' && pendingConvictions.length > 0 && (
          <div style={{ marginBottom:'28px' }}>
            <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:800, fontSize:'12px', letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(247,246,221,0.5)', marginBottom:'12px' }}>
              🔍 Pending Review ({pendingConvictions.length})
            </div>
            {pendingConvictions.map((c) => (
              <div key={c.id} className="pastoral-card">
                <div style={{ flex:1, fontSize:'14px', color:'rgba(247,246,221,0.7)', fontFamily:'Arial,Helvetica,sans-serif', lineHeight:1.6 }}>{c.content}</div>
                <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
                  <button onClick={() => handleApprove(c.id)} style={{ padding:'6px 12px', borderRadius:'4px', border:'none', background:'rgba(90,138,60,0.2)', color:'#8BC34A', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif" }}>✓ Approve</button>
                  <button onClick={() => handleReject(c.id)}  style={{ padding:'6px 10px', borderRadius:'4px', border:'none', background:'rgba(220,80,80,0.15)', color:'#e07070', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif" }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Public wall */}
        <div>
          <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:800, fontSize:'12px', letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(247,246,221,0.3)', marginBottom:'16px' }}>
            {tab === 'convictions' ? `Shared Convictions (${approvedConvictions.length})` : `Thanksgiving Wall (${thanksgivings.length})`}
          </div>

          {loading && <p style={{ color:'rgba(247,246,221,0.3)', fontSize:'13px', fontFamily:'Arial,Helvetica,sans-serif' }}>Loading…</p>}

          {!loading && tab === 'convictions' && approvedConvictions.length === 0 && (
            <p style={{ color:'rgba(247,246,221,0.25)', fontSize:'13px', fontFamily:'Arial,Helvetica,sans-serif', fontStyle:'italic' }}>No convictions shared yet. Be the first!</p>
          )}
          {!loading && tab === 'thanksgiving' && thanksgivings.length === 0 && (
            <p style={{ color:'rgba(247,246,221,0.25)', fontSize:'13px', fontFamily:'Arial,Helvetica,sans-serif', fontStyle:'italic' }}>No thanksgiving shared yet. Be the first!</p>
          )}

          <div className="test-wall">
            {tab === 'convictions' && approvedConvictions.map((c) => (
              <div key={c.id} className="test-card">
                <div style={{ fontSize:'20px', marginBottom:'10px' }}>💛</div>
                <div style={{ fontSize:'14px', color:'rgba(247,246,221,0.75)', lineHeight:1.7, fontFamily:'Arial,Helvetica,sans-serif', fontStyle:'italic' }}>"{c.content}"</div>
                <div style={{ marginTop:'10px', fontSize:'10px', color:'rgba(247,246,221,0.2)', fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' }}>Anonymous</div>
              </div>
            ))}
            {tab === 'thanksgiving' && thanksgivings.map((t) => (
              <div key={t.id} className="test-card">
                <div style={{ fontSize:'20px', marginBottom:'10px' }}>🌿</div>
                <div style={{ fontSize:'14px', color:'rgba(247,246,221,0.75)', lineHeight:1.7, fontFamily:'Arial,Helvetica,sans-serif', fontStyle:'italic' }}>"{t.content}"</div>
                <div style={{ marginTop:'10px', fontSize:'10px', color:'rgba(247,246,221,0.2)', fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' }}>
                  {t.is_anonymous ? 'Anonymous' : t.submitted_by}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};