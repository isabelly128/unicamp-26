import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

interface MockUser extends User { password: string; }

// Staff-only accounts — members access the public site without logging in
const STAFF_USERS: MockUser[] = [
  { id: '1', name: 'Sarah Tan',    email: 'comms@camp.sg',    password: 'comms2026',    role: 'comms' },
  { id: '2', name: 'Pastor David', email: 'pastoral@camp.sg', password: 'pastoral2026', role: 'pastoral' },
  { id: '3', name: 'Admin Lee',    email: 'admin@camp.sg',    password: 'admin2026',    role: 'administrator' },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string): Promise<boolean> => {
        const found = STAFF_USERS.find(
          (u) => u.email === email && u.password === password
        );
        if (found) {
          const { password: _pw, ...user } = found;
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      hasRole: (roles: UserRole[]): boolean => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'administrator') return true;
        return roles.includes(user.role);
      },
    }),
    { name: 'staff-auth-store' }
  )
);

// Public member "user" — used by the member site so store-dependent
// components (e.g. reflection saving) still work without real auth
export const MEMBER_USER: User = {
  id: 'member-public',
  name: 'Camper',
  email: '',
  role: 'member',
};