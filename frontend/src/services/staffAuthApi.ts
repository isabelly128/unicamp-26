import type { User } from '../stores/authStore';

export class StaffAuthApiUnavailableError extends Error {
  constructor(message = 'Supabase auth is unavailable') {
    super(message);
  }
}

interface SupabaseAuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    role?: User['role'];
  };
  app_metadata?: {
    role?: User['role'];
  };
}

interface SupabaseAuthSession {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user: SupabaseAuthUser;
}

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://lijbxbvitmhrefmnyuys.supabase.co').replace(/\/$/, '');
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SESSION_STORAGE_KEY = 'unicamp-supabase-staff-session';

const ROLE_BY_EMAIL: Record<string, User['role']> = {
  'admin@camp.sg': 'administrator',
  'comms@camp.sg': 'comms',
  'pastoral@camp.sg': 'pastoral',
};

const requireSupabaseKey = (): string => {
  if (!SUPABASE_KEY) {
    throw new StaffAuthApiUnavailableError('Missing VITE_SUPABASE_PUBLISHABLE_KEY');
  }

  return SUPABASE_KEY;
};

const authHeaders = () => ({
  apikey: requireSupabaseKey(),
  'Content-Type': 'application/json',
});

const saveSession = (session: SupabaseAuthSession): SupabaseAuthSession => {
  const expiresAt = session.expires_at ||
    (session.expires_in ? Math.floor(Date.now() / 1000) + session.expires_in : undefined);
  const normalized = { ...session, expires_at: expiresAt };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
};

const readSession = (): SupabaseAuthSession | null => {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SupabaseAuthSession;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

const clearSession = (): void => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

const toUser = (session: SupabaseAuthSession): User => {
  const email = session.user.email || '';
  const role = session.user.app_metadata?.role ||
    session.user.user_metadata?.role ||
    ROLE_BY_EMAIL[email.toLowerCase()] ||
    'member';

  return {
    id: session.user.id,
    name: session.user.user_metadata?.name || email || 'Staff',
    email,
    role,
  };
};

const refreshSession = async (session: SupabaseAuthSession): Promise<SupabaseAuthSession | null> => {
  if (!session.refresh_token) return null;

  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });

  if (!response.ok) {
    clearSession();
    return null;
  }

  return saveSession(await response.json() as SupabaseAuthSession);
};

export const loginStaff = async (email: string, password: string): Promise<User | null> => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });

  if (response.status === 400 || response.status === 401) return null;
  if (!response.ok) throw new StaffAuthApiUnavailableError();

  const session = saveSession(await response.json() as SupabaseAuthSession);
  const user = toUser(session);

  return user.role === 'member' ? null : user;
};

export const getStaffSession = async (): Promise<User | null> => {
  const session = readSession();
  if (!session) return null;

  const now = Math.floor(Date.now() / 1000);
  const usableSession = session.expires_at && session.expires_at < now + 60
    ? await refreshSession(session)
    : session;

  if (!usableSession) return null;

  const user = toUser(usableSession);
  return user.role === 'member' ? null : user;
};

export const getSupabaseAccessToken = async (): Promise<string | null> => {
  const session = readSession();
  if (!session) return null;

  const now = Math.floor(Date.now() / 1000);
  const usableSession = session.expires_at && session.expires_at < now + 60
    ? await refreshSession(session)
    : session;

  return usableSession?.access_token || null;
};

export const getSupabaseAnonKey = (): string => requireSupabaseKey();

export const getSupabaseUrl = (): string => SUPABASE_URL;

export const logoutStaff = async (): Promise<void> => {
  const token = await getSupabaseAccessToken();
  clearSession();

  if (!token) return;

  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        apikey: requireSupabaseKey(),
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Client state is already cleared.
  }
};
