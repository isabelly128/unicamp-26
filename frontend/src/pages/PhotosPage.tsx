import React, { useState } from 'react';
import {
  DRIVE_FOLDER_URL,
  DRIVE_EMBED_URL,
  DRIVE_PHOTOS,
  driveImageUrl,
  driveThumbnailUrl,
} from '../services/googlePhotos';
import { useAuthStore } from '../stores/authStore';

type ViewMode = 'embed' | 'grid';
type DayFilter = 'all' | 1 | 2 | 3 | 4;

export const PhotosPage: React.FC = () => {
  const { hasRole } = useAuthStore();
  const canUpload = hasRole(['comms', 'administrator']);

  const [viewMode, setViewMode] = useState<ViewMode>('embed');
  const [dayFilter, setDayFilter] = useState<DayFilter>('all');
  const [lightbox, setLightbox] = useState<string | null>(null);

  const filteredPhotos =
    dayFilter === 'all'
      ? DRIVE_PHOTOS
      : DRIVE_PHOTOS.filter((p) => p.day === dayFilter);

  const heading: React.CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 900,
    textTransform: 'uppercase' as const,
    letterSpacing: '-0.01em',
  };

  const btnBase: React.CSSProperties = {
    padding: '8px 18px',
    borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: 'rgba(247,246,221,0.5)',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    fontFamily: "'Barlow Condensed', sans-serif",
    cursor: 'pointer',
  };

  const btnActive: React.CSSProperties = {
    ...btnBase,
    background: '#f7f6dd',
    borderColor: '#f7f6dd',
    color: '#0A1128',
  };

  return (
    <div style={{ padding: '40px', maxWidth: '960px' }}>

      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#f7f6dd', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
          Camp 2024
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <span style={{ ...heading, fontSize: '52px', color: '#f7f6dd', lineHeight: 0.9 }}>CAMP</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, fontSize: '42px', color: '#f7f6dd', lineHeight: 0.9 }}>Photos</span>
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(247,246,221,0.4)', fontFamily: "'Barlow', sans-serif" }}>
          Shared from Google Drive · updates automatically when new photos are added
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        {/* View toggle */}
        <button style={viewMode === 'embed' ? btnActive : btnBase} onClick={() => setViewMode('embed')}>
          Folder View
        </button>
        <button style={viewMode === 'grid' ? btnActive : btnBase} onClick={() => setViewMode('grid')}>
          Grid View
        </button>

        {/* Day filter (grid mode only) */}
        {viewMode === 'grid' && (
          <>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            {(['all', 1, 2, 3, 4] as DayFilter[]).map((d) => (
              <button
                key={d}
                style={dayFilter === d ? btnActive : btnBase}
                onClick={() => setDayFilter(d)}
              >
                {d === 'all' ? 'All Days' : `Day ${d}`}
              </button>
            ))}
          </>
        )}

        {/* Open in Drive */}
        <a
          href={DRIVE_FOLDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid rgba(247,246,221,0.3)',
            background: 'rgba(247,246,221,0.06)',
            color: '#f7f6dd',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: "'Barlow Condensed', sans-serif",
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Open in Drive ↗
        </a>
      </div>

      {/* ── Folder embed view ── */}
      {viewMode === 'embed' && (
        <div style={{
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#0D1635',
        }}>
          <iframe
            src={DRIVE_EMBED_URL}
            title="Camp Photos"
            style={{ width: '100%', height: '600px', border: 'none', display: 'block' }}
            allow="autoplay"
          />
        </div>
      )}

      {/* ── Grid view ── */}
      {viewMode === 'grid' && (
        <>
          {filteredPhotos.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 32px',
              background: '#111D3E',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
              <div style={{ ...heading, fontSize: '28px', color: '#f7f6dd', marginBottom: '8px' }}>
                No photos yet
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(247,246,221,0.35)', fontFamily: "'Barlow', sans-serif", marginBottom: '20px' }}>
                {canUpload
                  ? 'Add photos to the Google Drive folder — then paste their file IDs into googlePhotos.ts to show them here.'
                  : 'Photos will appear here once the comms team uploads them.'}
              </p>
              <a
                href={DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', padding: '10px 24px',
                  background: '#f7f6dd', borderRadius: '4px',
                  color: '#0A1128', fontSize: '12px', fontWeight: 800,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  textDecoration: 'none',
                }}
              >
                Open Drive Folder ↗
              </a>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '8px',
            }}>
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setLightbox(driveImageUrl(photo.id))}
                  style={{
                    position: 'relative', aspectRatio: '1',
                    borderRadius: '4px', overflow: 'hidden',
                    cursor: 'pointer', background: '#111D3E',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                >
                  <img
                    src={driveThumbnailUrl(photo.id, 400)}
                    alt={photo.caption ?? 'Camp photo'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  {photo.caption && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      padding: '8px 10px',
                      background: 'linear-gradient(transparent, rgba(6,13,30,0.85))',
                      fontSize: '11px', color: 'rgba(247,246,221,0.8)',
                      fontFamily: "'Barlow', sans-serif",
                    }}>{photo.caption}</div>
                  )}
                  {photo.day && (
                    <div style={{
                      position: 'absolute', top: '8px', right: '8px',
                      background: '#f7f6dd', color: '#0A1128',
                      fontSize: '9px', fontWeight: 800,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      fontFamily: "'Barlow Condensed', sans-serif",
                      padding: '2px 6px', borderRadius: '2px',
                    }}>Day {photo.day}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(6,13,30,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightbox}
            alt="Full size"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '4px' }}
          />
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: '24px', right: '24px',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: '#f7f6dd', fontSize: '20px', width: '40px', height: '40px',
              borderRadius: '50%', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>
      )}

      {/* How to add photos — comms/admin only */}
      {canUpload && (
        <div style={{
          marginTop: '32px', padding: '20px 24px',
          background: 'rgba(247,246,221,0.04)',
          border: '1px solid rgba(247,246,221,0.12)',
          borderRadius: '6px',
        }}>
          <div style={{ ...heading, fontSize: '14px', color: '#f7f6dd', marginBottom: '10px' }}>
            📋 How to add photos
          </div>
          <ol style={{ paddingLeft: '18px', fontSize: '13px', color: 'rgba(247,246,221,0.5)', fontFamily: "'Barlow', sans-serif", lineHeight: 2 }}>
            <li>Upload photos to the <a href={DRIVE_FOLDER_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#f7f6dd' }}>shared Drive folder ↗</a></li>
            <li>Right-click a photo → <em>Share</em> → set to <strong>"Anyone with the link"</strong></li>
            <li>Copy the file ID from the share URL (the long string between <code>/d/</code> and <code>/view</code>)</li>
            <li>Paste it into <code>src/services/googlePhotos.ts</code> in the <code>DRIVE_PHOTOS</code> array</li>
            <li>The Folder View updates automatically with no code changes needed</li>
          </ol>
        </div>
      )}
    </div>
  );
};