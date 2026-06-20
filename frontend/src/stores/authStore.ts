import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface MockUser {
  id:       string;
  name:     string;
  email:    string;
  role:     UserRole;
  password: string;
  avatar?:  string;
}

interface AuthState {
  user:            User | null;
  isAuthenticated: boolean;
  login:   (email: string, password: string) => Promise<boolean>;
  logout:  () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

// Staff-only accounts — members access the public site without logging in
const STAFF_USERS: MockUser[] = [
  { id: '1', name: 'Sarah Tan',    email: 'comms@camp.sg',    password: 'comms2024',    role: 'comms' },
  { id: '2', name: 'Pastor David', email: 'pastoral@camp.sg', password: 'pastoral2024', role: 'pastoral' },
  { id: '3', name: 'Admin Lee',    email: 'admin@camp.sg',    password: 'admin2024',    role: 'administrator' },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      isAuthenticated: false,

      login: async (email: string, password: string): Promise<boolean> => {
        const found = STAFF_USERS.find(
          (u: MockUser) => u.email === email && u.password === password
        );
        if (found) {
          const user: User = {
            id:    found.id,
            name:  found.name,
            email: found.email,
            role:  found.role,
          };
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