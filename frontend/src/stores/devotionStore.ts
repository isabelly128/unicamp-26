import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Devotion, Reflection, SermonNote } from '../types';

interface DevotionState {
  devotions: Devotion[];
  reflections: Reflection[];
  sermonNotes: SermonNote[];
  addDevotion: (devotion: Omit<Devotion, 'id' | 'uploadedAt'>) => void;
  saveReflection: (devotionId: string, userId: string, content: string) => void;
  getReflection: (devotionId: string, userId: string) => Reflection | undefined;
  addSermonNote: (note: Omit<SermonNote, 'id' | 'uploadedAt'>) => void;
}

const INITIAL_DEVOTIONS: Devotion[] = [
  {
    id: 'pre1',
    title: 'Pre-Camp Devotion — Prepare Your Heart',
    day: 0,
    phase: 'pre',
    pdfUrl: 'https://example.com/devotion-pre.pdf',
    uploadedAt: '2024-05-28T08:00:00Z',
    uploadedBy: 'Sarah Tan',
  },
  {
    id: 'd1',
    title: 'Day 1 — Encountering God',
    day: 1,
    phase: 'during',
    pdfUrl: 'https://example.com/devotion-day1.pdf',
    uploadedAt: '2024-06-01T08:00:00Z',
    uploadedBy: 'Sarah Tan',
  },
  {
    id: 'd2',
    title: 'Day 2 — Walking in Faith',
    day: 2,
    phase: 'during',
    pdfUrl: 'https://example.com/devotion-day2.pdf',
    uploadedAt: '2024-06-02T08:00:00Z',
    uploadedBy: 'Sarah Tan',
  },
  {
    id: 'd3',
    title: 'Day 3 — Community & Calling',
    day: 3,
    phase: 'during',
    pdfUrl: 'https://example.com/devotion-day3.pdf',
    uploadedAt: '2024-06-03T08:00:00Z',
    uploadedBy: 'Sarah Tan',
  },
  {
    id: 'd4',
    title: 'Day 4 — Sent & Commissioned',
    day: 4,
    phase: 'during',
    pdfUrl: 'https://example.com/devotion-day4.pdf',
    uploadedAt: '2024-06-04T08:00:00Z',
    uploadedBy: 'Sarah Tan',
  },
  {
    id: 'post1',
    title: 'Post-Camp Devotion — Carrying the Fire',
    day: 5,
    phase: 'post',
    pdfUrl: 'https://example.com/devotion-post.pdf',
    uploadedAt: '2024-06-10T08:00:00Z',
    uploadedBy: 'Sarah Tan',
  },
];

const INITIAL_SERMON_NOTES: SermonNote[] = [
  {
    id: 's1',
    sessionTitle: 'Session 1: The God Who Calls',
    day: 1,
    pdfUrl: 'https://example.com/sermon1.pdf',
    reflectionQuestions: [
      'Where has God been calling you that you have been hesitant to respond?',
      'What does it mean for you personally to say "Here I am, Lord"?',
      'How can your cell group support you in this area this week?',
    ],
    uploadedAt: '2024-06-01T21:00:00Z',
  },
  {
    id: 's2',
    sessionTitle: 'Session 2: Faith Over Fear',
    day: 2,
    pdfUrl: 'https://example.com/sermon2.pdf',
    reflectionQuestions: [
      'What fears are currently holding you back from fully trusting God?',
      'Share a time when stepping out in faith led to unexpected growth.',
      'What is one step of faith God is inviting you to take this month?',
    ],
    uploadedAt: '2024-06-02T21:00:00Z',
  },
  {
    id: 's3',
    sessionTitle: 'Session 3: One Body, Many Parts',
    day: 3,
    pdfUrl: 'https://example.com/sermon3.pdf',
    reflectionQuestions: [
      'What spiritual gift do you sense God has given you, and are you using it?',
      'How can you better serve the body of Christ in your everyday life?',
      'Who in the church can you intentionally invest in this month?',
    ],
    uploadedAt: '2024-06-03T21:00:00Z',
  },
  {
    id: 's4',
    sessionTitle: 'Session 4: Go — You Are Sent',
    day: 4,
    pdfUrl: 'https://example.com/sermon4.pdf',
    reflectionQuestions: [
      'What is one specific way you will live out the Great Commission this week?',
      'Who in your life needs to hear the Gospel, and how will you reach out to them?',
      'What commitment are you making to God as you leave camp?',
    ],
    uploadedAt: '2024-06-04T21:00:00Z',
  },
];

export const useDevotionStore = create<DevotionState>()(
  persist(
    (set, get) => ({
      devotions: INITIAL_DEVOTIONS,
      reflections: [],
      sermonNotes: INITIAL_SERMON_NOTES,

      addDevotion: (devotion: Omit<Devotion, 'id' | 'uploadedAt'>): void => {
        const newDevotion: Devotion = {
          ...devotion,
          id: `d${Date.now()}`,
          uploadedAt: new Date().toISOString(),
        };
        set((state: DevotionState) => ({
          devotions: [...state.devotions, newDevotion],
        }));
      },

      saveReflection: (devotionId: string, userId: string, content: string): void => {
        const existing = get().reflections.find(
          (r: Reflection) => r.devotionId === devotionId && r.userId === userId
        );
        if (existing) {
          set((state: DevotionState) => ({
            reflections: state.reflections.map((r: Reflection) =>
              r.id === existing.id
                ? { ...r, content, savedAt: new Date().toISOString() }
                : r
            ),
          }));
        } else {
          const newReflection: Reflection = {
            id: `r${Date.now()}`,
            devotionId,
            userId,
            content,
            savedAt: new Date().toISOString(),
          };
          set((state: DevotionState) => ({
            reflections: [...state.reflections, newReflection],
          }));
        }
      },

      getReflection: (devotionId: string, userId: string): Reflection | undefined => {
        return get().reflections.find(
          (r: Reflection) => r.devotionId === devotionId && r.userId === userId
        );
      },

      addSermonNote: (note: Omit<SermonNote, 'id' | 'uploadedAt'>): void => {
        const newNote: SermonNote = {
          ...note,
          id: `s${Date.now()}`,
          uploadedAt: new Date().toISOString(),
        };
        set((state: DevotionState) => ({
          sermonNotes: [...state.sermonNotes, newNote],
        }));
      },
    }),
    { name: 'devotion-store' }
  )
);
