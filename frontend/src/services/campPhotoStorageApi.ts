import { getSupabaseAccessToken, getSupabaseAnonKey, getSupabaseUrl } from './staffAuthApi';

export type CampPhotoFolder = 'home-hero' | 'home-card' | 'album-cover' | 'section-photo';

export interface UploadedCampPhoto {
  path: string;
  url: string;
}

const PHOTO_BUCKET = import.meta.env.VITE_SUPABASE_PHOTO_BUCKET || 'camp-photos';
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const normalizeMimeType = (type: string): string =>
  type === 'image/jpg' ? 'image/jpeg' : type;

const slugify = (value: string): string => {
  const slug = value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'photo';
};

const randomId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const encodeStoragePath = (path: string): string =>
  path.split('/').map(encodeURIComponent).join('/');

const parseStorageError = async (response: Response): Promise<string> => {
  try {
    const data = await response.json() as { message?: string; error?: string };
    return data.message || data.error || `Photo upload failed with status ${response.status}`;
  } catch {
    return `Photo upload failed with status ${response.status}`;
  }
};

export const uploadCampPhoto = async (
  file: File,
  folder: CampPhotoFolder,
  nameHint = file.name
): Promise<UploadedCampPhoto> => {
  const contentType = normalizeMimeType(file.type);
  const extension = MIME_EXTENSION[contentType];

  if (!extension) {
    throw new Error('Please upload a JPG, PNG, or WebP image.');
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Please upload an image smaller than 10 MB.');
  }

  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) {
    throw new Error('Staff login required before uploading photos.');
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseAnonKey();
  const objectPath = `${folder}/${slugify(nameHint)}-${Date.now()}-${randomId()}.${extension}`;
  const encodedPath = encodeStoragePath(objectPath);

  const response = await fetch(`${supabaseUrl}/storage/v1/object/${PHOTO_BUCKET}/${encodedPath}`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(await parseStorageError(response));
  }

  return {
    path: objectPath,
    url: `${supabaseUrl}/storage/v1/object/public/${PHOTO_BUCKET}/${encodedPath}`,
  };
};
