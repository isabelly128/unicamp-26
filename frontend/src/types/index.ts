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
  day: number; // 1-4
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
  submittedBy: string; // userId
  submittedAt: string;
  isAnonymous: boolean;
  status: 'pending' | 'prayed';
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

export interface Blessing {
  id: string;
  prompt: string;
  day: number;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  googlePhotosUrl: string;
  coverPhotoUrl: string;
  updatedAt: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  requiredRole?: UserRole[];
}