import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

// Mock users for demo — replace with real auth (Firebase, Supabase, etc.)
const MOCK_USERS: (User & { password: string })[] = [
  { id: '1', name: 'Sarah Tan', email: 'comms@camp.sg', password: 'camp2024', role: 'comms', avatar: '' },
  { id: '2', name: 'Pastor David', email: 'pastoral@camp.sg', password: 'camp2024', role: 'pastoral', avatar: '' },
  { id: '3', name: 'Admin Lee', email: 'admin@camp.sg', password: 'camp2024', role: 'administrator', avatar: '' },
  { id: '4', name: 'Jordan Ng', email: 'member@camp.sg', password: 'camp2024', role: 'member', avatar: '' },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const found = MOCK_USERS.find(
          (u) => u.email === email && u.password === password
        );
        if (found) {
          const { password: _, ...user } = found;
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      hasRole: (roles: UserRole[]) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'administrator') return true;
        return roles.includes(user.role);
      },
    }),
    { name: 'auth-store' }
  )
);