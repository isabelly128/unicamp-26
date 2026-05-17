import React, { CSSProperties, FC, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const LoginPage: FC = () => {
  const [email, setEmail]       = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError]       = useState<string>('');
  const [loading, setLoading]   = useState<boolean>(false);
  const { login }               = useAuthStore();
  const navigate                = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setError('');
    setLoading(true);
    login(email, password).then((success: boolean) => {
      setLoading(false);
      if (success) {
        navigate('/', { replace: true }); // basename="/staff" makes this /staff/
      } else {
        setError('Invalid credentials. Contact your administrator.');
      }
    });
  };

  const inputStyle: CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)', color: '#F0EDE4',
    fontSize: '15px', fontFamily: "'Barlow',sans-serif",
    outline: 'none', boxSizing: 'border-box', letterSpacing: '0.02em',
  };

  const labelStyle: CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 600,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'rgba(240,237,228,0.5)', marginBottom: '8px',
    fontFamily: "'Barlow Condensed',sans-serif",
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch', background: '#0A1128', overflow: 'hidden' }}>

      {/* Left — editorial type */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '64px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg,#0D1B4A 0%,#0A1128 60%,#060D1E 100%)',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle,rgba(212,230,0,0.08) 0%,transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '40px', left: '64px',
          fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(212,230,0,0.6)',
          fontWeight: 600, textTransform: 'uppercase',
          fontFamily: "'Barlow Condensed',sans-serif",
        }}>UNICAMP 2026 — Staff Portal</div>

        <div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'clamp(72px,10vw,120px)', lineHeight:0.9, textTransform:'uppercase', color:'#F0EDE4', letterSpacing:'-0.02em', marginBottom:'8px' }}>HERE</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(52px,7vw,88px)', lineHeight:0.95, color:'#D4E600', marginBottom:'8px' }}>I Am,</div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'clamp(72px,10vw,120px)', lineHeight:0.9, textTransform:'uppercase', color:'#F0EDE4', letterSpacing:'-0.02em', marginBottom:'32px' }}>LORD.</div>
          <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'13px', color:'rgba(240,237,228,0.4)', fontStyle:'italic', lineHeight:1.7, maxWidth:'340px' }}>
            "Then I heard the voice of the Lord saying, 'Whom shall I send?' And I said, 'Here am I. Send me!'" — Isaiah 6:8
          </p>
          <div style={{ marginTop: '32px' }}>
            <a href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 20px', borderRadius: '4px',
              border: '1px solid rgba(212,230,0,0.2)',
              color: 'rgba(212,230,0,0.6)', textDecoration: 'none',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', fontFamily: "'Barlow Condensed',sans-serif",
            }}>← Back to Member Site</a>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{
        width: '420px', flexShrink: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '64px 48px',
        background: '#060D1E', borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'12px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#D4E600', marginBottom:'32px' }}>
          Staff Access Only
        </div>
        <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'42px', textTransform:'uppercase', letterSpacing:'-0.01em', color:'#F0EDE4', marginBottom:'8px', lineHeight:1 }}>
          Sign In
        </h2>
        <p style={{ fontSize:'13px', color:'rgba(240,237,228,0.35)', marginBottom:'36px', fontFamily:"'Barlow',sans-serif" }}>
          For comms, pastoral &amp; admin team
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} required onChange={(e) => setEmail(e.target.value)} placeholder="your@camp.sg" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Password</label>
            <input type="password" value={password} required onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
          </div>

          {error && (
            <div style={{ background:'rgba(220,80,80,0.08)', border:'1px solid rgba(220,80,80,0.25)', borderRadius:'4px', padding:'10px 14px', marginBottom:'16px', fontSize:'13px', color:'#e07070', fontFamily:"'Barlow',sans-serif" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width:'100%', padding:'16px', borderRadius:'4px', border:'none',
            background: loading ? 'rgba(255,255,255,0.08)' : '#D4E600',
            color: loading ? 'rgba(240,237,228,0.3)' : '#0A1128',
            fontSize:'13px', fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif",
            letterSpacing:'0.15em', textTransform:'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer', transition:'background 0.15s',
          }}>
            {loading ? 'Signing in…' : 'Enter Staff Portal →'}
          </button>
        </form>

        <p style={{ marginTop:'24px', fontSize:'11px', color:'rgba(240,237,228,0.2)', fontFamily:"'Barlow',sans-serif", lineHeight:1.6 }}>
          Don't have credentials? Contact your camp administrator.
        </p>
      </div>
    </div>
  );
};