import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useCommunityStore } from '../stores/communityStore';
import { DRIVE_FOLDER_URL, DRIVE_EMBED_URL } from '../services/googlePhotos';

const CSS = `
  .photos-page { padding: 24px; max-width: 960px; }
  .photos-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 12px; flex-wrap: wrap; }
  .photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 20px; }
  @media (max-width: 640px) {
    .photos-page { padding: 16px 14px; }
    .photos-grid { grid-template-columns: 1fr; }
  }
`;

export const PhotosPage: React.FC = () => {
  const { hasRole } = useAuthStore();
  const { photoAlbums, photosPublic, setPhotosPublic, addPhotoAlbum, removePhotoAlbum } = useCommunityStore();

  const isAdmin   = hasRole(['administrator']);
  const isComms   = hasRole(['comms']);
  const canManage = isAdmin || isComms;
  const canView   = canManage || photosPublic;

  const [showAdd, setShowAdd]     = useState(false);
  const [newTitle, setNewTitle]   = useState('');
  const [newUrl, setNewUrl]       = useState('');
  const [newCover, setNewCover]   = useState('');

  const handleAdd = (): void => {
    if (!newTitle || !newUrl) return;
    addPhotoAlbum({ title: newTitle, googlePhotosUrl: newUrl, coverPhotoUrl: newCover, updatedAt: new Date().toISOString() });
    setNewTitle(''); setNewUrl(''); setNewCover(''); setShowAdd(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="photos-page">

        {/* Header */}
        <div className="photos-header">
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#D4E600', marginBottom:'4px' }}>Camp</div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(28px,6vw,40px)', color:'#F0EDE4', margin:'0 0 6px', lineHeight:1 }}>Photos</h1>
            <p style={{ color:'rgba(240,237,228,0.4)', fontSize:'13px', margin:0, fontFamily:"'Barlow',sans-serif" }}>
              Camp memories — auto-updated via Google Drive
            </p>
          </div>

          {canManage && (
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', flexShrink:0 }}>
              {/* Approve / hide toggle */}
              <button onClick={() => setPhotosPublic(!photosPublic)} style={{
                padding:'10px 16px', borderRadius:'4px', border:'1px solid',
                borderColor: photosPublic ? 'rgba(90,138,60,0.5)' : 'rgba(212,230,0,0.4)',
                background:  photosPublic ? 'rgba(90,138,60,0.12)' : 'rgba(212,230,0,0.08)',
                color:       photosPublic ? '#8BC34A' : '#D4E600',
                fontSize:'11px', fontWeight:700, cursor:'pointer',
                fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase',
              }}>
                {photosPublic ? '✓ Visible to Members' : '🔒 Hidden from Members'}
              </button>
              <button onClick={() => setShowAdd(!showAdd)} style={{
                padding:'10px 16px', borderRadius:'4px',
                border:'1px solid rgba(255,255,255,0.1)',
                background:'rgba(255,255,255,0.04)', color:'rgba(240,237,228,0.6)',
                fontSize:'11px', fontWeight:700, cursor:'pointer',
                fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase',
              }}>+ Add Album</button>
            </div>
          )}
        </div>

        {/* Add album form */}
        {showAdd && canManage && (
          <div style={{ background:'#111D3E', border:'1px solid rgba(212,230,0,0.2)', borderRadius:'8px', padding:'20px', marginBottom:'24px' }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'13px', letterSpacing:'0.1em', textTransform:'uppercase', color:'#F0EDE4', marginBottom:'14px' }}>Add Album</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
              <input placeholder="Album title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={inp}/>
              <input placeholder="Google Drive / Photos URL" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} style={inp}/>
              <input placeholder="Cover image URL (optional)" value={newCover} onChange={(e) => setNewCover(e.target.value)} style={{ ...inp, gridColumn:'1 / -1' }}/>
            </div>
            <button onClick={handleAdd} style={primaryBtn}>Add Album</button>
          </div>
        )}

        {/* Locked state for members */}
        {!canView && (
          <div style={{ textAlign:'center', padding:'64px 24px', background:'#111D3E', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>📸</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'22px', textTransform:'uppercase', color:'#F0EDE4', marginBottom:'8px' }}>
              Photos Coming Soon
            </div>
            <p style={{ color:'rgba(240,237,228,0.4)', fontSize:'14px', fontFamily:"'Barlow',sans-serif", maxWidth:'320px', margin:'0 auto', lineHeight:1.7 }}>
              Camp photos will be shared here after camp. Check back soon!
            </p>
          </div>
        )}

        {/* Albums grid */}
        {canView && (
          <>
            {/* Admin status banner */}
            {canManage && (
              <div style={{
                padding:'12px 16px', borderRadius:'6px', marginBottom:'20px',
                background: photosPublic ? 'rgba(90,138,60,0.08)' : 'rgba(212,230,0,0.06)',
                border: `1px solid ${photosPublic ? 'rgba(90,138,60,0.2)' : 'rgba(212,230,0,0.15)'}`,
                fontSize:'12px', fontFamily:"'Barlow',sans-serif",
                color: photosPublic ? '#8BC34A' : 'rgba(212,230,0,0.7)',
              }}>
                {photosPublic
                  ? '✓ Photos are visible to all members. Click "Visible to Members" above to hide them.'
                  : '⚠ Photos are currently hidden from members. Click the button above to make them visible.'}
              </div>
            )}

            <div className="photos-grid">
              {photoAlbums.map((album) => (
                <div key={album.id} style={{ background:'#111D3E', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', overflow:'hidden', position:'relative' }}>

                  {/* Cover / embed preview */}
                  {album.coverPhotoUrl ? (
                    <img src={album.coverPhotoUrl} alt={album.title} style={{ width:'100%', height:'180px', objectFit:'cover', display:'block' }}/>
                  ) : (
                    <div style={{ width:'100%', height:'180px', background:'linear-gradient(135deg,#0D1B4A,#0A1128)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:'40px', opacity:0.3 }}>📷</span>
                    </div>
                  )}

                  <div style={{ padding:'16px' }}>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:'16px', color:'#F0EDE4', marginBottom:'4px' }}>{album.title}</div>
                    <div style={{ fontSize:'11px', color:'rgba(240,237,228,0.25)', fontFamily:"'Barlow',sans-serif", marginBottom:'14px' }}>
                      Updated {new Date(album.updatedAt).toLocaleDateString()}
                    </div>

                    <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                      <a href={album.googlePhotosUrl} target="_blank" rel="noopener noreferrer" style={{
                        display:'inline-flex', alignItems:'center', gap:'6px',
                        padding:'8px 14px', borderRadius:'4px',
                        background:'#D4E600', color:'#0A1128',
                        textDecoration:'none', fontSize:'11px', fontWeight:800,
                        fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase',
                      }}>View Album ↗</a>

                      {canManage && (
                        <button onClick={() => removePhotoAlbum(album.id)} style={{
                          padding:'8px 12px', borderRadius:'4px', border:'1px solid rgba(220,80,80,0.3)',
                          background:'transparent', color:'rgba(220,80,80,0.6)',
                          fontSize:'11px', fontWeight:700, cursor:'pointer',
                          fontFamily:"'Barlow Condensed',sans-serif",
                        }}>Remove</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Embedded Drive folder (auto-updates) */}
            <div style={{ marginTop:'32px' }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(240,237,228,0.3)', marginBottom:'12px' }}>Full Camp Folder</div>
              <div style={{ borderRadius:'8px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)' }}>
                <iframe
                  src={DRIVE_EMBED_URL}
                  title="Camp Photos"
                  style={{ width:'100%', height:'500px', border:'none' }}
                  allow="autoplay"
                />
              </div>
              <a href={DRIVE_FOLDER_URL} target="_blank" rel="noopener noreferrer" style={{
                display:'inline-flex', alignItems:'center', gap:'6px', marginTop:'12px',
                color:'rgba(212,230,0,0.6)', fontSize:'12px', fontFamily:"'Barlow',sans-serif",
                textDecoration:'none',
              }}>Open in Google Drive ↗</a>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const inp: React.CSSProperties = {
  padding:'12px 14px', borderRadius:'4px',
  border:'1px solid rgba(255,255,255,0.08)',
  background:'rgba(255,255,255,0.04)',
  color:'#F0EDE4', fontSize:'14px', outline:'none',
  width:'100%', boxSizing:'border-box',
};
const primaryBtn: React.CSSProperties = {
  padding:'10px 20px', borderRadius:'4px', border:'none',
  background:'#D4E600', color:'#0A1128',
  fontSize:'12px', fontWeight:800, cursor:'pointer',
  fontFamily:"'Barlow Condensed',sans-serif",
  letterSpacing:'0.1em', textTransform:'uppercase',
};