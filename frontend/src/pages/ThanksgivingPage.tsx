import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useCommunityStore } from '../stores/communityStore';

export const ThanksgivingPage: React.FC = () => {
  const { user } = useAuthStore();
  const { thanksgivings, submitThanksgiving } = useCommunityStore();

  const [content, setContent]         = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted]     = useState(false);

  const handleSubmit = (): void => {
    if (!content.trim() || !user) return;
    submitThanksgiving(content.trim(), user.id, isAnonymous);
    setContent('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--text-primary)', margin: '0 0 6px' }}>
          🌿 Thanksgiving Wall
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
          What are you grateful for? Share the goodness of God with the community.
        </p>
      </div>

      {/* Submit */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Give Thanks
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="I am thankful for... / God has been faithful in..."
          rows={3}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--input-bg)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
            lineHeight: 1.6,
            boxSizing: 'border-box',
            marginBottom: '12px',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            Post anonymously
          </label>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: content.trim()
                ? 'linear-gradient(135deg, #6B8B6B, #557755)'
                : 'var(--border)',
              color: content.trim() ? '#fff' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: content.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            {submitted ? '✓ Posted!' : 'Give Thanks 🌿'}
          </button>
        </div>
      </div>

      {/* Wall */}
      {thanksgivings.length === 0 && (
        <div style={{
          padding: '48px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '14px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
        }}>
          Be the first to give thanks! 🌿
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
        {[...thanksgivings].reverse().map((t) => (
          <div
            key={t.id}
            style={{
              background: 'linear-gradient(135deg, rgba(107,139,107,0.1), rgba(85,119,85,0.05))',
              border: '1px solid rgba(107,139,107,0.25)',
              borderRadius: '14px',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '10px' }}>🌿</div>
            <p style={{ margin: '0 0 10px', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7, fontStyle: 'italic' }}>
              &ldquo;{t.content}&rdquo;
            </p>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {t.isAnonymous ? 'Anonymous' : t.submittedBy}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
