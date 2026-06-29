import type { Conviction, PrayerRequest, Thanksgiving } from '../stores/communityStore';
import { getSupabaseAccessToken, getSupabaseAnonKey, getSupabaseUrl } from './staffAuthApi';

interface PrayerRequestRow {
  id: string;
  content: string;
  name?: string | null;
  submitted_by: string;
  submitted_at: string;
  is_anonymous: boolean;
  status: PrayerRequest['status'];
}

interface ConvictionRow {
  id: string;
  content: string;
  name?: string | null;
  submitted_at: string;
  approved: boolean;
  approved_by?: string | null;
}

interface ThanksgivingRow {
  id: string;
  content: string;
  name?: string | null;
  submitted_by: string;
  submitted_at: string;
  is_anonymous: boolean;
}

export interface CommunityWallPayload {
  prayerRequests: PrayerRequest[];
  convictions: Conviction[];
  thanksgivings: Thanksgiving[];
}

const parseError = async (response: Response): Promise<string> => {
  try {
    const data = await response.json() as { error?: string; message?: string };
    return data.error || data.message || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

const baseHeaders = async (): Promise<Record<string, string>> => {
  const supabaseKey = getSupabaseAnonKey();
  const accessToken = await getSupabaseAccessToken();
  const headers: Record<string, string> = {
    apikey: supabaseKey,
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
};

const requestJson = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const supabaseUrl = getSupabaseUrl();
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...(await baseHeaders()),
      Accept: 'application/json',
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return await response.json() as T;
};

const requestNoContent = async (path: string, init: RequestInit = {}): Promise<void> => {
  const supabaseUrl = getSupabaseUrl();
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...(await baseHeaders()),
      Prefer: 'return=minimal',
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
};

const toPrayerRequest = (row: PrayerRequestRow): PrayerRequest => ({
  id: row.id,
  content: row.content,
  name: row.name || undefined,
  submittedBy: row.submitted_by,
  submittedAt: row.submitted_at,
  isAnonymous: row.is_anonymous,
  status: row.status,
});

const toConviction = (row: ConvictionRow): Conviction => ({
  id: row.id,
  content: row.content,
  name: row.name || undefined,
  submittedAt: row.submitted_at,
  approved: row.approved,
  approvedBy: row.approved_by || undefined,
});

const toThanksgiving = (row: ThanksgivingRow): Thanksgiving => ({
  id: row.id,
  content: row.content,
  name: row.name || undefined,
  submittedBy: row.submitted_by,
  submittedAt: row.submitted_at,
  isAnonymous: row.is_anonymous,
});

export const fetchCommunityWall = async (): Promise<CommunityWallPayload> => {
  const [prayerRows, convictionRows, thanksgivingRows] = await Promise.all([
    requestJson<PrayerRequestRow[]>(
      'community_prayer_requests?select=id,content,name,submitted_by,submitted_at,is_anonymous,status&order=submitted_at.desc'
    ),
    requestJson<ConvictionRow[]>(
      'community_convictions?select=id,content,name,submitted_at,approved,approved_by&order=submitted_at.desc'
    ),
    requestJson<ThanksgivingRow[]>(
      'community_thanksgivings?select=id,content,name,submitted_by,submitted_at,is_anonymous&order=submitted_at.desc'
    ),
  ]);

  return {
    prayerRequests: prayerRows.map(toPrayerRequest),
    convictions: convictionRows.map(toConviction),
    thanksgivings: thanksgivingRows.map(toThanksgiving),
  };
};

export const createPrayerRequest = async (request: PrayerRequest): Promise<void> => {
  await requestNoContent('community_prayer_requests', {
    method: 'POST',
    body: JSON.stringify({
      id: request.id,
      content: request.content,
      name: request.name || null,
      submitted_by: request.submittedBy,
      submitted_at: request.submittedAt,
      is_anonymous: request.isAnonymous,
      status: request.status,
    }),
  });
};

export const updatePrayerRequestStatus = async (
  id: string,
  status: PrayerRequest['status']
): Promise<void> => {
  await requestNoContent(`community_prayer_requests?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const createConviction = async (conviction: Conviction): Promise<void> => {
  await requestNoContent('community_convictions', {
    method: 'POST',
    body: JSON.stringify({
      id: conviction.id,
      content: conviction.content,
      name: conviction.name || null,
      submitted_at: conviction.submittedAt,
      approved: false,
      approved_by: null,
    }),
  });
};

export const updateConvictionApproval = async (
  id: string,
  approvedBy: string
): Promise<void> => {
  await requestNoContent(`community_convictions?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      approved: true,
      approved_by: approvedBy,
    }),
  });
};

export const deleteConviction = async (id: string): Promise<void> => {
  await requestNoContent(`community_convictions?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
};

export const createThanksgiving = async (thanksgiving: Thanksgiving): Promise<void> => {
  await requestNoContent('community_thanksgivings', {
    method: 'POST',
    body: JSON.stringify({
      id: thanksgiving.id,
      content: thanksgiving.content,
      name: thanksgiving.name || null,
      submitted_by: thanksgiving.submittedBy,
      submitted_at: thanksgiving.submittedAt,
      is_anonymous: thanksgiving.isAnonymous,
    }),
  });
};
