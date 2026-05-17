// googlePhotos.ts
// Linked to: https://drive.google.com/drive/folders/1YKE5dDtrgkBiMLjIwsumpuZuHXICPjrC
//
// HOW AUTO-UPDATING WORKS:
//   The folder is embedded as an iframe. When you add photos to the Drive
//   folder, they appear automatically — zero extra steps needed.
//
// FOR A RICHER GRID: add individual file IDs to DRIVE_PHOTOS below.
//   Each file must be shared "Anyone with the link → Viewer".
//   Get a file's ID from its share link: drive.google.com/file/d/FILE_ID/view

export const DRIVE_FOLDER_ID = '1YKE5dDtrgkBiMLjIwsumpuZuHXICPjrC';

export const DRIVE_FOLDER_URL =
  `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;

export const DRIVE_EMBED_URL =
  `https://drive.google.com/embeddedfolderview?id=${DRIVE_FOLDER_ID}#grid`;

/** Convert a Drive file ID → direct image src */
export function driveImageUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/** Convert a Drive file ID → fast thumbnail src */
export function driveThumbnailUrl(fileId: string, size = 400): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

export interface DrivePhoto {
  id: string;
  caption?: string;
  day?: number; // 1–4
}

/**
 * Add your Drive file IDs here — PhotosPage picks them up automatically.
 * Example: { id: '1AbCdEfG...', caption: 'Opening worship', day: 1 }
 */
export const DRIVE_PHOTOS: DrivePhoto[] = [
  // { id: 'YOUR_FILE_ID', caption: 'Day 1', day: 1 },
];

export const googlePhotosService = {
  openFolder(): void {
    window.open(DRIVE_FOLDER_URL, '_blank', 'noopener,noreferrer');
  },
  embedUrl(): string {
    return DRIVE_EMBED_URL;
  },
  getPhotos(): DrivePhoto[] {
    return DRIVE_PHOTOS;
  },
  getPhotosByDay(day: number): DrivePhoto[] {
    return DRIVE_PHOTOS.filter((p) => p.day === day);
  },
};
