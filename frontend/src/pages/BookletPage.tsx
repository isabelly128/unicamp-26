import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDevotionStore } from '../stores/devotionStore';
import type { CampDay, DaySession, LodgingInfo, FoodSpot } from '../stores/devotionStore';

type Section = 'packing' | 'day1' | 'day2' | 'day3' | 'day4' | 'vol' | 'lodging' | 'food';

const TYPE_COLORS: Record<string, string> = {
  session: '#D4E600', worship: '#a0c0a0', meal: '#c0a080',
  activity: '#8090c0', devotion: '#c09090', free: 'rgba(240,237,228,0.2)',
};

const CSS = `
  .bk-page { padding: 24px; max-width: 860px; }
  .bk-tabs { display: flex; gap: 6px; margin-bottom: 28px; overflow-x: auto; padding-bottom: 4px; }
  .bk-tabs::-webkit-scrollbar { display: none; }
  .bk-tab { flex-shrink: 0; padding: 9px 16px; border-radius: 100px; border: 1px solid; font-family: 'Barlow Condensed',sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; white-space: nowrap; }
  .bk-session { display: flex; gap: 14px; margin-bottom: 12px; }
  .bk-session-card { flex: 1; background: #111D3E; border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 13px 15px; }
  .bk-edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  .bk-food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 12px; }
  @media (max-width: 640px) {
    .bk-page { padding: 16px 14px; }
    .bk-edit-grid { grid-template-columns: 1fr; }
    .bk-food-grid { grid-template-columns: 1fr; }
    .bk-session { gap: 8px; }
  }
`;

const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: 'packing', label: 'Packing List',    icon: '🎒' },
  { key: 'day1',    label: 'Day 1',           icon: '1️⃣' },
  { key: 'day2',    label: 'Day 2',           icon: '2️⃣' },
  { key: 'day3',    label: 'Day 3',           icon: '3️⃣' },
  { key: 'day4',    label: 'Day 4',           icon: '4️⃣' },
  { key: 'vol',     label: 'Vol Dedication',  icon: '🙌' },
  { key: 'lodging', label: 'Lodging',         icon: '🏕️' },
  { key: 'food',    label: 'Food & HTHT',     icon: '🍜' },
];

// Map only the day sections to a schedule index
const DAY_INDEX: Record<string, number> = { day1: 0, day2: 1, day3: 2, day4: 3 };

const isDay = (s: Section): s is 'day1' | 'day2' | 'day3' | 'day4' =>
  ['day1', 'day2', 'day3', 'day4'].includes(s);

export const BookletPage: React.FC = () => {
  const { hasRole } = useAuthStore();
  const {
    packingListUrl, volDedicationUrl, schedule, lodging, foodSpots,
    setPackingListUrl, setVolDedicationUrl,
    updateSession, addSession, removeSession,
    setLodging, updateFoodSpot, setFoodSpots,
  } = useDevotionStore();

  const canEdit = hasRole(['administrator', 'comms']);

  const [section, setSection]             = useState<Section>('day1');
  const [editingSession, setEditing]      = useState<{ di: number; si: number } | null>(null);
  const [sessionDraft, setDraft]          = useState<Partial<DaySession>>({});
  const [addingSession, setAdding]        = useState(false);
  const [newSession, setNewSession]       = useState<DaySession>({ time: '', title: '', icon: '📌', type: 'activity' });
  const [editLodging, setEditLodging]     = useState(false);
  const [lodgingDraft, setLodgingDraft]   = useState<LodgingInfo>(lodging);
  const [editFood, setEditFood]           = useState<number | null>(null);
  const [foodDraft, setFoodDraft]         = useState<FoodSpot | null>(null);
  const [addingFood, setAddingFood]       = useState(false);
  const [newFood, setNewFood]             = useState<FoodSpot>({ name: '', type: 'meal', description: '', address: '', openHours: '' });
  const [pdfInput, setPdfInput]           = useState('');

  const currentDay: CampDay | null = isDay(section) ? schedule[DAY_INDEX[section]] : null;
  const currentDi: number          = isDay(section) ? DAY_INDEX[section] : 0;

  const saveSession = (di: number, si: number): void => {
    updateSession(di, si, sessionDraft);
    setEditing(null);
    setDraft({});
  };

  const doAddSession = (di: number): void => {
    if (!newSession.title) return;
    addSession(di, newSession);
    setNewSession({ time: '', title: '', icon: '📌', type: 'activity' });
    setAdding(false);
  };

  const saveLodging = (): void => { setLodging(lodgingDraft); setEditLodging(false); };

  const saveFoodSpot = (): void => {
    if (editFood !== null && foodDraft) { updateFoodSpot(editFood, foodDraft); setEditFood(null); setFoodDraft(null); }
  };

  const addFoodSpot = (): void => {
    if (!newFood.name) return;
    setFoodSpots([...foodSpots, newFood]);
    setNewFood({ name: '', type: 'meal', description: '', address: '', openHours: '' });
    setAddingFood(false);
  };

  const removeFoodSpot = (i: number): void =>
    setFoodSpots(foodSpots.filter((_: FoodSpot, idx: number) => idx !== i));

  return (
    <>
      <style>{CSS}</style>
      <div className="bk-page">

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#D4E600', marginBottom:'4px' }}>Camp</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:700, fontSize:'clamp(28px,6vw,40px)', color:'#F0EDE4', margin:'0 0 6px', lineHeight:1 }}>Booklet</h1>
          <p style={{ color:'rgba(240,237,228,0.4)', fontSize:'13px', margin:0, fontFamily:"'Barlow',sans-serif" }}>4 Days · 3 Nights · June 1–4, 2026</p>
        </div>

        {/* Tabs */}
        <div className="bk-tabs">
          {SECTIONS.map(({ key, label, icon }) => (
            <button key={key} onClick={() => setSection(key)} className="bk-tab" style={{
              borderColor: section === key ? '#D4E600' : 'rgba(255,255,255,0.08)',
              background:  section === key ? 'rgba(212,230,0,0.1)' : 'transparent',
              color:       section === key ? '#D4E600' : 'rgba(240,237,228,0.35)',
            }}>{icon} {label}</button>
          ))}
        </div>

        {/* ── PACKING LIST ── */}
        {section === 'packing' && (
          <div>
            <SectionHeader label="Packing List" />
            {canEdit && (
              <div style={{ marginBottom:'20px', display:'flex', gap:'10px', flexWrap:'wrap' }}>
                <input placeholder="PDF URL for packing list" value={pdfInput} onChange={(e) => setPdfInput(e.target.value)} style={{ ...inp, flex:1, minWidth:'200px' }}/>
                <button onClick={() => { setPackingListUrl(pdfInput); setPdfInput(''); }} style={primaryBtn}>Save URL</button>
              </div>
            )}
            {packingListUrl
              ? <iframe src={packingListUrl} title="Packing List" style={{ width:'100%', height:'520px', border:'none', borderRadius:'8px', background:'#000' }}/>
              : <EmptyState icon="🎒" title="No packing list uploaded" sub={canEdit ? 'Paste a PDF URL above.' : 'Check back soon!'} />
            }
          </div>
        )}

        {/* ── DAY SCHEDULE ── */}
        {isDay(section) && currentDay && (
          <div>
            {/* Day hero */}
            <div style={{ background:'linear-gradient(135deg,rgba(212,230,0,0.1),rgba(74,144,217,0.06))', border:'1px solid rgba(212,230,0,0.15)', borderRadius:'8px', padding:'24px 28px', marginBottom:'24px' }}>
              <div style={{ fontSize:'11px', letterSpacing:'0.15em', color:'rgba(212,230,0,0.6)', fontWeight:600, textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif", marginBottom:'6px' }}>{currentDay.date}</div>
              <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'28px', textTransform:'uppercase', color:'#F0EDE4', margin:'0 0 4px', letterSpacing:'-0.01em' }}>{currentDay.theme}</h2>
              <p style={{ color:'rgba(240,237,228,0.4)', fontSize:'13px', margin:0, fontFamily:"'Barlow',sans-serif", fontStyle:'italic' }}>Key Verse: {currentDay.verse}</p>
            </div>

            {/* Sessions */}
            {currentDay.sessions.map((sess: DaySession, si: number) => {
              const di = currentDi;
              const isEditingThis = editingSession?.di === di && editingSession?.si === si;
              return (
                <div key={si} className="bk-session">
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: TYPE_COLORS[sess.type] || '#D4E600', marginTop:'18px', flexShrink:0, border:'2px solid #0A1128' }}/>
                  <div style={{ minWidth:'60px', fontSize:'11px', color:'rgba(240,237,228,0.3)', paddingTop:'14px', fontFamily:"'Barlow',sans-serif" }}>{sess.time}</div>
                  <div className="bk-session-card" style={{ borderLeft:`3px solid ${TYPE_COLORS[sess.type] || 'transparent'}` }}>
                    {isEditingThis && canEdit ? (
                      <div>
                        <div className="bk-edit-grid">
                          <input value={sessionDraft.time ?? sess.time} onChange={(e) => setDraft((d: Partial<DaySession>) => ({ ...d, time: e.target.value }))} placeholder="Time" style={inp}/>
                          <input value={sessionDraft.title ?? sess.title} onChange={(e) => setDraft((d: Partial<DaySession>) => ({ ...d, title: e.target.value }))} placeholder="Title" style={inp}/>
                          <input value={sessionDraft.icon ?? sess.icon} onChange={(e) => setDraft((d: Partial<DaySession>) => ({ ...d, icon: e.target.value }))} placeholder="Icon" style={inp}/>
                          <select value={sessionDraft.type ?? sess.type} onChange={(e) => setDraft((d: Partial<DaySession>) => ({ ...d, type: e.target.value as DaySession['type'] }))} style={inp}>
                            {(['session','meal','activity','free','devotion','worship'] as DaySession['type'][]).map((t: DaySession['type']) => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <input value={sessionDraft.description ?? sess.description ?? ''} onChange={(e) => setDraft((d: Partial<DaySession>) => ({ ...d, description: e.target.value }))} placeholder="Description (optional)" style={{ ...inp, gridColumn:'1 / -1' }}/>
                        </div>
                        <div style={{ display:'flex', gap:'8px' }}>
                          <button onClick={() => saveSession(di, si)} style={primaryBtn}>Save</button>
                          <button onClick={() => { setEditing(null); setDraft({}); }} style={ghostBtn}>Cancel</button>
                          <button onClick={() => { removeSession(di, si); setEditing(null); }} style={dangerBtn}>Delete</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'10px' }}>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom: sess.description ? '4px' : 0 }}>
                            <span style={{ fontSize:'16px' }}>{sess.icon}</span>
                            <span style={{ fontSize:'14px', fontWeight:600, color:'#F0EDE4', fontFamily:"'Barlow Condensed',sans-serif" }}>{sess.title}</span>
                          </div>
                          {sess.description && <p style={{ fontSize:'12px', color:'rgba(240,237,228,0.35)', margin:'0 0 0 24px', fontFamily:"'Barlow',sans-serif" }}>{sess.description}</p>}
                        </div>
                        {canEdit && (
                          <button onClick={() => { setEditing({ di, si }); setDraft({}); }} style={{ ...ghostBtn, flexShrink:0, padding:'4px 10px', fontSize:'10px' }}>Edit</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add session */}
            {canEdit && (
              <div style={{ marginTop:'16px' }}>
                {addingSession ? (
                  <div style={{ background:'#111D3E', border:'1px solid rgba(212,230,0,0.2)', borderRadius:'8px', padding:'16px' }}>
                    <div className="bk-edit-grid">
                      <input value={newSession.time}  onChange={(e) => setNewSession((s: DaySession) => ({ ...s, time:  e.target.value }))} placeholder="Time (e.g. 3:00 PM)" style={inp}/>
                      <input value={newSession.title} onChange={(e) => setNewSession((s: DaySession) => ({ ...s, title: e.target.value }))} placeholder="Title" style={inp}/>
                      <input value={newSession.icon}  onChange={(e) => setNewSession((s: DaySession) => ({ ...s, icon:  e.target.value }))} placeholder="Icon" style={inp}/>
                      <select value={newSession.type} onChange={(e) => setNewSession((s: DaySession) => ({ ...s, type:  e.target.value as DaySession['type'] }))} style={inp}>
                        {(['session','meal','activity','free','devotion','worship'] as DaySession['type'][]).map((t: DaySession['type']) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input value={newSession.description ?? ''} onChange={(e) => setNewSession((s: DaySession) => ({ ...s, description: e.target.value }))} placeholder="Description (optional)" style={{ ...inp, gridColumn:'1 / -1' }}/>
                    </div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button onClick={() => doAddSession(currentDi)} style={primaryBtn}>Add</button>
                      <button onClick={() => setAdding(false)} style={ghostBtn}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAdding(true)} style={{ ...ghostBtn, width:'100%', padding:'12px', textAlign:'center' }}>+ Add Session</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── VOL DEDICATION ── */}
        {section === 'vol' && (
          <div>
            <SectionHeader label="Volunteer Dedication" />
            {canEdit && (
              <div style={{ marginBottom:'20px', display:'flex', gap:'10px', flexWrap:'wrap' }}>
                <input placeholder="PDF URL for vol dedication" value={pdfInput} onChange={(e) => setPdfInput(e.target.value)} style={{ ...inp, flex:1, minWidth:'200px' }}/>
                <button onClick={() => { setVolDedicationUrl(pdfInput); setPdfInput(''); }} style={primaryBtn}>Save URL</button>
              </div>
            )}
            {volDedicationUrl
              ? <iframe src={volDedicationUrl} title="Vol Dedication" style={{ width:'100%', height:'520px', border:'none', borderRadius:'8px', background:'#000' }}/>
              : <EmptyState icon="🙌" title="No vol dedication uploaded" sub={canEdit ? 'Paste a PDF URL above.' : 'Check back soon!'} />
            }
          </div>
        )}

        {/* ── LODGING & DIRECTIONS ── */}
        {section === 'lodging' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
              <SectionHeader label="Lodging & Directions" />
              {canEdit && !editLodging && <button onClick={() => { setEditLodging(true); setLodgingDraft({ ...lodging }); }} style={ghostBtn}>Edit</button>}
            </div>

            {editLodging && canEdit ? (
              <div style={{ background:'#111D3E', border:'1px solid rgba(212,230,0,0.2)', borderRadius:'8px', padding:'20px', marginBottom:'24px' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
                  {([
                    ['venueName',  'Venue Name'],
                    ['address',    'Address'],
                    ['checkIn',    'Check-in time'],
                    ['checkOut',   'Check-out time'],
                    ['mapsUrl',    'Google Maps URL'],
                  ] as [keyof LodgingInfo, string][]).map(([k, label]: [keyof LodgingInfo, string]) => (
                    <div key={String(k)}>
                      <div style={{ fontSize:'10px', color:'rgba(240,237,228,0.35)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'4px' }}>{label}</div>
                      <input value={lodgingDraft[k] as string} onChange={(e) => setLodgingDraft((d: LodgingInfo) => ({ ...d, [k]: e.target.value }))} style={inp}/>
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize:'10px', color:'rgba(240,237,228,0.35)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'4px' }}>Directions</div>
                    <textarea value={lodgingDraft.directions} onChange={(e) => setLodgingDraft((d: LodgingInfo) => ({ ...d, directions: e.target.value }))} rows={4} style={{ ...inp, resize:'vertical', fontFamily:"'Barlow',sans-serif" }}/>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={saveLodging} style={primaryBtn}>Save</button>
                  <button onClick={() => setEditLodging(false)} style={ghostBtn}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {([
                  { icon:'🏕️', label:'Venue',     value: lodging.venueName },
                  { icon:'📍', label:'Address',   value: lodging.address },
                  { icon:'✅', label:'Check-in',  value: lodging.checkIn },
                  { icon:'🚪', label:'Check-out', value: lodging.checkOut },
                ] as { icon:string; label:string; value:string }[]).map(({ icon, label, value }: { icon:string; label:string; value:string }) => (
                  <InfoRow key={label} icon={icon} label={label} value={value} />
                ))}
                <div style={{ background:'#111D3E', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'16px' }}>
                  <div style={{ fontSize:'10px', color:'rgba(212,230,0,0.6)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'8px' }}>🗺️ Directions</div>
                  <p style={{ fontSize:'14px', color:'rgba(240,237,228,0.65)', fontFamily:"'Barlow',sans-serif", lineHeight:1.7, margin:0 }}>{lodging.directions}</p>
                </div>
                {lodging.mapsUrl && (
                  <a href={lodging.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'10px 18px', borderRadius:'4px', background:'#D4E600', color:'#0A1128', textDecoration:'none', fontSize:'12px', fontWeight:800, width:'fit-content', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase' }}>Open in Maps ↗</a>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── FOOD & HTHT ── */}
        {section === 'food' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px', flexWrap:'wrap', gap:'10px' }}>
              <SectionHeader label="Food & HTHT Spots" />
              {canEdit && <button onClick={() => setAddingFood(true)} style={ghostBtn}>+ Add Spot</button>}
            </div>

            {addingFood && canEdit && (
              <div style={{ background:'#111D3E', border:'1px solid rgba(212,230,0,0.2)', borderRadius:'8px', padding:'16px', marginBottom:'20px' }}>
                <div className="bk-edit-grid">
                  <input value={newFood.name}        onChange={(e) => setNewFood((f: FoodSpot) => ({ ...f, name:        e.target.value }))} placeholder="Name"          style={inp}/>
                  <select value={newFood.type}       onChange={(e) => setNewFood((f: FoodSpot) => ({ ...f, type:        e.target.value as FoodSpot['type'] }))} style={inp}>
                    <option value="meal">Meal</option>
                    <option value="supper">Supper</option>
                    <option value="htht">HTHT Spot</option>
                  </select>
                  <input value={newFood.address}     onChange={(e) => setNewFood((f: FoodSpot) => ({ ...f, address:     e.target.value }))} placeholder="Address"       style={inp}/>
                  <input value={newFood.openHours}   onChange={(e) => setNewFood((f: FoodSpot) => ({ ...f, openHours:   e.target.value }))} placeholder="Opening hours" style={inp}/>
                  <input value={newFood.description} onChange={(e) => setNewFood((f: FoodSpot) => ({ ...f, description: e.target.value }))} placeholder="Description"   style={{ ...inp, gridColumn:'1 / -1' }}/>
                </div>
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={addFoodSpot} style={primaryBtn}>Add</button>
                  <button onClick={() => setAddingFood(false)} style={ghostBtn}>Cancel</button>
                </div>
              </div>
            )}

            {(['meal','supper','htht'] as FoodSpot['type'][]).map((type: FoodSpot['type']) => {
              const spots = foodSpots.filter((f: FoodSpot) => f.type === type);
              const labels: Record<FoodSpot['type'], string> = { meal:'🍽️ Meals', supper:'🌙 Supper', htht:'💬 HTHT Spots' };
              return (
                <div key={type} style={{ marginBottom:'28px' }}>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'12px', letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(212,230,0,0.6)', marginBottom:'12px' }}>{labels[type]}</div>
                  <div className="bk-food-grid">
                    {spots.map((spot: FoodSpot, idx: number) => {
                      const globalIdx = foodSpots.indexOf(spot);
                      const isEditingThis = editFood === globalIdx;
                      return (
                        <div key={idx} style={{ background:'#111D3E', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'16px' }}>
                          {isEditingThis && foodDraft ? (
                            <div>
                              <input value={foodDraft.name}        onChange={(e) => setFoodDraft((f: FoodSpot | null) => f ? { ...f, name:        e.target.value } : f)} placeholder="Name"          style={{ ...inp, marginBottom:'8px' }}/>
                              <input value={foodDraft.description} onChange={(e) => setFoodDraft((f: FoodSpot | null) => f ? { ...f, description: e.target.value } : f)} placeholder="Description"   style={{ ...inp, marginBottom:'8px' }}/>
                              <input value={foodDraft.address}     onChange={(e) => setFoodDraft((f: FoodSpot | null) => f ? { ...f, address:     e.target.value } : f)} placeholder="Address"       style={{ ...inp, marginBottom:'8px' }}/>
                              <input value={foodDraft.openHours}   onChange={(e) => setFoodDraft((f: FoodSpot | null) => f ? { ...f, openHours:   e.target.value } : f)} placeholder="Hours"         style={{ ...inp, marginBottom:'10px' }}/>
                              <div style={{ display:'flex', gap:'6px' }}>
                                <button onClick={saveFoodSpot} style={primaryBtn}>Save</button>
                                <button onClick={() => { setEditFood(null); setFoodDraft(null); }} style={ghostBtn}>Cancel</button>
                                <button onClick={() => removeFoodSpot(globalIdx)} style={dangerBtn}>Delete</button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:'16px', color:'#F0EDE4', marginBottom:'4px' }}>{spot.name}</div>
                              <div style={{ fontSize:'12px', color:'rgba(240,237,228,0.45)', fontFamily:"'Barlow',sans-serif", marginBottom:'6px' }}>{spot.description}</div>
                              <div style={{ fontSize:'11px', color:'rgba(240,237,228,0.25)', fontFamily:"'Barlow',sans-serif" }}>📍 {spot.address}</div>
                              <div style={{ fontSize:'11px', color:'rgba(240,237,228,0.25)', fontFamily:"'Barlow',sans-serif", marginTop:'2px' }}>🕐 {spot.openHours}</div>
                              {canEdit && (
                                <button onClick={() => { setEditFood(globalIdx); setFoodDraft({ ...spot }); }} style={{ ...ghostBtn, marginTop:'10px', padding:'5px 12px', fontSize:'10px' }}>Edit</button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {spots.length === 0 && <p style={{ color:'rgba(240,237,228,0.2)', fontSize:'13px', fontFamily:"'Barlow',sans-serif" }}>No spots listed yet.</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'22px', textTransform:'uppercase', color:'#F0EDE4', letterSpacing:'-0.01em', marginBottom:'20px' }}>{label}</div>
);
const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div style={{ background:'#111D3E', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'14px 16px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
    <span style={{ fontSize:'18px', flexShrink:0 }}>{icon}</span>
    <div>
      <div style={{ fontSize:'10px', color:'rgba(212,230,0,0.6)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'3px' }}>{label}</div>
      <div style={{ fontSize:'14px', color:'rgba(240,237,228,0.7)', fontFamily:"'Barlow',sans-serif" }}>{value}</div>
    </div>
  </div>
);
const EmptyState: React.FC<{ icon: string; title: string; sub: string }> = ({ icon, title, sub }) => (
  <div style={{ textAlign:'center', padding:'56px 24px', background:'#111D3E', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ fontSize:'40px', marginBottom:'12px' }}>{icon}</div>
    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'18px', textTransform:'uppercase', color:'#F0EDE4', marginBottom:'6px' }}>{title}</div>
    <p style={{ color:'rgba(240,237,228,0.3)', fontSize:'13px', fontFamily:"'Barlow',sans-serif", margin:0 }}>{sub}</p>
  </div>
);

const inp: React.CSSProperties = {
  padding:'11px 13px', borderRadius:'4px',
  border:'1px solid rgba(255,255,255,0.08)',
  background:'rgba(255,255,255,0.04)',
  color:'#F0EDE4', fontSize:'13px', outline:'none',
  width:'100%', boxSizing:'border-box',
};
const primaryBtn: React.CSSProperties = {
  padding:'9px 18px', borderRadius:'4px', border:'none',
  background:'#D4E600', color:'#0A1128', fontSize:'11px', fontWeight:800, cursor:'pointer',
  fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.1em', textTransform:'uppercase',
};
const ghostBtn: React.CSSProperties = {
  padding:'9px 14px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.1)',
  background:'transparent', color:'rgba(240,237,228,0.5)', fontSize:'11px', fontWeight:700, cursor:'pointer',
  fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'0.08em', textTransform:'uppercase',
};
const dangerBtn: React.CSSProperties = {
  padding:'9px 12px', borderRadius:'4px', border:'1px solid rgba(220,80,80,0.3)',
  background:'transparent', color:'rgba(220,80,80,0.6)', fontSize:'11px', fontWeight:700, cursor:'pointer',
  fontFamily:"'Barlow Condensed',sans-serif",
};