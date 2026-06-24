import React, { CSSProperties, FC, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const VERSE = '13 "Enter through the narrow gate. For wide is the gate and broad is the road that leads to destruction, and many enter through it. 14 But small is the gate and narrow the road that leads to life, and only a few find it." — Matthew 7:13-14';
const THEME = 'The Call';

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
      if (success) { navigate('/', { replace: true }); }
      else { setError('Invalid credentials. Contact your administrator.'); }
    });
  };

  const inputStyle: CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)', color: '#f7f6dd',
    fontSize: '15px', fontFamily: "'Barlow',sans-serif",
    outline: 'none', boxSizing: 'border-box', letterSpacing: '0.02em',
  };
  const labelStyle: CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 600,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'rgba(247,246,221,0.5)', marginBottom: '8px',
    fontFamily: "'Barlow Condensed',sans-serif",
  };

  return (
    <>
      <style>{`
        .login-wrapper { min-height:100vh; display:flex; align-items:stretch; background:#0A1128; overflow:hidden; }
        .login-left { flex:1; display:flex; flex-direction:column; justify-content:flex-end; padding:64px; position:relative; overflow:hidden; background:linear-gradient(160deg,#0D1B4A 0%,#0A1128 60%,#060D1E 100%); }
        .login-right { width:420px; flex-shrink:0; display:flex; flex-direction:column; justify-content:center; padding:64px 48px; background:#060D1E; border-left:1px solid rgba(255,255,255,0.06); }
        @media(max-width:640px){
          .login-left { display:none; }
          .login-right { width:100%; padding:48px 24px 60px; border-left:none; justify-content:flex-start; padding-top:52px; }
          .login-mobile-header { display:block !important; }
        }
      `}</style>

      <div className="login-wrapper">

        {/* Left — editorial (desktop only) */}
        <div className="login-left">
          <div style={{ position:'absolute', top:'-80px', left:'-80px', width:'400px', height:'400px', background:'radial-gradient(circle,rgba(247,246,221,0.07) 0%,transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', top:'40px', left:'64px', fontSize:'11px', letterSpacing:'0.2em', color:'rgba(247,246,221,0.6)', fontWeight:600, textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif" }}>
            UNICAMP 2026 — Staff Portal
          </div>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'clamp(72px,10vw,120px)', lineHeight:0.9, textTransform:'uppercase', color:'#f7f6dd', letterSpacing:'-0.02em', marginBottom:'8px' }}>The</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(52px,7vw,88px)', lineHeight:0.95, color:'#f7f6dd', marginBottom:'8px' }}>Call</div>
            <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:'13px', color:'rgba(247,246,221,0.4)', fontStyle:'italic', lineHeight:1.8, maxWidth:'360px', marginTop:'20px' }}>
              {VERSE}
            </p>
            <div style={{ marginTop:'32px' }}>
              <a href="/" style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'10px 20px', borderRadius:'4px', border:'1px solid rgba(247,246,221,0.2)', color:'rgba(247,246,221,0.6)', textDecoration:'none', fontSize:'11px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif" }}>
                ← Back to Member Site
              </a>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="login-right">

          {/* Mobile-only mini header */}
          <div style={{ display:'none', marginBottom:'32px' }} className="login-mobile-header">
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(247,246,221,0.5)', marginBottom:'12px' }}>UNICAMP 2026</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'40px', lineHeight:0.9, textTransform:'uppercase', color:'#f7f6dd', marginBottom:'4px' }}>The</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'32px', lineHeight:1, color:'#f7f6dd', marginBottom:'20px' }}>Call</div>
            <a href="/" style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'4px', border:'1px solid rgba(247,246,221,0.2)', color:'rgba(247,246,221,0.5)', textDecoration:'none', fontSize:'10px', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif" }}>
              ← Member Site
            </a>
          </div>

          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'12px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'16px' }}>
            Staff Access Only
          </div>
          <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'38px', textTransform:'uppercase', letterSpacing:'-0.01em', color:'#f7f6dd', marginBottom:'6px', lineHeight:1 }}>Sign In</h2>
          <p style={{ fontSize:'13px', color:'rgba(247,246,221,0.35)', marginBottom:'32px', fontFamily:"'Barlow',sans-serif" }}>
            For comms, pastoral &amp; admin team
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:'16px' }}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} required onChange={(e) => setEmail(e.target.value)} placeholder="your@camp.sg" style={inputStyle}/>
            </div>
            <div style={{ marginBottom:'24px' }}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} required onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle}/>
            </div>

            {error && (
              <div style={{ background:'rgba(220,80,80,0.08)', border:'1px solid rgba(220,80,80,0.25)', borderRadius:'4px', padding:'10px 14px', marginBottom:'16px', fontSize:'13px', color:'#e07070', fontFamily:"'Barlow',sans-serif" }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{ width:'100%', padding:'16px', borderRadius:'4px', border:'none', background: loading ? 'rgba(255,255,255,0.08)' : '#f7f6dd', color: loading ? 'rgba(247,246,221,0.3)' : '#0A1128', fontSize:'13px', fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.15em', textTransform:'uppercase', cursor: loading ? 'not-allowed' : 'pointer', transition:'background 0.15s' }}>
              {loading ? 'Signing in…' : 'Enter Staff Portal →'}
            </button>
          </form>

          <p style={{ marginTop:'20px', fontSize:'11px', color:'rgba(247,246,221,0.2)', fontFamily:"'Barlow',sans-serif", lineHeight:1.6 }}>
            Don't have credentials? Contact your camp administrator.
          </p>
        </div>
      </div>
    </>
  );
};