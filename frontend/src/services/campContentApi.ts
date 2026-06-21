import type { CampDay, Devotion, FoodSpot, LodgingInfo, SermonNote } from '../stores/devotionStore';
import { getSupabaseAccessToken, getSupabaseAnonKey, getSupabaseUrl } from './staffAuthApi';

export interface CampContentPayload {
  devotions: Devotion[];
  sermonNotes: SermonNote[];
  packingListText: string;
  volDedicationText: string;
  schedule: CampDay[];
  lodging: LodgingInfo;
  foodSpots: FoodSpot[];
}

interface CampContentResponse {
  content: CampContentPayload | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  error?: string;
}

const parseError = async (response: Response): Promise<string> => {
  try {
    const data = await response.json() as { error?: string };
    return data.error || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

export const fetchCampContent = async (): Promise<CampContentPayload | null> => {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseAnonKey();
  const response = await fetch(
    `${supabaseUrl}/rest/v1/camp_content?id=eq.unicamp-2026&select=content,updated_at,updated_by`,
    {
    method: 'GET',
      headers: {
        apikey: supabaseKey,
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const rows = await response.json() as CampContentResponse[];
  return rows[0]?.content || null;
};

export const saveCampContent = async (content: CampContentPayload): Promise<void> => {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseAnonKey();
  const accessToken = await getSupabaseAccessToken();

  if (!accessToken) {
    throw new Error('Staff login required');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/camp_content?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: 'unicamp-2026',
      content,
      updated_by: 'staff',
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
};
