import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PrayerRequest, Conviction, Thanksgiving, Blessing, PhotoAlbum } from '../types';

interface CommunityState {
  prayerRequests: PrayerRequest[];
  convictions: Conviction[];
  thanksgivings: Thanksgiving[];
  blessings: Blessing[];
  photoAlbums: PhotoAlbum[];
  todayBlessingIndex: number;
  submitPrayerRequest: (content: string, userId: string, isAnonymous: boolean) => void;
  markPrayed: (id: string) => void;
  submitConviction: (content: string) => void;
  approveConviction: (id: string, approvedBy: string) => void;
  rejectConviction: (id: string) => void;
  submitThanksgiving: (content: string, userId: string, isAnonymous: boolean) => void;
  getTodayBlessing: () => Blessing;
  nextBlessing: () => void;
  addPhotoAlbum: (album: Omit<PhotoAlbum, 'id'>) => void;
}

const BLESSINGS: Blessing[] = [
  { id: 'b1', prompt: 'Write a note of encouragement to someone you have been praying for.', day: 1 },
  { id: 'b2', prompt: 'Tell someone one thing you genuinely appreciate about them.', day: 1 },
  { id: 'b3', prompt: 'Share a Bible verse that has encouraged you recently.', day: 2 },
  { id: 'b4', prompt: 'Pray silently for the person sitting next to you right now.', day: 2 },
  { id: 'b5', prompt: 'Write a short prayer of blessing for your family back home.', day: 3 },
  { id: 'b6', prompt: 'Tell a leader one way they have impacted your faith journey.', day: 3 },
  { id: 'b7', prompt: 'Share one thing you are believing God for this season.', day: 4 },
  { id: 'b8', prompt: 'Write down a promise of God that you are holding onto.', day: 4 },
  { id: 'b9', prompt: 'Bless someone by offering to pray for them right now.', day: 1 },
  { id: 'b10', prompt: 'Send an encouraging message to someone who could not make camp.', day: 2 },
];

const INITIAL_ALBUMS: PhotoAlbum[] = [
  {
    id: 'a1',
    title: 'Camp 2024 — Day 1 Highlights',
    googlePhotosUrl: 'https://photos.app.goo.gl/your-album-id-here',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'a2',
    title: 'Worship & Sessions',
    googlePhotosUrl: 'https://photos.app.goo.gl/your-album-id-2',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800',
    updatedAt: new Date().toISOString(),
  },
];

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      prayerRequests: [],
      convictions: [],
      thanksgivings: [],
      blessings: BLESSINGS,
      photoAlbums: INITIAL_ALBUMS,
      todayBlessingIndex: 0,

      submitPrayerRequest: (content: string, userId: string, isAnonymous: boolean): void => {
        const request: PrayerRequest = {
          id: `pr${Date.now()}`,
          content,
          submittedBy: userId,
          submittedAt: new Date().toISOString(),
          isAnonymous,
          status: 'pending',
        };
        set((state: CommunityState) => ({
          prayerRequests: [...state.prayerRequests, request],
        }));
      },

      markPrayed: (id: string): void => {
        set((state: CommunityState) => ({
          prayerRequests: state.prayerRequests.map((r: PrayerRequest) =>
            r.id === id ? { ...r, status: 'prayed' as const } : r
          ),
        }));
      },

      submitConviction: (content: string): void => {
        const conviction: Conviction = {
          id: `c${Date.now()}`,
          content,
          submittedAt: new Date().toISOString(),
          approved: false,
        };
        set((state: CommunityState) => ({
          convictions: [...state.convictions, conviction],
        }));
      },

      approveConviction: (id: string, approvedBy: string): void => {
        set((state: CommunityState) => ({
          convictions: state.convictions.map((c: Conviction) =>
            c.id === id ? { ...c, approved: true, approvedBy } : c
          ),
        }));
      },

      rejectConviction: (id: string): void => {
        set((state: CommunityState) => ({
          convictions: state.convictions.filter((c: Conviction) => c.id !== id),
        }));
      },

      submitThanksgiving: (content: string, userId: string, isAnonymous: boolean): void => {
        const entry: Thanksgiving = {
          id: `t${Date.now()}`,
          content,
          submittedBy: userId,
          submittedAt: new Date().toISOString(),
          isAnonymous,
        };
        set((state: CommunityState) => ({
          thanksgivings: [...state.thanksgivings, entry],
        }));
      },

      getTodayBlessing: (): Blessing => {
        const { blessings, todayBlessingIndex } = get();
        return blessings[todayBlessingIndex % blessings.length];
      },

      nextBlessing: (): void => {
        set((state: CommunityState) => ({
          todayBlessingIndex: (state.todayBlessingIndex + 1) % state.blessings.length,
        }));
      },

      addPhotoAlbum: (album: Omit<PhotoAlbum, 'id'>): void => {
        const newAlbum: PhotoAlbum = { ...album, id: `a${Date.now()}` };
        set((state: CommunityState) => ({
          photoAlbums: [...state.photoAlbums, newAlbum],
        }));
      },
    }),
    { name: 'community-store' }
  )
);
