import * as React from 'react';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useCommunityStore } from '../stores/communityStore';
import type { PrayerRequest } from '../types';

export const PrayerPage: React.FC = () => {
  const { user, hasRole }                                              = useAuthStore();
  const { prayerRequests, submitPrayerRequest, markPrayed }           = useCommunityStore();

  const [content, setContent]         = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [submitted, setSubmitted]     = useState<boolean>(false);

  const isPastoral = hasRole(['pastoral']);

  const handleSubmit = (): void => {
    if (!content.trim() || !user) return;
    submitPrayerRequest(content.trim(), user.id, isAnonymous);
    setContent('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const visibleRequests: PrayerRequest[] = isPastoral
    ? prayerRequests
    : prayerRequests.filter((r) => r.submittedBy === user?.id);

  const cardStyle: React.CSSProperties = {
    background: 'var(--card-bg)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '28px',
  };

  const textareaStyle: React.CSSProperties = {
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
  };

  const submitBtnStyle: React.CSSProperties = {
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
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            color: 'var(--text-primary)',
            margin: '0 0 6px',
          }}
        >
          Prayer Wall
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 10px' }}>
          Submit your prayer requests. Our prayer ministers will be notified.
        </p>
        {isPastoral && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'rgba(160,192,160,0.12)',
              border: '1px solid rgba(160,192,160,0.3)',
              borderRadius: '100px',
              fontSize: '12px',
              color: '#a0c0a0',
            }}
          >
            Pastoral View — all requests visible
          </div>
        )}
      </div>

      {/* Submit form */}
      <div style={cardStyle}>
        <div
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '14px',
          }}
        >
          Submit a Prayer Request
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share what you would like prayer for... You are seen and loved."
          rows={4}
          style={textareaStyle}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            Submit anonymously
          </label>

          <button onClick={handleSubmit} disabled={!content.trim()} style={submitBtnStyle}>
            {submitted ? 'Sent — God hears you' : 'Send Request'}
          </button>
        </div>
      </div>

      {/* Pastoral: full list with mark-prayed */}
      {isPastoral && (
        <div>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}
          >
            All Prayer Requests ({prayerRequests.length})
          </div>

          {visibleRequests.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No requests yet.</p>
          )}

          {visibleRequests.map((req) => (
            <div
              key={req.id}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '18px',
                marginBottom: '12px',
                opacity: req.status === 'prayed' ? 0.6 : 1,
              }}
            >
              <p
                style={{
                  margin: '0 0 10px',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                }}
              >
                {req.content}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {req.isAnonymous ? 'Anonymous' : req.submittedBy}
                  {' · '}
                  {new Date(req.submittedAt).toLocaleString()}
                </div>
                {req.status === 'pending' ? (
                  <button
                    onClick={() => markPrayed(req.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(160,192,160,0.4)',
                      background: 'rgba(160,192,160,0.1)',
                      color: '#a0c0a0',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Mark Prayed
                  </button>
                ) : (
                  <span style={{ fontSize: '12px', color: '#a0c0a0' }}>Prayed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member view */}
      {!isPastoral && (
        <div
          style={{
            padding: '24px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Your request has been sent to our prayer team. They will be praying for you.
            Rest in the knowledge that God hears every prayer.
          </p>
        </div>
      )}
    </div>
  );
};
