import type { User } from '../stores/authStore';

export class StaffAuthApiUnavailableError extends Error {
  constructor() {
    super('Staff auth API is unavailable');
  }
}

export const loginStaff = async (email: string, password: string): Promise<User | null> => {
  let response: Response;

  try {
    response = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new StaffAuthApiUnavailableError();
  }

  if (response.status === 401) return null;
  if (!response.ok) throw new StaffAuthApiUnavailableError();

  try {
    const data = await response.json() as { user?: User };
    return data.user || null;
  } catch {
    throw new StaffAuthApiUnavailableError();
  }
};

export const logoutStaff = async (): Promise<void> => {
  try {
    await fetch('/api/admin-logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Local development may not run the Vercel API; client state is still cleared.
  }
};
