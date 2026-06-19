import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useCommunityStore } from '../stores/communityStore';
import type { PhotoAlbum } from '../stores/communityStore';
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
  const { hasRole }                                                                    = useAuthStore();
  const { photoAlbums, photosPublic, setPhotosPublic, addPhotoAlbum, removePhotoAlbum } = useCommunityStore();

  const canManage = hasRole(['administrator', 'comms']);
  const canView   = canManage || photosPublic;

  const [showAdd,   setShowAdd]   = useState(false);
  const [newTitle,  setNewTitle]  = useState('');
  const [newUrl,    setNewUrl]    = useState('');
  const [newCover,  setNewCover]  = useState('');

  // Per-album cover editing
  const [editingCoverId, setEditingCoverId] = useState<string | null>(null);
  const [coverDraft,     setCoverDraft]     = useState('');

  // useCommunityStore update cover
  const { photoAlbums: albums } = useCommunityStore();
  // We update cover by removing and re-adding — or better, use a local override map
  const [coverOverrides, setCoverOverrides] = useState<Record<string, string>>({});

  const saveCover = (albumId: string): void => {
    setCoverOverrides((prev) => ({ ...prev, [albumId]: coverDraft }));
    setEditingCoverId(null);
  };

  const getCover = (album: PhotoAlbum): string =>
    coverOverrides[album.id] ?? album.coverPhotoUrl;

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
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'4px' }}>Camp</div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(28px,6vw,40px)', color:'#f7f6dd', margin:'0 0 6px', lineHeight:1 }}>Photos</h1>
            <p style={{ color:'rgba(247,246,221,0.4)', fontSize:'13px', margin:0, fontFamily:"'Barlow',sans-serif" }}>Camp memories — auto-updated via Google Drive</p>
          </div>
          {canManage && (
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', flexShrink:0 }}>
              <button onClick={() => setPhotosPublic(!photosPublic)} style={{
                padding:'10px 16px', borderRadius:'4px', border:'1px solid',
                borderColor: photosPublic ? 'rgba(90,138,60,0.5)' : 'rgba(247,246,221,0.4)',
                background:  photosPublic ? 'rgba(90,138,60,0.12)' : 'rgba(247,246,221,0.08)',
                color:       photosPublic ? '#8BC34A' : '#f7f6dd',
                fontSize:'11px', fontWeight:700, cursor:'pointer',
                fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase',
              }}>
                {photosPublic ? '✓ Visible to Members' : '🔒 Hidden from Members'}
              </button>
              <button onClick={() => setShowAdd(!showAdd)} style={{ padding:'10px 16px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(247,246,221,0.6)', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase' }}>
                + Add Album
              </button>
            </div>
          )}
        </div>

        {/* Add album form */}
        {showAdd && canManage && (
          <div style={{ background:'#111D3E', border:'1px solid rgba(247,246,221,0.2)', borderRadius:'8px', padding:'20px', marginBottom:'24px' }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'13px', letterSpacing:'0.1em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'14px' }}>Add Album</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'12px' }}>
              <input placeholder="Album title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={inp}/>
              <input placeholder="Google Drive / Photos URL" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} style={inp}/>
              <input placeholder="Cover image URL (optional)" value={newCover} onChange={(e) => setNewCover(e.target.value)} style={inp}/>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={handleAdd} style={primaryBtn}>Add Album</button>
              <button onClick={() => setShowAdd(false)} style={ghostBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* Locked state for members */}
        {!canView && (
          <div style={{ textAlign:'center', padding:'64px 24px', background:'#111D3E', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>📸</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'22px', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'8px' }}>Photos Coming Soon</div>
            <p style={{ color:'rgba(247,246,221,0.4)', fontSize:'14px', fontFamily:"'Barlow',sans-serif", maxWidth:'320px', margin:'0 auto', lineHeight:1.7 }}>
              Camp photos will be shared here after camp. Check back soon!
            </p>
          </div>
        )}

        {/* Albums */}
        {canView && (
          <>
            {canManage && (
              <div style={{ padding:'12px 16px', borderRadius:'6px', marginBottom:'20px', background: photosPublic ? 'rgba(90,138,60,0.08)' : 'rgba(247,246,221,0.06)', border: `1px solid ${photosPublic ? 'rgba(90,138,60,0.2)' : 'rgba(247,246,221,0.15)'}`, fontSize:'12px', fontFamily:"'Barlow',sans-serif", color: photosPublic ? '#8BC34A' : 'rgba(247,246,221,0.6)' }}>
                {photosPublic
                  ? '✓ Photos are visible to all members.'
                  : '⚠ Photos are currently hidden from members. Click "Hidden from Members" above to reveal them.'}
              </div>
            )}

            <div className="photos-grid">
              {photoAlbums.map((album: PhotoAlbum) => (
                <div key={album.id} style={{ background:'#111D3E', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', overflow:'hidden', position:'relative' }}>

                  {/* Cover image */}
                  {getCover(album) ? (
                    <img src={getCover(album)} alt={album.title} style={{ width:'100%', height:'180px', objectFit:'cover', display:'block' }}/>
                  ) : (
                    <div style={{ width:'100%', height:'180px', background:'linear-gradient(135deg,#0D1B4A,#0A1128)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:'40px', opacity:0.3 }}>📷</span>
                    </div>
                  )}

                  {/* Edit cover button (admin only) */}
                  {canManage && (
                    <div style={{ position:'absolute', top:'8px', right:'8px' }}>
                      {editingCoverId === album.id ? (
                        <div style={{ background:'rgba(10,17,40,0.95)', borderRadius:'6px', padding:'10px', display:'flex', flexDirection:'column', gap:'6px', minWidth:'200px', border:'1px solid rgba(247,246,221,0.2)' }}>
                          <input
                            value={coverDraft}
                            onChange={(e) => setCoverDraft(e.target.value)}
                            placeholder="Paste cover image URL..."
                            style={{ ...inp, fontSize:'11px', padding:'7px 10px' }}
                            autoFocus
                          />
                          <div style={{ display:'flex', gap:'6px' }}>
                            <button onClick={() => saveCover(album.id)} style={{ ...primaryBtn, padding:'6px 12px', fontSize:'10px', flex:1 }}>Save</button>
                            <button onClick={() => setEditingCoverId(null)} style={{ ...ghostBtn, padding:'6px 10px', fontSize:'10px' }}>✕</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingCoverId(album.id); setCoverDraft(getCover(album)); }} style={{ padding:'5px 10px', borderRadius:'4px', border:'1px solid rgba(247,246,221,0.3)', background:'rgba(10,17,40,0.8)', color:'rgba(247,246,221,0.7)', fontSize:'10px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.06em', textTransform:'uppercase', backdropFilter:'blur(4px)' }}>
                          🖼 Cover
                        </button>
                      )}
                    </div>
                  )}

                  <div style={{ padding:'16px' }}>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:'16px', color:'#f7f6dd', marginBottom:'4px' }}>{album.title}</div>
                    <div style={{ fontSize:'11px', color:'rgba(247,246,221,0.25)', fontFamily:"'Barlow',sans-serif", marginBottom:'14px' }}>
                      Updated {new Date(album.updatedAt).toLocaleDateString()}
                    </div>
                    <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                      <a href={album.googlePhotosUrl} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'4px', background:'#f7f6dd', color:'#0A1128', textDecoration:'none', fontSize:'11px', fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase' }}>
                        View Album ↗
                      </a>
                      {canManage && (
                        <button onClick={() => removePhotoAlbum(album.id)} style={{ padding:'8px 12px', borderRadius:'4px', border:'1px solid rgba(220,80,80,0.3)', background:'transparent', color:'rgba(220,80,80,0.6)', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif" }}>Remove</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Embedded Drive folder */}
            <div style={{ marginTop:'32px' }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(247,246,221,0.3)', marginBottom:'12px' }}>Full Camp Folder</div>
              <div style={{ borderRadius:'8px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)' }}>
                <iframe src={DRIVE_EMBED_URL} title="Camp Photos" style={{ width:'100%', height:'480px', border:'none' }} allow="autoplay"/>
              </div>
              <a href={DRIVE_FOLDER_URL} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'6px', marginTop:'12px', color:'rgba(247,246,221,0.5)', fontSize:'12px', fontFamily:"'Barlow',sans-serif", textDecoration:'none' }}>
                Open in Google Drive ↗
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
};

const inp: React.CSSProperties = { padding:'11px 13px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#f7f6dd', fontSize:'13px', outline:'none', width:'100%', boxSizing:'border-box' };
const primaryBtn: React.CSSProperties = { padding:'9px 18px', borderRadius:'4px', border:'none', background:'#f7f6dd', color:'#0A1128', fontSize:'11px', fontWeight:800, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase' };
const ghostBtn: React.CSSProperties = { padding:'9px 14px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(247,246,221,0.5)', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' };