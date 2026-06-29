import { supabase } from './supabase';

/**
 * Upload a file to Supabase Storage (bucket: camp-images),
 * save the public URL to the site_images table, and return the URL.
 *
 * @param key   - unique identifier, e.g. 'hero-bg' or '/booklet'
 * @param file  - PNG or JPG File object from an <input type="file">
 */
export async function uploadSiteImage(key: string, file: File): Promise<string> {
  // Build a unique storage path — slashes in key replaced so path stays flat
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `${key.replace(/\//g, '_').replace(/^_/, '')}_${Date.now()}.${ext}`;

  // 1. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('camp-images')
    .upload(path, file, { upsert: true, cacheControl: '3600' });

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

  // 2. Get the permanent public URL
  const { data: urlData } = supabase.storage
    .from('camp-images')
    .getPublicUrl(path);

  const url = urlData.publicUrl;

  // 3. Upsert the URL into the site_images table so all users see it
  const { error: dbError } = await supabase
    .from('site_images')
    .upsert(
      { key, url, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );

  if (dbError) throw new Error(`DB upsert failed: ${dbError.message}`);

  return url;
}

/**
 * Load all site image URLs from the database.
 * Returns a map of { key -> url } for every stored image.
 * Call this on app startup so every user sees admin-uploaded images.
 */
export async function loadSiteImages(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('site_images')
    .select('key, url');

  if (error || !data) return {};

  return Object.fromEntries(data.map((row: { key: string; url: string }) => [row.key, row.url]));
}

/**
 * Delete an image from storage and remove its DB record.
 */
export async function deleteSiteImage(key: string): Promise<void> {
  await supabase.from('site_images').delete().eq('key', key);
}
