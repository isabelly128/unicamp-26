// api.ts — Central API service layer
// Replace mock implementations with real backend calls (Firebase, Supabase, etc.)

const API_BASE = import.meta.env.VITE_API_URL || 'https://your-backend.com/api';

export const api = {
  // Auth
  async login(email: string, password: string) {
    // Replace with real auth call
    return fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then((r) => r.json());
  },

  // File upload (for comms/admin)
  async uploadFile(file: File, type: 'devotion' | 'sermon' | 'photo') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    }).then((r) => r.json());
  },

  // Notifications — prayer ministers
  async notifyPrayerMinister(requestId: string, content: string) {
    return fetch(`${API_BASE}/notify/prayer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, content }),
    }).then((r) => r.json());
  },
};

// Google Photos Shared Album utility
// Uses the Google Photos Library API or a scraping proxy
export const googlePhotos = {
  /**
   * Constructs an embeddable Google Photos album URL.
   * For auto-updating, set up a backend webhook or cron that fetches
   * the album and stores photo URLs. This function assumes that setup.
   */
  getEmbedUrl(albumId: string) {
    return `https://photos.google.com/share/${albumId}`;
  },

  getAlbumThumbnail(albumId: string) {
    // Replace with your proxy/backend endpoint that fetches the cover photo
    return `${API_BASE}/photos/album/${albumId}/cover`;
  },
};