import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDevotionStore } from '../stores/devotionStore';
import type { SermonNote } from '../types';

export const SermonsPage: React.FC = () => {
  const { user, hasRole } = useAuthStore();
  const { sermonNotes, addSermonNote } = useDevotionStore();

  const [selected, setSelected] = useState<SermonNote | null>(null);
  const [showUpload, setShowUpload]   = useState(false);
  const [title, setTitle]             = useState('');
  const [day, setDay]                 = useState(1);
  const [pdfUrl, setPdfUrl]           = useState('');
  const [questions, setQuestions]     = useState('');

  const canUpload = hasRole(['comms']);

  const handleUpload = (): void => {
    if (!title || !pdfUrl) return;
    addSermonNote({
      sessionTitle: title,
      day,
      pdfUrl,
      reflectionQuestions: questions.split('\n').map((q) => q.trim()).filter(Boolean),
    });
    setTitle(''); setPdfUrl(''); setQuestions(''); setShowUpload(false);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--text-primary)', margin: '0 0 6px' }}>
            📝 Sermon Notes
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            Session notes and reflection questions — updated after each session.
          </p>
        </div>
        {canUpload && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            style={outlineGoldBtn}
          >
            + Upload Notes
          </button>
        )}
      </div>

      {/* Upload form */}
      {showUpload && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--gold)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 16px', fontSize: '16px' }}>Upload Sermon Notes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <input placeholder="Session Title" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
            <input placeholder="PDF URL" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} style={inputStyle} />
            <input type="number" placeholder="Day #" value={day} min={1} max={4} onChange={(e) => setDay(parseInt(e.target.value, 10))} style={inputStyle} />
          </div>
          <textarea
            placeholder={"Reflection questions (one per line)"}
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', marginBottom: '12px' }}
          />
          <button onClick={handleUpload} style={primaryBtn}>Upload</button>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '260px 1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Note cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sermonNotes.map((note: SermonNote) => (
            <button
              key={note.id}
              onClick={() => setSelected(note)}
              style={{
                textAlign: 'left',
                padding: '18px',
                borderRadius: '14px',
                border: '1px solid',
                borderColor: selected?.id === note.id ? 'var(--gold)' : 'var(--border)',
                background: selected?.id === note.id ? 'rgba(212,165,90,0.1)' : 'var(--card-bg)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Day {note.day}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {note.sessionTitle}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {note.reflectionQuestions.length} reflection questions
              </div>
            </button>
          ))}
          {sermonNotes.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No sermon notes uploaded yet.</p>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <iframe src={selected.pdfUrl} title={selected.sessionTitle} style={{ width: '100%', height: '360px', border: 'none' }} />
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Reflection Questions
              </div>
              {selected.reflectionQuestions.map((q, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '12px',
                    padding: '14px',
                    background: 'rgba(212,165,90,0.06)',
                    borderRadius: '10px',
                    border: '1px solid rgba(212,165,90,0.15)',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gold)', minWidth: '20px' }}>{i + 1}.</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  background: 'var(--input-bg)',
  color: 'var(--text-primary)',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const primaryBtn: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: '10px',
  border: 'none',
  background: 'linear-gradient(135deg, var(--gold), #c49a50)',
  color: '#1a1208',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
};

const outlineGoldBtn: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: '10px',
  border: '1px solid var(--gold)',
  background: 'rgba(212,165,90,0.1)',
  color: 'var(--gold)',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};
