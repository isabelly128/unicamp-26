/**
 * imageUtils.ts
 * Converts known sharing URLs into direct image URLs that work as <img src>.
 * Place this in: frontend/src/utils/imageUtils.ts
 */

/**
 * Converts various sharing URL formats into a direct image URL.
 *
 * Supported inputs:
 *  - Google Drive viewer:  drive.google.com/file/d/ID/view
 *  - Google Drive uc:      drive.google.com/uc?export=view&id=ID
 *  - imgbb viewer:         ibb.co/XXXXX  or  ibb.co/XXXXXX/filename
 *  - imgbb direct:         i.ibb.co/...  (already correct, returned as-is)
 *  - Everything else:      returned unchanged
 */
export function toDirectImageUrl(url: string): string {
  if (!url) return url;

  const trimmed = url.trim();

  // ── Google Drive ──────────────────────────────────────────────────────────
  // Format 1: https://drive.google.com/file/d/FILE_ID/view?...
  const driveFileMatch = trimmed.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  );
  if (driveFileMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveFileMatch[1]}`;
  }

  // Format 2: https://drive.google.com/uc?export=view&id=FILE_ID  (already correct)
  if (trimmed.includes('drive.google.com/uc')) {
    return trimmed;
  }

  // ── imgbb ─────────────────────────────────────────────────────────────────
  // Viewer page: https://ibb.co/YFQ0BYdw  →  https://i.ibb.co/YFQ0BYdw
  // imgbb viewer URLs are ibb.co/<code> or ibb.co/<code>/<filename>
  const imgbbViewer = trimmed.match(/^https?:\/\/ibb\.co\/([a-zA-Z0-9]+)/);
  if (imgbbViewer) {
    // Direct images live at i.ibb.co/<code>/<filename>
    // We don't know the filename, but imgbb also supports thumbnail redirects
    return `https://i.ibb.co/${imgbbViewer[1]}/${imgbbViewer[1]}.jpg`;
  }

  // Already a direct imgbb URL: https://i.ibb.co/...
  if (trimmed.includes('i.ibb.co')) {
    return trimmed;
  }

  // ── Everything else — return unchanged ────────────────────────────────────
  return trimmed;
}

/**
 * Returns a human-readable hint for why an image might not load,
 * based on the original URL the user pasted.
 */
export function getImageUrlHint(url: string): string {
  if (!url) return '';

  if (url.includes('ibb.co') && !url.includes('i.ibb.co')) {
    return 'imgbb: use the "Direct link" (starts with i.ibb.co), not the viewer page.';
  }
  if (url.includes('drive.google.com/file/d/')) {
    return 'Google Drive: converting to direct format automatically.';
  }
  if (url.includes('drive.google.com/uc')) {
    return 'Google Drive: if the image doesn\'t appear, make sure sharing is set to "Anyone with the link → Viewer".';
  }
  if (url.includes('dropbox.com')) {
    return 'Dropbox: change ?dl=0 to ?raw=1 at the end of the URL.';
  }
  return '';
}
