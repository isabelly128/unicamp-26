import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useCommunityStore } from '../stores/communityStore';

export const ConvictionsPage: React.FC = () => {
  const { user, hasRole } = useAuthStore();
  const { convictions, submitConviction, approveConviction, rejectConviction } = useCommunityStore();

  const [content, setContent]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isPastoral   = hasRole(['pastoral']);
  const approvedList = convictions.filter((c) => c.approved);
  const pendingList  = convictions.filter((c) => !c.approved);

  const handleSubmit = (): void => {
    if (!content.trim()) return;
    submitConviction(content.trim());
    setContent('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--text-primary)', margin: '0 0 6px' }}>
          💛 Convictions
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
          What has God placed on your heart? What do you want to commit to after camp?
          <br />
          Shared anonymously to encourage the congregation. Share with your mentor or leader too.
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
          Share Your Conviction
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="God has placed on my heart... / I want to commit to..."
          rows={4}
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
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Submitted anonymously · reviewed by pastoral team before publishing
          </span>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: content.trim()
                ? 'linear-gradient(135deg, var(--gold), #c49a50)'
                : 'var(--border)',
              color: content.trim() ? '#1a1208' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: content.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            {submitted ? '✓ Submitted!' : 'Submit Conviction'}
          </button>
        </div>
      </div>

      {/* Pastoral: pending approvals */}
      {isPastoral && pendingList.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Pending Approval ({pendingList.length})
          </div>
          {pendingList.map((c) => (
            <div
              key={c.id}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid rgba(212,165,90,0.3)',
                borderRadius: '12px',
                padding: '18px',
                marginBottom: '10px',
              }}
            >
              <p style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {c.content}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => approveConviction(c.id, user?.name ?? 'Pastoral')}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(160,192,160,0.4)',
                    background: 'rgba(160,192,160,0.1)',
                    color: '#a0c0a0',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => rejectConviction(c.id)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(220,100,100,0.3)',
                    background: 'rgba(220,100,100,0.08)',
                    color: '#e08080',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Public wall — approved only */}
      <div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          What God is Doing ✨ ({approvedList.length})
        </div>
        {approvedList.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '14px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
          }}>
            Convictions will appear here once approved. Be the first to share!
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
          {approvedList.map((c) => (
            <div
              key={c.id}
              style={{
                background: 'linear-gradient(135deg, rgba(212,165,90,0.08), rgba(160,130,100,0.04))',
                border: '1px solid rgba(212,165,90,0.2)',
                borderRadius: '14px',
                padding: '20px',
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>💛</div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7, fontStyle: 'italic' }}>
                &ldquo;{c.content}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
