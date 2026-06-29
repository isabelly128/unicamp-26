export type UserRole = 'comms' | 'pastoral' | 'administrator' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
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

export interface Reflection {
  id: string;
  devotionId: string;
  userId: string;
  content: string;
  savedAt: string;
}

export interface SermonNote {
  id: string;
  sessionTitle: string;
  day: number;
  pdfUrl: string;
  reflectionQuestions: string[];
  uploadedAt: string;
}

export interface PrayerRequest {
  id: string;
  content: string;
  submittedBy: string;
  submittedAt: string;
  isAnonymous: boolean;
  status: 'pending' | 'prayed';
  name?: string;
}

export interface Conviction {
  id: string;
  content: string;
  submittedAt: string;
  approved: boolean;
  approvedBy?: string;
}

export interface Thanksgiving {
  id: string;
  content: string;
  submittedBy: string;
  submittedAt: string;
  isAnonymous: boolean;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  googlePhotosUrl: string;
  coverPhotoUrl: string;
  updatedAt: string;
}

// ── Booklet / Schedule types ──────────────────────────────────────────────────

export interface BookletExtra {
  type: 'packing-list' | 'vol-dedication';
  pdfUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

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
