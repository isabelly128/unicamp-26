import React, { useRef, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useCommunityStore } from '../stores/communityStore';
import type { PhotoAlbum } from '../stores/communityStore';
import { DRIVE_FOLDER_URL, DRIVE_EMBED_URL } from '../services/googlePhotos';
import { uploadCampPhoto } from '../services/campPhotoStorageApi';

const CSS = `
  .photos-page { padding: 24px; max-width: 960px; }
  .photos-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; gap: 12px; flex-wrap: wrap; }
  .photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 20px; }
  .album-card { position: relative; background: #111D3E; border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; overflow: hidden; }
  .album-cover-btn { opacity: 0; transition: opacity 0.15s; }
  .album-card:hover .album-cover-btn { opacity: 1; }
  @media (max-width: 640px) {
    .photos-page { padding: 16px 14px; }
    .photos-grid { grid-template-columns: 1fr; }
    .album-cover-btn { opacity: 1 !important; }
  }
`;

export const PhotosPage: React.FC = () => {
  const { hasRole }                                                           = useAuthStore();
  const { photoAlbums, photosPublic, setPhotosPublic, addPhotoAlbum,
          removePhotoAlbum, updatePhotoAlbumCover }                           = useCommunityStore();

  const canManage = hasRole(['administrator', 'comms']);
  const canView   = canManage || photosPublic;

  const [showAdd,    setShowAdd]    = useState(false);
  const [newTitle,   setNewTitle]   = useState('');
  const [newUrl,     setNewUrl]     = useState('');
  const [uploading,  setUploading]  = useState<string | null>(null); // albumId being uploaded

  const coverRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleCoverFile = async (albumId: string, e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(albumId);
    try {
      const album = photoAlbums.find((item) => item.id === albumId);
      const { url } = await uploadCampPhoto(file, 'album-cover', album?.title || `album-${albumId}`);
      updatePhotoAlbumCover(albumId, url);
    } catch (err) {
      console.error('Cover upload failed:', err);
      const message = err instanceof Error ? err.message : 'Upload failed. Check your Supabase bucket permissions.';
      alert(message);
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const handleAdd = (): void => {
    if (!newTitle || !newUrl) return;
    addPhotoAlbum({ title: newTitle, googlePhotosUrl: newUrl, coverPhotoUrl: '', updatedAt: new Date().toISOString() });
    setNewTitle(''); setNewUrl(''); setShowAdd(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="photos-page">

        {/* Header */}
        <div className="photos-header">
          <div>
            <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'4px' }}>Camp</div>
            <h1 style={{ fontFamily:"'Alex Brush',cursive", fontStyle:'italic', fontWeight:700, fontSize:'clamp(28px,6vw,40px)', color:'#f7f6dd', margin:'0 0 6px', lineHeight:1 }}>Photos</h1>
            <p style={{ color:'rgba(247,246,221,0.4)', fontSize:'13px', margin:0, fontFamily:'Arial,Helvetica,sans-serif' }}>Camp memories — auto-updated via Google Drive</p>
          </div>
          {canManage && (
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', flexShrink:0 }}>
              <button onClick={() => setPhotosPublic(!photosPublic)} style={{
                padding:'10px 16px', borderRadius:'4px', border:'1px solid',
                borderColor: photosPublic ? 'rgba(90,138,60,0.5)' : 'rgba(247,246,221,0.4)',
                background:  photosPublic ? 'rgba(90,138,60,0.12)' : 'rgba(247,246,221,0.08)',
                color:       photosPublic ? '#8BC34A' : '#f7f6dd',
                fontSize:'11px', fontWeight:700, cursor:'pointer',
                fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", letterSpacing:'0.1em', textTransform:'uppercase',
              }}>
                {photosPublic ? '✓ Visible to Members' : '🔒 Hidden from Members'}
              </button>
              <button onClick={() => setShowAdd(!showAdd)} style={{ padding:'10px 16px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(247,246,221,0.6)', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", letterSpacing:'0.1em', textTransform:'uppercase' }}>
                + Add Album
              </button>
            </div>
          )}
        </div>

        {/* Add album form */}
        {showAdd && canManage && (
          <div style={{ background:'#111D3E', border:'1px solid rgba(247,246,221,0.2)', borderRadius:'8px', padding:'20px', marginBottom:'24px' }}>
            <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:800, fontSize:'13px', letterSpacing:'0.1em', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'14px' }}>Add Album</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'12px' }}>
              <input placeholder="Album title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={inp}/>
              <input placeholder="Google Drive / Photos URL" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} style={inp}/>
              <div style={{ fontSize:'11px', color:'rgba(247,246,221,0.3)', fontFamily:'Arial,Helvetica,sans-serif' }}>
                Cover photo: upload after adding using the 🖼 button on the card.
              </div>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={handleAdd} style={primaryBtn}>Add Album</button>
              <button onClick={() => setShowAdd(false)} style={ghostBtn}>Cancel</button>
            </div>
          </div>
        )}

        {/* Locked state */}
        {!canView && (
          <div style={{ textAlign:'center', padding:'64px 24px', background:'#111D3E', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>📸</div>
            <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:900, fontSize:'22px', textTransform:'uppercase', color:'#f7f6dd', marginBottom:'8px' }}>Photos Coming Soon</div>
            <p style={{ color:'rgba(247,246,221,0.4)', fontSize:'14px', fontFamily:'Arial,Helvetica,sans-serif', maxWidth:'320px', margin:'0 auto', lineHeight:1.7 }}>
              Camp photos will be shared here after camp. Check back soon!
            </p>
          </div>
        )}

        {/* Albums */}
        {canView && (
          <>
            {canManage && (
              <div style={{ padding:'12px 16px', borderRadius:'6px', marginBottom:'20px', background: photosPublic ? 'rgba(90,138,60,0.08)' : 'rgba(247,246,221,0.06)', border: `1px solid ${photosPublic ? 'rgba(90,138,60,0.2)' : 'rgba(247,246,221,0.15)'}`, fontSize:'12px', fontFamily:'Arial,Helvetica,sans-serif', color: photosPublic ? '#8BC34A' : 'rgba(247,246,221,0.6)' }}>
                {photosPublic ? '✓ Photos are visible to all members.' : '⚠ Photos are hidden from members. Toggle above to reveal them.'}
              </div>
            )}

            <div className="photos-grid">
              {photoAlbums.map((album: PhotoAlbum) => (
                <div key={album.id} className="album-card">

                  {/* Hidden file input per album — Supabase upload */}
                  {canManage && (
                    <input
                      ref={(el) => { coverRefs.current[album.id] = el; }}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      style={{ display:'none' }}
                      onChange={(e) => handleCoverFile(album.id, e)}
                    />
                  )}

                  {/* Cover area */}
                  <div style={{ position:'relative', width:'100%', height:'180px', background:'linear-gradient(135deg,#0D1B4A,#0A1128)', overflow:'hidden' }}>
                    {album.coverPhotoUrl ? (
                      <img src={album.coverPhotoUrl} alt={album.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                    ) : (
                      <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:'40px', opacity:0.25 }}>📷</span>
                      </div>
                    )}

                    {/* Upload cover button */}
                    {canManage && (
                      <button
                        className="album-cover-btn"
                        onClick={() => coverRefs.current[album.id]?.click()}
                        disabled={uploading === album.id}
                        style={{
                          position:'absolute', bottom:'8px', right:'8px',
                          padding:'5px 12px', borderRadius:'4px',
                          border:'1px solid rgba(247,246,221,0.35)',
                          background:'rgba(10,17,40,0.85)',
                          color:'rgba(247,246,221,0.8)',
                          fontSize:'10px', fontWeight:700, cursor: uploading === album.id ? 'not-allowed' : 'pointer',
                          fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif",
                          letterSpacing:'0.08em', textTransform:'uppercase',
                          backdropFilter:'blur(4px)',
                        }}
                      >
                        {uploading === album.id ? 'Uploading…' : `🖼 ${album.coverPhotoUrl ? 'Change Cover' : 'Upload Cover'}`}
                      </button>
                    )}
                  </div>

                  <div style={{ padding:'16px' }}>
                    <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:700, fontSize:'16px', color:'#f7f6dd', marginBottom:'4px' }}>{album.title}</div>
                    <div style={{ fontSize:'11px', color:'rgba(247,246,221,0.25)', fontFamily:'Arial,Helvetica,sans-serif', marginBottom:'14px' }}>
                      Updated {new Date(album.updatedAt).toLocaleDateString()}
                    </div>
                    <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                      <a href={album.googlePhotosUrl} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'4px', background:'#f7f6dd', color:'#0A1128', textDecoration:'none', fontSize:'11px', fontWeight:800, fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", letterSpacing:'0.1em', textTransform:'uppercase' }}>
                        View Album ↗
                      </a>
                      {canManage && (
                        <button onClick={() => removePhotoAlbum(album.id)} style={{ padding:'8px 12px', borderRadius:'4px', border:'1px solid rgba(220,80,80,0.3)', background:'transparent', color:'rgba(220,80,80,0.6)', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif" }}>Remove</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Embedded Drive folder */}
            <div style={{ marginTop:'32px' }}>
              <div style={{ fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(247,246,221,0.3)', marginBottom:'12px' }}>Full Camp Folder</div>
              <div style={{ borderRadius:'8px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)' }}>
                <iframe src={DRIVE_EMBED_URL} title="Camp Photos" style={{ width:'100%', height:'480px', border:'none' }} allow="autoplay"/>
              </div>
              <a href={DRIVE_FOLDER_URL} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'6px', marginTop:'12px', color:'rgba(247,246,221,0.5)', fontSize:'12px', fontFamily:'Arial,Helvetica,sans-serif', textDecoration:'none' }}>
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
const primaryBtn: React.CSSProperties = { padding:'9px 18px', borderRadius:'4px', border:'none', background:'#f7f6dd', color:'#0A1128', fontSize:'11px', fontWeight:800, cursor:'pointer', fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", letterSpacing:'0.1em', textTransform:'uppercase' };
const ghostBtn: React.CSSProperties = { padding:'9px 14px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(247,246,221,0.5)', fontSize:'11px', fontWeight:700, cursor:'pointer', fontFamily:"'Arial Black','Arial Bold',Gadget,sans-serif", letterSpacing:'0.08em', textTransform:'uppercase' };
