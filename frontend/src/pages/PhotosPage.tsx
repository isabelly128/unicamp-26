import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useCommunityStore } from '../stores/communityStore';

export const PhotosPage: React.FC = () => {
  const { hasRole } = useAuthStore();
  const { photoAlbums, addPhotoAlbum } = useCommunityStore();

  const [showAdd, setShowAdd]       = useState(false);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumUrl, setAlbumUrl]     = useState('');
  const [coverUrl, setCoverUrl]     = useState('');

  const canUpload = hasRole(['comms']);

  const handleAdd = (): void => {
    if (!albumTitle || !albumUrl) return;
    addPhotoAlbum({
      title: albumTitle,
      googlePhotosUrl: albumUrl,
      coverPhotoUrl: coverUrl || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
      updatedAt: new Date().toISOString(),
    });
    setAlbumTitle(''); setAlbumUrl(''); setCoverUrl(''); setShowAdd(false);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--text-primary)', margin: '0 0 6px' }}>
            📸 Camp Photos
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            Albums auto-update when new photos are added to Google Photos.
          </p>
        </div>
        {canUpload && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={outlineGoldBtn}
          >
            + Add Album
          </button>
        )}
      </div>

      {/* Add album form */}
      {showAdd && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--gold)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 16px', fontSize: '16px' }}>Add Google Photos Album</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            <input placeholder="Album Title" value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} style={inputStyle} />
            <input placeholder="Google Photos shared album URL" value={albumUrl} onChange={(e) => setAlbumUrl(e.target.value)} style={inputStyle} />
            <input placeholder="Cover photo URL (optional)" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} style={inputStyle} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.6 }}>
            Tip: Get the shared album link from Google Photos → Share → Copy link. The album will automatically show new photos whenever you add them in Google Photos.
          </p>
          <button onClick={handleAdd} style={primaryBtn}>Add Album</button>
        </div>
      )}

      {/* Albums grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {photoAlbums.map((album) => (
          <a
            key={album.id}
            href={album.googlePhotosUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--card-bg)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-3px)';
                el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'none';
                el.style.boxShadow = 'none';
              }}
            >
              {/* Cover */}
              <div
                style={{
                  height: '180px',
                  backgroundImage: `url(${album.coverPhotoUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                >
                  Open in Google Photos ↗
                </div>
              </div>
              {/* Info */}
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {album.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Updated {new Date(album.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </a>
        ))}
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
