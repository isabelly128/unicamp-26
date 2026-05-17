import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface FeatureCard {
  icon: string;
  label: string;
  labelScript?: string;
  path: string;
  desc: string;
  accent: string;
}

const FEATURE_CARDS: FeatureCard[] = [
  { icon: '📖', label: 'CAMP',    labelScript: 'Booklet',    path: '/booklet',      desc: 'Program flow & schedule',     accent: '#D4E600' },
  { icon: '🕊️', label: 'DAILY',  labelScript: 'Devotions',  path: '/devotions',    desc: 'Read · Reflect · Record',     accent: '#4A90D9' },
  { icon: '📝', label: 'SERMON',  labelScript: 'Notes',      path: '/sermons',      desc: 'Session notes & questions',   accent: '#D4E600' },
  { icon: '📸', label: 'CAMP',    labelScript: 'Photos',     path: '/photos',       desc: 'Auto-updating albums',        accent: '#5A8A3C' },
  { icon: '🙏', label: 'PRAYER',  labelScript: 'Wall',       path: '/prayer',       desc: 'Submit & see requests',       accent: '#4A90D9' },
  { icon: '💛', label: 'YOUR',    labelScript: 'Convictions',path: '/convictions',  desc: 'What God placed on you',      accent: '#D4E600' },
  { icon: '🌿', label: 'THANKS',  labelScript: 'giving',     path: '/thanksgiving', desc: 'Gratitude wall',              accent: '#5A8A3C' },
  { icon: '✨', label: 'DAILY',   labelScript: 'Blessings',  path: '/blessings',    desc: 'Randomized prompts',          accent: '#D4E600' },
];

const CAMP_DATES = 'July 2 – 5, 2026';
const THEME_VERSE = '"Then I heard the voice of the Lord saying, \'Whom shall I send?\' And I said, \'Here am I. Send me!\'" — Isaiah 6:8';

export const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] ?? 'friend';

  return (
    <div style={{ padding: '40px 40px 60px', maxWidth: '960px' }}>

      {/* Hero */}
      <div style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '48px',
        background: 'linear-gradient(135deg, #0D1B4A 0%, #111D3E 100%)',
        border: '1px solid rgba(212,230,0,0.15)',
        padding: '56px 56px 48px',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}>
        {/* Top label */}
        <div style={{
          position: 'absolute', top: '32px', left: '56px',
          fontSize: '11px', letterSpacing: '0.2em',
          color: 'rgba(212,230,0,0.6)', fontWeight: 600,
          textTransform: 'uppercase',
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>
          {CAMP_DATES}
        </div>

        {/* Background glow */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '50%', height: '100%',
          background: 'radial-gradient(ellipse at 80% 30%, rgba(74,144,217,0.1) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Big type */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 'clamp(56px, 8vw, 88px)',
              lineHeight: 0.9, textTransform: 'uppercase',
              color: '#F0EDE4', letterSpacing: '-0.02em',
            }}>HERE</span>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic', fontWeight: 700,
              fontSize: 'clamp(40px, 6vw, 68px)',
              lineHeight: 0.9, color: '#D4E600',
            }}>I Am,</span>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: 'clamp(56px, 8vw, 88px)',
              lineHeight: 0.9, textTransform: 'uppercase',
              color: '#F0EDE4', letterSpacing: '-0.02em',
            }}>LORD.</span>
          </div>

          <p style={{
            fontSize: '13px', color: 'rgba(240,237,228,0.4)',
            fontStyle: 'italic', lineHeight: 1.7,
            maxWidth: '420px', marginTop: '20px', marginBottom: '28px',
            fontFamily: "'Barlow', sans-serif",
          }}>{THEME_VERSE}</p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href="https://open.spotify.com/playlist/your-playlist-id"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '10px 20px',
                background: '#1DB954', borderRadius: '4px',
                textDecoration: 'none', color: '#fff',
                fontSize: '12px', fontWeight: 700,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}
            >
              🎵 Camp Playlist
            </a>
            <a
              href="https://t.me/your-group-link"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '10px 20px',
                background: '#0088cc', borderRadius: '4px',
                textDecoration: 'none', color: '#fff',
                fontSize: '12px', fontWeight: 700,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}
            >
              💬 Telegram
            </a>
          </div>
        </div>
      </div>

      {/* Welcome */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: '32px',
          textTransform: 'uppercase', letterSpacing: '-0.01em',
          color: '#F0EDE4',
        }}>
          WELCOME BACK,{' '}
        </span>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic', fontWeight: 700,
          fontSize: '28px', color: '#D4E600',
        }}>
          {firstName}.
        </span>
      </div>

      {/* Feature grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
      }}>
        {FEATURE_CARDS.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '24px 20px 20px',
              background: '#111D3E',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              textDecoration: 'none',
              minHeight: '140px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.15s, transform 0.15s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = card.accent;
              el.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = 'rgba(255,255,255,0.06)';
              el.style.transform = 'none';
            }}
          >
            {/* Top-right icon */}
            <div style={{
              position: 'absolute', top: '16px', right: '16px',
              fontSize: '22px', opacity: 0.6,
            }}>{card.icon}</div>

            {/* Label */}
            <div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800, fontSize: '13px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: card.accent, marginBottom: '2px',
              }}>{card.label}</div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic', fontWeight: 700,
                fontSize: '22px', color: '#F0EDE4',
                lineHeight: 1.1, marginBottom: '8px',
              }}>{card.labelScript}</div>
              <div style={{
                fontSize: '11px', color: 'rgba(240,237,228,0.35)',
                fontFamily: "'Barlow', sans-serif", letterSpacing: '0.03em',
              }}>{card.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};