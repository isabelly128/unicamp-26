import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStaffSession, loginStaff, logoutStaff } from '../services/staffAuthApi';

// ── Inlined types (no dependency on ../types) ─────────────────────────────────
export type UserRole = 'comms' | 'pastoral' | 'administrator' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export const MEMBER_USER: User = {
  id:    'member-public',
  name:  'Camper',
  email: '',
  role:  'member',
};
// ─────────────────────────────────────────────────────────────────────────────

interface AuthState {
  user:            User | null;
  isAuthenticated: boolean;
  isSessionVerified: boolean;
  login:   (email: string, password: string) => Promise<boolean>;
  logout:  () => void;
  validateSession: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      isAuthenticated: false,
      isSessionVerified: false,

      login: async (email: string, password: string): Promise<boolean> => {
        try {
          const apiUser = await loginStaff(email, password);
          if (apiUser) {
            set({ user: apiUser, isAuthenticated: true, isSessionVerified: true });
            return true;
          }

          return false;
        } catch {
          return false;
        }
      },

      logout: () => {
        void logoutStaff();
        set({ user: null, isAuthenticated: false, isSessionVerified: true });
      },

      validateSession: async (): Promise<void> => {
        try {
          const apiUser = await getStaffSession();
          if (apiUser) {
            set({ user: apiUser, isAuthenticated: true, isSessionVerified: true });
            return;
          }
        } catch {
          // If the API is unavailable, fail closed for staff pages.
        }

        set({ user: null, isAuthenticated: false, isSessionVerified: true });
      },

      hasRole: (roles: UserRole[]): boolean => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'administrator') return true;
        return roles.includes(user.role);
      },
    }),
    {
      name: 'staff-auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
