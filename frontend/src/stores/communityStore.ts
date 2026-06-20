import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PrayerRequest {
  id: string; content: string; submittedBy: string;
  submittedAt: string; isAnonymous: boolean; status: 'pending' | 'prayed';
}
export interface Conviction {
  id: string; content: string; submittedAt: string;
  approved: boolean; approvedBy?: string;
}
export interface Thanksgiving {
  id: string; content: string; submittedBy: string;
  submittedAt: string; isAnonymous: boolean;
}
export interface PhotoAlbum {
  id: string; title: string; googlePhotosUrl: string;
  coverPhotoUrl: string; updatedAt: string;
}

// Per-section card background images on the HomePage
// Keys match the `path` values in FEATURE_CARDS
export type CardImageMap = Record<string, string>;

// Photos attached to lodging/food sections in the Booklet
// Key format: "lodging" | "food-meal" | "food-supper" | "food-htht"
export type SectionPhotoMap = Record<string, string[]>;

// ── State ─────────────────────────────────────────────────────────────────────
interface CommunityState {
  prayerRequests: PrayerRequest[];
  convictions:    Conviction[];
  thanksgivings:  Thanksgiving[];
  photoAlbums:    PhotoAlbum[];
  photosPublic:   boolean;
  heroBgUrl:      string;
  cardImages:     CardImageMap;      // homepage card backgrounds
  sectionPhotos:  SectionPhotoMap;   // booklet section photo arrays

  submitPrayerRequest: (content: string, userId: string, isAnonymous: boolean) => void;
  markPrayed:          (id: string) => void;
  submitConviction:    (content: string) => void;
  approveConviction:   (id: string, approvedBy: string) => void;
  rejectConviction:    (id: string) => void;
  submitThanksgiving:  (content: string, userId: string, isAnonymous: boolean) => void;
  addPhotoAlbum:       (album: Omit<PhotoAlbum, 'id'>) => void;
  removePhotoAlbum:      (id: string) => void;
  updatePhotoAlbumCover: (id: string, coverUrl: string) => void;
  setPhotosPublic:     (value: boolean) => void;
  setHeroBgUrl:        (url: string) => void;
  setCardImage:        (cardPath: string, url: string) => void;
  removeCardImage:     (cardPath: string) => void;
  addSectionPhoto:     (sectionKey: string, url: string) => void;
  removeSectionPhoto:  (sectionKey: string, index: number) => void;
}

const INITIAL_ALBUMS: PhotoAlbum[] = [
  {
    id: 'a1', title: 'Camp 2026 — All Photos',
    googlePhotosUrl: 'https://drive.google.com/drive/folders/1YKE5dDtrgkBiMLjIwsumpuZuHXICPjrC',
    coverPhotoUrl: '', updatedAt: new Date().toISOString(),
  },
];

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      prayerRequests: [],
      convictions:    [],
      thanksgivings:  [],
      photoAlbums:    INITIAL_ALBUMS,
      photosPublic:   false,
      heroBgUrl:      '',
      cardImages:     {},
      sectionPhotos:  {},

      submitPrayerRequest: (content: string, userId: string, isAnonymous: boolean) => {
        const req: PrayerRequest = {
          id: `pr${Date.now()}`, content, submittedBy: userId,
          submittedAt: new Date().toISOString(), isAnonymous, status: 'pending',
        };
        set((s: CommunityState) => ({ prayerRequests: [...s.prayerRequests, req] }));
      },

      markPrayed: (id: string) =>
        set((s: CommunityState) => ({
          prayerRequests: s.prayerRequests.map((r: PrayerRequest) =>
            r.id === id ? { ...r, status: 'prayed' as const } : r),
        })),

      submitConviction: (content: string) => {
        const c: Conviction = {
          id: `c${Date.now()}`, content,
          submittedAt: new Date().toISOString(), approved: false,
        };
        set((s: CommunityState) => ({ convictions: [...s.convictions, c] }));
      },

      approveConviction: (id: string, approvedBy: string) =>
        set((s: CommunityState) => ({
          convictions: s.convictions.map((c: Conviction) =>
            c.id === id ? { ...c, approved: true, approvedBy } : c),
        })),

      rejectConviction: (id: string) =>
        set((s: CommunityState) => ({
          convictions: s.convictions.filter((c: Conviction) => c.id !== id),
        })),

      submitThanksgiving: (content: string, userId: string, isAnonymous: boolean) => {
        const t: Thanksgiving = {
          id: `t${Date.now()}`, content, submittedBy: userId,
          submittedAt: new Date().toISOString(), isAnonymous,
        };
        set((s: CommunityState) => ({ thanksgivings: [...s.thanksgivings, t] }));
      },

      addPhotoAlbum: (album: Omit<PhotoAlbum, 'id'>) => {
        const a: PhotoAlbum = { ...album, id: `a${Date.now()}` };
        set((s: CommunityState) => ({ photoAlbums: [...s.photoAlbums, a] }));
      },

      updatePhotoAlbumCover: (id: string, coverUrl: string) =>
        set((s: CommunityState) => ({
          photoAlbums: s.photoAlbums.map((a: PhotoAlbum) => a.id === id ? { ...a, coverPhotoUrl: coverUrl } : a),
        })),
      removePhotoAlbum: (id: string) =>
        set((s: CommunityState) => ({
          photoAlbums: s.photoAlbums.filter((a: PhotoAlbum) => a.id !== id),
        })),

      setPhotosPublic: (value: boolean) => set({ photosPublic: value }),
      setHeroBgUrl:    (url: string)    => set({ heroBgUrl: url }),

      setCardImage: (cardPath: string, url: string) =>
        set((s: CommunityState) => ({
          cardImages: { ...s.cardImages, [cardPath]: url },
        })),

      removeCardImage: (cardPath: string) =>
        set((s: CommunityState) => {
          const updated = { ...s.cardImages };
          delete updated[cardPath];
          return { cardImages: updated };
        }),

      addSectionPhoto: (sectionKey: string, url: string) =>
        set((s: CommunityState) => ({
          sectionPhotos: {
            ...s.sectionPhotos,
            [sectionKey]: [...(s.sectionPhotos[sectionKey] ?? []), url],
          },
        })),

      removeSectionPhoto: (sectionKey: string, index: number) =>
        set((s: CommunityState) => ({
          sectionPhotos: {
            ...s.sectionPhotos,
            [sectionKey]: (s.sectionPhotos[sectionKey] ?? []).filter(
              (_: string, i: number) => i !== index
            ),
          },
        })),
    }),
    { name: 'community-store' }
  )
);