// googlePhotos.ts — Google Photos integration service
// Google Photos doesn't have a public embed API, but shared albums 
// can be embedded via iframe or accessed via the Photos Library API.

export interface GooglePhoto {
  id: string;
  baseUrl: string;
  filename: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
  };
}

/**
 * To auto-update when you add photos to a shared album:
 * 
 * Option A (Simplest): Embed the Google Photos shared album iframe directly.
 *   - Go to the album → Share → "Get link" 
 *   - Use that URL in an iframe or redirect
 * 
 * Option B (Best UX): Use a backend service (Node/Python) with Google Photos API
 *   - Set up OAuth2 with the Google Photos Library API
 *   - Cache album contents in your DB, refresh every 5 min via cron
 *   - Expose a /api/photos/album/:albumId endpoint
 *
 * This service provides the utilities for Option B.
 */

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://your-backend.com/api';

export const googlePhotosService = {
  /**
   * Fetch photos from your backend proxy (which calls Google Photos API)
   */
  async getAlbumPhotos(albumId: string): Promise<GooglePhoto[]> {
    try {
      const res = await fetch(`${BACKEND_URL}/photos/album/${albumId}`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      console.error('Failed to fetch album photos');
      return [];
    }
  },

  /**
   * Get Google Photos shared album embed URL
   * Users click this to open in Google Photos
   */
  getSharedAlbumUrl(albumShareToken: string) {
    return `https://photos.app.goo.gl/${albumShareToken}`;
  },

  /**
   * For iframe embedding (limited but works without API)
   * Note: Google Photos doesn't officially support iframe embedding,
   * so this redirects users to the album.
   */
  getAlbumRedirectUrl(albumUrl: string) {
    return albumUrl;
  },
};