// api.ts — No backend needed. All data lives in Zustand stores persisted to localStorage.
// This file is a stub for future integrations only.

export const api = {
  async notifyPrayerMinister(requestId: string, content: string): Promise<void> {
    console.log('[api] Prayer request submitted:', requestId, content);
  },

  async uploadFile(_file: File, _type: 'devotion' | 'sermon' | 'photo'): Promise<{ url: string }> {
    const url = URL.createObjectURL(_file);
    return { url };
  },
};
