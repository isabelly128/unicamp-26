import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDevotionStore } from '../stores/devotionStore';
import type { Devotion } from '../types';

type Phase = 'pre' | 'during' | 'post';

const PHASE_LABELS: Record<Phase, string> = {
  pre: 'Pre-Camp',
  during: 'During Camp',
  post: 'Post-Camp',
};

export const DevotionsPage: React.FC = () => {
  const { user, hasRole } = useAuthStore();
  const { devotions, addDevotion, saveReflection, getReflection } = useDevotionStore();

  const [activePhase, setActivePhase] = useState<Phase>('during');
  const [selectedDevotion, setSelectedDevotion] = useState<Devotion | null>(null);
  const [reflection, setReflection] = useState('');
  const [saved, setSaved] = useState(false);

  // Upload state (comms/admin only)
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDay, setUploadDay] = useState(1);
  const [uploadPhase, setUploadPhase] = useState<Phase>('during');
  const [uploadUrl, setUploadUrl] = useState('');

  const canUpload = hasRole(['comms']);

  const filtered = devotions.filter((d: Devotion) => d.phase === activePhase);

  const openDevotion = (d: Devotion): void => {
    setSelectedDevotion(d);
    setSaved(false);
    if (user) {
      const existing = getReflection(d.id, user.id);
      setReflection(existing?.content ?? '');
    }
  };

  const handleSave = (): void => {
    if (!selectedDevotion || !user) return;
    saveReflection(selectedDevotion.id, user.id, reflection);
    setSaved(true);
  };

  const handleCopy = (): void => {
    void navigator.clipboard.writeText(reflection);
  };

  const handleUpload = (): void => {
    if (!uploadTitle || !uploadUrl) return;
    addDevotion({
      title: uploadTitle,
      day: uploadDay,
      phase: uploadPhase,
      pdfUrl: uploadUrl,
      uploadedBy: user?.name ?? 'Admin',
    });
    setUploadTitle('');
    setUploadUrl('');
    setShowUpload(false);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--text-primary)', margin: '0 0 6px' }}>
            🕊️ Devotions
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            Read, reflect, and record what God is saying to you.
          </p>
        </div>
        {canUpload && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid var(--gold)',
              background: 'rgba(212,165,90,0.1)',
              color: 'var(--gold)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Upload Devotion
          </button>
        )}
      </div>

      {/* Upload form */}
      {showUpload && (
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--gold)',
            borderRadius: '14px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 16px', fontSize: '16px' }}>Upload New Devotion</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <input
              placeholder="Title"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="PDF URL"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
              style={inputStyle}
            />
            <select
              value={uploadPhase}
              onChange={(e) => setUploadPhase(e.target.value as Phase)}
              style={inputStyle}
            >
              <option value="pre">Pre-Camp</option>
              <option value="during">During Camp</option>
              <option value="post">Post-Camp</option>
            </select>
            <input
              type="number"
              placeholder="Day #"
              value={uploadDay}
              min={0}
              max={10}
              onChange={(e) => setUploadDay(parseInt(e.target.value, 10))}
              style={inputStyle}
            />
          </div>
          <button onClick={handleUpload} style={primaryBtn}>Upload</button>
        </div>
      )}

      {/* Phase tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['pre', 'during', 'post'] as Phase[]).map((phase) => (
          <button
            key={phase}
            onClick={() => setActivePhase(phase)}
            style={{
              padding: '9px 18px',
              borderRadius: '100px',
              border: '1px solid',
              borderColor: activePhase === phase ? 'var(--gold)' : 'var(--border)',
              background: activePhase === phase ? 'rgba(212,165,90,0.15)' : 'transparent',
              color: activePhase === phase ? 'var(--gold)' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: activePhase === phase ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {PHASE_LABELS[phase]}
          </button>
        ))}
      </div>

      {/* Devotion list + viewer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedDevotion ? '260px 1fr' : '1fr', gap: '20px' }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No devotions uploaded yet.</p>
          )}
          {filtered.map((d: Devotion) => (
            <button
              key={d.id}
              onClick={() => openDevotion(d)}
              style={{
                textAlign: 'left',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: selectedDevotion?.id === d.id ? 'var(--gold)' : 'var(--border)',
                background: selectedDevotion?.id === d.id ? 'rgba(212,165,90,0.1)' : 'var(--card-bg)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {d.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Uploaded by {d.uploadedBy}
              </div>
            </button>
          ))}
        </div>

        {/* Viewer */}
        {selectedDevotion && (
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* PDF iframe */}
            <iframe
              src={selectedDevotion.pdfUrl}
              title={selectedDevotion.title}
              style={{ width: '100%', height: '360px', border: 'none' }}
            />

            {/* Reflection */}
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                My Reflection
              </div>
              <textarea
                value={reflection}
                onChange={(e) => { setReflection(e.target.value); setSaved(false); }}
                placeholder="Write your reflection here... What is God saying to you through this devotion?"
                rows={5}
                style={{
                  ...inputStyle,
                  width: '100%',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={handleSave} style={primaryBtn}>
                  {saved ? '✓ Saved' : 'Save Reflection'}
                </button>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Copy Text
                </button>
              </div>
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
