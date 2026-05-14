import React, { useState } from 'react';
import { useCommunityStore } from '../stores/communityStore';

export const BlessingsPage: React.FC = () => {
  const { getTodayBlessing, nextBlessing } = useCommunityStore();
  const [flipped, setFlipped] = useState(false);

  const blessing = getTodayBlessing();

  const handleNext = (): void => {
    setFlipped(false);
    setTimeout(() => {
      nextBlessing();
      setFlipped(true);
    }, 200);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '700px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--text-primary)', margin: '0 0 6px' }}>
          ✨ Blessings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
          Randomized blessing prompts to encourage and build one another up throughout camp.
        </p>
      </div>

      {/* Blessing Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(212,165,90,0.15) 0%, rgba(160,130,100,0.08) 100%)',
          border: '1px solid rgba(212,165,90,0.3)',
          borderRadius: '20px',
          padding: '48px 40px',
          textAlign: 'center',
          marginBottom: '24px',
          transition: 'opacity 0.2s',
          opacity: flipped ? 0.5 : 1,
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>✨</div>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            margin: '0 0 32px',
            maxWidth: '480px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {blessing.prompt}
        </p>
        <div
          style={{
            display: 'inline-block',
            padding: '6px 14px',
            background: 'rgba(212,165,90,0.15)',
            border: '1px solid rgba(212,165,90,0.3)',
            borderRadius: '100px',
            fontSize: '12px',
            color: 'var(--gold)',
            fontWeight: 600,
            marginBottom: '0',
          }}
        >
          Day {blessing.day} Prompt
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={handleNext}
          style={{
            padding: '12px 28px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--gold), #c49a50)',
            color: '#1a1208',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          New Blessing Prompt ✨
        </button>
      </div>

      {/* Instruction */}
      <div
        style={{
          marginTop: '40px',
          padding: '24px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
          How to use this
        </div>
        <ul style={{ margin: 0, padding: '0 0 0 20px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 2 }}>
          <li>Tap &ldquo;New Blessing Prompt&rdquo; to get a new randomized prompt.</li>
          <li>Take a moment to act on it — bless someone around you!</li>
          <li>These prompts rotate throughout the day to keep things fresh.</li>
          <li>Share with your cell group and do them together.</li>
        </ul>
      </div>
    </div>
  );
};
