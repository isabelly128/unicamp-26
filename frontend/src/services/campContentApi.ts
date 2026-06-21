import type { CampDay, Devotion, FoodSpot, LodgingInfo, SermonNote } from '../stores/devotionStore';

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
  const response = await fetch('/api/camp-content', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json() as CampContentResponse;
  return data.content || null;
};

export const saveCampContent = async (content: CampContentPayload): Promise<void> => {
  const response = await fetch('/api/camp-content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
};
