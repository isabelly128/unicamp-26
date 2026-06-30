import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  fetchCampContent,
  saveCampContent,
  type CampContentUpdate,
} from '../services/campContentApi';
import {
  createConviction,
  createPrayerRequest,
  createThanksgiving,
  deleteConviction,
  fetchCommunityWall,
  updateConvictionApproval,
  updatePrayerRequestStatus,
} from '../services/communityWallApi';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface PrayerRequest {
  id: string; content: string; submittedBy: string;
  submittedAt: string; isAnonymous: boolean; status: 'pending' | 'prayed';
  name?: string;
}
export interface Conviction {
  id: string; content: string; submittedAt: string;
  approved: boolean; approvedBy?: string; name?: string;
}
export interface Thanksgiving {
  id: string; content: string; submittedBy: string;
  submittedAt: string; isAnonymous: boolean; name?: string;
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
  remoteStatus:   'idle' | 'loading' | 'synced' | 'error';
  remoteError:    string | null;
  lastSyncedAt:   string | null;

  loadCommunityContent: () => Promise<void>;
  syncCommunityContent: () => Promise<void>;
  submitPrayerRequest: (content: string, userId: string, name?: string) => void;
  markPrayed:          (id: string) => void;
  submitConviction:    (content: string, name?: string) => void;
  approveConviction:   (id: string, approvedBy: string) => void;
  rejectConviction:    (id: string) => void;
  submitThanksgiving:  (content: string, userId: string, name?: string) => void;
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

const contentFromState = (state: CommunityState): CampContentUpdate => ({
  photoAlbums: state.photoAlbums,
  photosPublic: state.photosPublic,
  heroBgUrl: state.heroBgUrl,
  cardImages: state.cardImages,
  sectionPhotos: state.sectionPhotos,
});

const withDefaults = (content: CampContentUpdate) => ({
  photoAlbums: content.photoAlbums ?? INITIAL_ALBUMS,
  photosPublic: content.photosPublic ?? false,
  heroBgUrl: content.heroBgUrl ?? '',
  cardImages: content.cardImages ?? {},
  sectionPhotos: content.sectionPhotos ?? {},
});

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unable to sync camp photos';

const makeId = (prefix: string): string => {
  const randomId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${randomId}`;
};

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => {
      const syncAfterSet = (): void => {
        void get().syncCommunityContent();
      };
      const persistWallChange = (operation: () => Promise<void>): void => {
        void operation()
          .then(() => {
            set({
              remoteStatus: 'synced',
              remoteError: null,
              lastSyncedAt: new Date().toISOString(),
            });
          })
          .catch((error) => {
            set({
              remoteStatus: 'error',
              remoteError: errorMessage(error),
            });
          });
      };

      return ({
      prayerRequests: [],
      convictions:    [],
      thanksgivings:  [],
      photoAlbums:    INITIAL_ALBUMS,
      photosPublic:   false,
      heroBgUrl:      '',
      cardImages:     {},
      sectionPhotos:  {},
      remoteStatus:   'idle',
      remoteError:    null,
      lastSyncedAt:   null,

      loadCommunityContent: async (): Promise<void> => {
        if (get().remoteStatus === 'loading') return;

        set({ remoteStatus: 'loading', remoteError: null });

        try {
          const content = await fetchCampContent();
          let wallContent: Pick<CommunityState, 'prayerRequests' | 'convictions' | 'thanksgivings'> | null = null;
          let wallError: string | null = null;

          try {
            wallContent = await fetchCommunityWall();
          } catch (error) {
            wallError = errorMessage(error);
          }

          set({
            ...(content ? withDefaults(content) : {}),
            ...(wallContent ?? {}),
            remoteStatus: wallError ? 'error' : 'synced',
            remoteError: wallError,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch (error) {
          set({
            remoteStatus: 'error',
            remoteError: errorMessage(error),
          });
        }
      },

      syncCommunityContent: async (): Promise<void> => {
        try {
          await saveCampContent(contentFromState(get()));
          set({
            remoteStatus: 'synced',
            remoteError: null,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch (error) {
          set({
            remoteStatus: 'error',
            remoteError: errorMessage(error),
          });
        }
      },

      submitPrayerRequest: (content: string, userId: string, name?: string) => {
        const submittedName = name?.trim() || undefined;
        const req: PrayerRequest = {
          id: makeId('pr'), content, submittedBy: userId,
          submittedAt: new Date().toISOString(), isAnonymous: !submittedName, status: 'pending',
          name: submittedName,
        };
        set((s: CommunityState) => ({
          prayerRequests: [req, ...s.prayerRequests],
          remoteStatus: 'loading',
          remoteError: null,
        }));
        persistWallChange(() => createPrayerRequest(req));
      },

      markPrayed: (id: string) =>
        { set((s: CommunityState) => ({
          prayerRequests: s.prayerRequests.map((r: PrayerRequest) =>
            r.id === id ? { ...r, status: 'prayed' as const } : r),
          remoteStatus: 'loading',
          remoteError: null,
        })); persistWallChange(() => updatePrayerRequestStatus(id, 'prayed')); },

      submitConviction: (content: string, name?: string) => {
        const submittedName = name?.trim() || undefined;
        const c: Conviction = {
          id: makeId('c'), content,
          submittedAt: new Date().toISOString(), approved: false,
          name: submittedName,
        };
        set((s: CommunityState) => ({
          convictions: [c, ...s.convictions],
          remoteStatus: 'loading',
          remoteError: null,
        }));
        persistWallChange(() => createConviction(c));
      },

      approveConviction: (id: string, approvedBy: string) =>
        { set((s: CommunityState) => ({
          convictions: s.convictions.map((c: Conviction) =>
            c.id === id ? { ...c, approved: true, approvedBy } : c),
          remoteStatus: 'loading',
          remoteError: null,
        })); persistWallChange(() => updateConvictionApproval(id, approvedBy)); },

      rejectConviction: (id: string) =>
        { set((s: CommunityState) => ({
          convictions: s.convictions.filter((c: Conviction) => c.id !== id),
          remoteStatus: 'loading',
          remoteError: null,
        })); persistWallChange(() => deleteConviction(id)); },

      submitThanksgiving: (content: string, userId: string, name?: string) => {
        const submittedName = name?.trim() || undefined;
        const t: Thanksgiving = {
          id: makeId('t'), content, submittedBy: userId,
          submittedAt: new Date().toISOString(), isAnonymous: !submittedName,
          name: submittedName,
        };
        set((s: CommunityState) => ({
          thanksgivings: [t, ...s.thanksgivings],
          remoteStatus: 'loading',
          remoteError: null,
        }));
        persistWallChange(() => createThanksgiving(t));
      },

      addPhotoAlbum: (album: Omit<PhotoAlbum, 'id'>) => {
        const a: PhotoAlbum = { ...album, id: `a${Date.now()}` };
        set((s: CommunityState) => ({ photoAlbums: [...s.photoAlbums, a] }));
        syncAfterSet();
      },

      updatePhotoAlbumCover: (id: string, coverUrl: string) =>
        { set((s: CommunityState) => ({
          photoAlbums: s.photoAlbums.map((a: PhotoAlbum) =>
            a.id === id ? { ...a, coverPhotoUrl: coverUrl, updatedAt: new Date().toISOString() } : a
          ),
        })); syncAfterSet(); },
      removePhotoAlbum: (id: string) =>
        { set((s: CommunityState) => ({
          photoAlbums: s.photoAlbums.filter((a: PhotoAlbum) => a.id !== id),
        })); syncAfterSet(); },

      setPhotosPublic: (value: boolean) => {
        set({ photosPublic: value });
        syncAfterSet();
      },
      setHeroBgUrl: (url: string) => {
        set({ heroBgUrl: url });
        syncAfterSet();
      },

      setCardImage: (cardPath: string, url: string) =>
        { set((s: CommunityState) => ({
          cardImages: { ...s.cardImages, [cardPath]: url },
        })); syncAfterSet(); },

      removeCardImage: (cardPath: string) =>
        { set((s: CommunityState) => {
          const updated = { ...s.cardImages };
          delete updated[cardPath];
          return { cardImages: updated };
        }); syncAfterSet(); },

      addSectionPhoto: (sectionKey: string, url: string) =>
        { set((s: CommunityState) => ({
          sectionPhotos: {
            ...s.sectionPhotos,
            [sectionKey]: [...(s.sectionPhotos[sectionKey] ?? []), url],
          },
        })); syncAfterSet(); },

      removeSectionPhoto: (sectionKey: string, index: number) =>
        { set((s: CommunityState) => ({
          sectionPhotos: {
            ...s.sectionPhotos,
            [sectionKey]: (s.sectionPhotos[sectionKey] ?? []).filter(
              (_: string, i: number) => i !== index
            ),
          },
        })); syncAfterSet(); },
    });
    },
    {
      name: 'community-store',
      partialize: (state) => ({
        prayerRequests: state.prayerRequests,
        convictions: state.convictions,
        thanksgivings: state.thanksgivings,
        photoAlbums: state.photoAlbums,
        photosPublic: state.photosPublic,
        heroBgUrl: state.heroBgUrl,
        cardImages: state.cardImages,
        sectionPhotos: state.sectionPhotos,
      }),
    }
  )
);
