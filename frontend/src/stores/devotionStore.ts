import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  fetchCampContent,
  saveCampContent,
  type CampContentUpdate,
} from '../services/campContentApi';

// ── Type definitions ──────────────────────────────────────────────────────────
export interface DaySession {
  time: string;
  title: string;
  description?: string;
  icon: string;
  type: 'session' | 'meal' | 'activity' | 'free' | 'devotion' | 'worship';
}

export interface CampDay {
  day: number;
  label: string;
  date: string;
  theme: string;
  verse: string;
  sessions: DaySession[];
}

export interface LodgingInfo {
  venueName: string;
  address: string;
  directions: string;
  mapsUrl: string;
  checkIn: string;
  checkOut: string;
}

export interface FoodSpot {
  name: string;
  type: 'meal' | 'supper' | 'htht';
  description: string;
  address: string;
  openHours: string;
}

export interface Devotion {
  id: string;
  title: string;
  day: number;
  phase: 'pre' | 'during' | 'post';
  pdfUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface SermonNote {
  id: string;
  sessionTitle: string;
  day: number;
  pdfUrl: string;
  reflectionQuestions: string[];
  uploadedAt: string;
}
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SCHEDULE: CampDay[] = [
  {
    day: 1, label: 'Day 1', date: 'Thursday, July 2',
    theme: 'The Call', verse: 'Matthew 7:13-14',
    sessions: [
      { time: '2:00 PM',  title: 'Registration & Check-In',      icon: '🏕️', type: 'activity' },
      { time: '3:30 PM',  title: 'Camp Orientation',             description: 'Ground rules, safety briefing, room assignments', icon: '📋', type: 'activity' },
      { time: '4:30 PM',  title: 'Ice Breaker Games',            description: 'Get to know your cabin mates!', icon: '🎮', type: 'activity' },
      { time: '6:00 PM',  title: 'Dinner',                       icon: '🍽️', type: 'meal' },
      { time: '7:30 PM',  title: 'Opening Worship',              icon: '🎵', type: 'worship' },
      { time: '8:15 PM',  title: 'Session 1: The God Who Calls', description: 'Speaker: Pastor David · Isaiah 6:1-8', icon: '📖', type: 'session' },
      { time: '9:30 PM',  title: 'Cell Group Discussion',        icon: '👥', type: 'activity' },
      { time: '10:30 PM', title: 'Night Devotion',               icon: '🕯️', type: 'devotion' },
      { time: '11:00 PM', title: 'Lights Out',                   icon: '🌙', type: 'free' },
    ],
  },
  {
    day: 2, label: 'Day 2', date: 'Friday, July 3',
    theme: 'The Call', verse: 'Matthew 7:13-14',
    sessions: [
      { time: '7:00 AM',  title: 'Morning Devotion',              icon: '🌅', type: 'devotion' },
      { time: '7:45 AM',  title: 'Breakfast',                     icon: '🍳', type: 'meal' },
      { time: '9:00 AM',  title: 'Morning Worship',               icon: '🎵', type: 'worship' },
      { time: '9:30 AM',  title: 'Session 2: Faith Over Fear',    description: 'Speaker: Pastor David', icon: '📖', type: 'session' },
      { time: '10:45 AM', title: 'Small Group Prayer',            icon: '🙏', type: 'activity' },
      { time: '12:00 PM', title: 'Lunch',                         icon: '🍱', type: 'meal' },
      { time: '1:30 PM',  title: 'Free & Rec Time',               description: 'Swimming, sports, rest', icon: '🏊', type: 'free' },
      { time: '3:30 PM',  title: 'Workshops',                     description: 'Choose: Evangelism / Spiritual Disciplines / Worship Leading', icon: '🛠️', type: 'activity' },
      { time: '5:30 PM',  title: 'Dinner',                        icon: '🍽️', type: 'meal' },
      { time: '7:30 PM',  title: 'Evening Worship & Ministry Time', icon: '🕊️', type: 'worship' },
      { time: '9:30 PM',  title: 'Cell Group Sharing',            icon: '👥', type: 'activity' },
      { time: '10:30 PM', title: 'Night Devotion',                icon: '🕯️', type: 'devotion' },
      { time: '11:00 PM', title: 'Lights Out',                    icon: '🌙', type: 'free' },
    ],
  },
  {
    day: 3, label: 'Day 3', date: 'Saturday, July 4',
    theme: 'The Call', verse: 'Matthew 7:13-14',
    sessions: [
      { time: '7:00 AM',  title: 'Morning Devotion',                  icon: '🌅', type: 'devotion' },
      { time: '7:45 AM',  title: 'Breakfast',                         icon: '🍳', type: 'meal' },
      { time: '9:00 AM',  title: 'Morning Worship',                   icon: '🎵', type: 'worship' },
      { time: '9:30 AM',  title: 'Session 3: One Body, Many Parts',   description: 'Speaker: Elder James', icon: '📖', type: 'session' },
      { time: '10:45 AM', title: 'Spiritual Gifts Discovery',         icon: '🎯', type: 'activity' },
      { time: '12:00 PM', title: 'Lunch',                             icon: '🍱', type: 'meal' },
      { time: '1:30 PM',  title: 'Outreach Project',                  icon: '❤️', type: 'activity' },
      { time: '4:00 PM',  title: 'Testimony Sharing',                 icon: '🎤', type: 'activity' },
      { time: '5:30 PM',  title: 'Dinner',                            icon: '🍽️', type: 'meal' },
      { time: '7:00 PM',  title: 'Camp Night (Games & Talent Show)',  icon: '🌟', type: 'activity' },
      { time: '9:30 PM',  title: 'Bonfire Worship',                   icon: '🔥', type: 'worship' },
      { time: '11:00 PM', title: 'Lights Out',                        icon: '🌙', type: 'free' },
    ],
  },
  {
    day: 4, label: 'Day 4', date: 'Sunday, July 5',
    theme: 'The Call', verse: 'Matthew 7:13-14',
    sessions: [
      { time: '7:00 AM',  title: 'Morning Devotion',                   icon: '🌅', type: 'devotion' },
      { time: '7:45 AM',  title: 'Breakfast',                          icon: '🍳', type: 'meal' },
      { time: '9:00 AM',  title: 'Closing Worship',                    icon: '🎵', type: 'worship' },
      { time: '9:30 AM',  title: 'Session 4: Go — You Are Sent',       description: 'Speaker: Pastor David', icon: '📖', type: 'session' },
      { time: '10:45 AM', title: 'Commitment & Consecration',          icon: '✋', type: 'worship' },
      { time: '11:30 AM', title: 'Cell Group Prayer & Commissioning',  icon: '🙏', type: 'activity' },
      { time: '12:30 PM', title: 'Farewell Lunch',                     icon: '🍽️', type: 'meal' },
      { time: '2:00 PM',  title: 'Check-Out',                          icon: '🏕️', type: 'activity' },
      { time: '3:00 PM',  title: 'Depart',                             icon: '👋', type: 'free' },
    ],
  },
];

const DEFAULT_LODGING: LodgingInfo = {
  venueName:  'Camp Venue Name',
  address:    '123 Camp Road, Singapore 000000',
  directions: 'Take MRT to [Station]. Exit [Exit No.] and walk 5 min to the venue.',
  mapsUrl:    'https://maps.google.com',
  checkIn:    'Thursday, July 2 — 3:00 PM onwards',
  checkOut:   'Sunday, July 5 — by 11:00 AM',
};

const DEFAULT_FOOD: FoodSpot[] = [
  { name: 'Venue Canteen',       type: 'meal',   description: 'All meals provided in the camp canteen',     address: 'Main venue',             openHours: 'Meal times only' },
  { name: 'Nearby Coffee Shop',  type: 'supper', description: 'Supper options nearby — mixed economy food', address: '5 min walk from venue',  openHours: '6 PM – 12 AM' },
  { name: 'Scenic Waterfront',   type: 'htht',   description: 'Great spot for quiet heart-to-heart talks',  address: '10 min walk from venue', openHours: 'Open 24 hrs' },
  { name: 'Void Deck / BBQ Pit', type: 'htht',   description: 'Covered area for small group conversations', address: 'Within camp grounds',    openHours: 'Open 24 hrs' },
];

interface DevotionState {
  devotions:        Devotion[];
  sermonNotes:      SermonNote[];
  packingListText:  string;
  volDedicationText: string;
  schedule:         CampDay[];
  lodging:          LodgingInfo;
  foodSpots:        FoodSpot[];
  remoteStatus:     'idle' | 'loading' | 'synced' | 'error';
  remoteError:      string | null;
  lastSyncedAt:     string | null;

  loadCampContent:     () => Promise<void>;
  syncCampContent:     () => Promise<void>;
  addDevotion:         (d: Omit<Devotion, 'id' | 'uploadedAt'>) => void;
  updateDevotion:      (id: string, updates: Partial<Omit<Devotion, 'id'>>) => void;
  removeDevotion:      (id: string) => void;
  addSermonNote:       (n: Omit<SermonNote, 'id' | 'uploadedAt'>) => void;
  updateSermonNote:    (id: string, updates: Partial<Omit<SermonNote, 'id'>>) => void;
  removeSermonNote:    (id: string) => void;
  setPackingListText:  (text: string) => void;
  setVolDedicationText: (text: string) => void;
  updateDay:           (dayIndex: number, updated: CampDay) => void;
  updateSession:       (dayIndex: number, sessionIndex: number, updated: Partial<DaySession>) => void;
  addSession:          (dayIndex: number, session: DaySession) => void;
  removeSession:       (dayIndex: number, sessionIndex: number) => void;
  setLodging:          (info: LodgingInfo) => void;
  setFoodSpots:        (spots: FoodSpot[]) => void;
  updateFoodSpot:      (index: number, spot: FoodSpot) => void;
}

const INITIAL_DEVOTIONS: Devotion[] = [
  { id: 'd1',   title: 'Day 1 — ',      day: 1, phase: 'during', pdfUrl: '', uploadedAt: '', uploadedBy: 'Admin' },
  { id: 'd2',   title: 'Day 2 — ',      day: 2, phase: 'during', pdfUrl: '', uploadedAt: '', uploadedBy: 'Admin' },
  { id: 'd3',   title: 'Day 3 — ',   day: 3, phase: 'during', pdfUrl: '', uploadedAt: '', uploadedBy: 'Admin' },
  { id: 'd4',   title: 'Day 4 — ',   day: 4, phase: 'during', pdfUrl: '', uploadedAt: '', uploadedBy: 'Admin' },
  { id: 'pre1', title: 'Pre-Camp — ', day: 0, phase: 'pre',    pdfUrl: '', uploadedAt: '', uploadedBy: 'Admin' },
  { id: 'post1',title: 'Post-Camp — ', day: 5, phase: 'post',   pdfUrl: '', uploadedAt: '', uploadedBy: 'Admin' },
];

const INITIAL_SERMONS: SermonNote[] = [
  {
    id: 's1', sessionTitle: 'Session 1: The God Who Calls', day: 1, pdfUrl: '',
    reflectionQuestions: [
      'Where has God been calling you that you have been hesitant to respond?',
      'What does staying the course look like for you this season?',
    ],
    uploadedAt: '',
  },
  {
    id: 's2', sessionTitle: 'Session 2: Faith Over Fear', day: 2, pdfUrl: '',
    reflectionQuestions: [
      'What fears are currently holding you back from fully trusting God?',
      'What is one step of faith God is inviting you to take this month?',
    ],
    uploadedAt: '',
  },
];

const contentFromState = (state: DevotionState): CampContentUpdate => ({
  devotions: state.devotions,
  sermonNotes: state.sermonNotes,
  packingListText: state.packingListText,
  volDedicationText: state.volDedicationText,
  schedule: state.schedule,
  lodging: state.lodging,
  foodSpots: state.foodSpots,
});

const withDefaults = (content: CampContentUpdate) => ({
  devotions: content.devotions ?? INITIAL_DEVOTIONS,
  sermonNotes: content.sermonNotes ?? INITIAL_SERMONS,
  packingListText: content.packingListText ?? '',
  volDedicationText: content.volDedicationText ?? '',
  schedule: content.schedule ?? DEFAULT_SCHEDULE,
  lodging: content.lodging ?? DEFAULT_LODGING,
  foodSpots: content.foodSpots ?? DEFAULT_FOOD,
});

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unable to sync camp content';

export const useDevotionStore = create<DevotionState>()(
  persist(
    (set, get) => {
      const syncAfterSet = (): void => {
        void get().syncCampContent();
      };

      return ({
      devotions:        INITIAL_DEVOTIONS,
      sermonNotes:      INITIAL_SERMONS,
      packingListText:  '',
      volDedicationText: '',
      schedule:         DEFAULT_SCHEDULE,
      lodging:          DEFAULT_LODGING,
      foodSpots:        DEFAULT_FOOD,
      remoteStatus:     'idle',
      remoteError:      null,
      lastSyncedAt:     null,

      loadCampContent: async (): Promise<void> => {
        if (get().remoteStatus === 'loading') return;

        set({ remoteStatus: 'loading', remoteError: null });

        try {
          const content = await fetchCampContent();
          set({
            ...(content ? withDefaults(content) : {}),
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

      syncCampContent: async (): Promise<void> => {
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

      addDevotion: (d: Omit<Devotion, 'id' | 'uploadedAt'>) =>
        { set((s: DevotionState) => ({
          devotions: [...s.devotions, { ...d, id: `d${Date.now()}`, uploadedAt: new Date().toISOString() }],
        })); syncAfterSet(); },

      updateDevotion: (id: string, updates: Partial<Omit<Devotion, 'id'>>) =>
        { set((s: DevotionState) => ({
          devotions: s.devotions.map((d: Devotion) => d.id === id ? { ...d, ...updates } : d),
        })); syncAfterSet(); },

      removeDevotion: (id: string) =>
        { set((s: DevotionState) => ({
          devotions: s.devotions.filter((d: Devotion) => d.id !== id),
        })); syncAfterSet(); },

      addSermonNote: (n: Omit<SermonNote, 'id' | 'uploadedAt'>) =>
        { set((s: DevotionState) => ({
          sermonNotes: [...s.sermonNotes, { ...n, id: `sn${Date.now()}`, uploadedAt: new Date().toISOString() }],
        })); syncAfterSet(); },

      updateSermonNote: (id: string, updates: Partial<Omit<SermonNote, 'id'>>) =>
        { set((s: DevotionState) => ({
          sermonNotes: s.sermonNotes.map((n: SermonNote) => n.id === id ? { ...n, ...updates } : n),
        })); syncAfterSet(); },

      removeSermonNote: (id: string) =>
        { set((s: DevotionState) => ({
          sermonNotes: s.sermonNotes.filter((n: SermonNote) => n.id !== id),
        })); syncAfterSet(); },

      setPackingListText: (text: string) => {
        set({ packingListText: text });
        syncAfterSet();
      },
      setVolDedicationText: (text: string) => {
        set({ volDedicationText: text });
        syncAfterSet();
      },

      updateDay: (dayIndex: number, updated: CampDay) =>
        { set((s: DevotionState) => ({
          schedule: s.schedule.map((d: CampDay, i: number) => i === dayIndex ? updated : d),
        })); syncAfterSet(); },

      updateSession: (dayIndex: number, sessionIndex: number, updated: Partial<DaySession>) =>
        { set((s: DevotionState) => ({
          schedule: s.schedule.map((d: CampDay, di: number) =>
            di !== dayIndex ? d : {
              ...d,
              sessions: d.sessions.map((sess: DaySession, si: number) =>
                si !== sessionIndex ? sess : { ...sess, ...updated }
              ),
            }
          ),
        })); syncAfterSet(); },

      addSession: (dayIndex: number, session: DaySession) =>
        { set((s: DevotionState) => ({
          schedule: s.schedule.map((d: CampDay, i: number) =>
            i !== dayIndex ? d : { ...d, sessions: [...d.sessions, session] }
          ),
        })); syncAfterSet(); },

      removeSession: (dayIndex: number, sessionIndex: number) =>
        { set((s: DevotionState) => ({
          schedule: s.schedule.map((d: CampDay, di: number) =>
            di !== dayIndex ? d : {
              ...d,
              sessions: d.sessions.filter((_: DaySession, si: number) => si !== sessionIndex),
            }
          ),
        })); syncAfterSet(); },

      setLodging: (info: LodgingInfo) => {
        set({ lodging: info });
        syncAfterSet();
      },

      setFoodSpots: (spots: FoodSpot[]) => {
        set({ foodSpots: spots });
        syncAfterSet();
      },

      updateFoodSpot: (index: number, spot: FoodSpot) =>
        { set((s: DevotionState) => ({
          foodSpots: s.foodSpots.map((f: FoodSpot, i: number) => i === index ? spot : f),
        })); syncAfterSet(); },
    });
    },
    {
      name: 'devotion-store',
      version: 3,
      partialize: (state) => ({
        devotions: state.devotions,
        sermonNotes: state.sermonNotes,
        packingListText: state.packingListText,
        volDedicationText: state.volDedicationText,
        schedule: state.schedule,
        lodging: state.lodging,
        foodSpots: state.foodSpots,
      }),
    }
  )
);
