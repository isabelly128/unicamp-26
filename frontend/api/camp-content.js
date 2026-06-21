import { canWriteContent, readStaffSession } from './_auth.js';

const CONTENT_ID = 'unicamp-2026';
const DEFAULT_SUPABASE_URL = 'https://lijbxbvitmhrefmnyuys.supabase.co';

const getSupabaseConfig = () => {
  const url = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return { url, key };
};

const supabaseHeaders = (key) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
});

const readJsonBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

const getCampContent = async () => {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(
    `${url}/rest/v1/camp_content?id=eq.${encodeURIComponent(CONTENT_ID)}&select=content,updated_at,updated_by`,
    { headers: supabaseHeaders(key) }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase read failed: ${response.status} ${detail}`);
  }

  const rows = await response.json();
  const row = rows[0];

  return {
    content: row?.content || null,
    updatedAt: row?.updated_at || null,
    updatedBy: row?.updated_by || null,
  };
};

const saveCampContent = async (content, updatedBy) => {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/camp_content?on_conflict=id`, {
    method: 'POST',
    headers: {
      ...supabaseHeaders(key),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({
      id: CONTENT_ID,
      content,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase write failed: ${response.status} ${detail}`);
  }

  const rows = await response.json();
  return rows[0];
};

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await getCampContent());
    }

    if (req.method === 'PUT') {
      const session = readStaffSession(req);
      if (!session) return res.status(401).json({ error: 'Staff login required' });
      if (!canWriteContent(session)) return res.status(403).json({ error: 'Insufficient permissions' });

      const { content } = await readJsonBody(req);
      if (!content || typeof content !== 'object' || Array.isArray(content)) {
        return res.status(400).json({ error: 'Missing content payload' });
      }

      return res.status(200).json({
        content: await saveCampContent(content, session.email),
      });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unexpected server error',
    });
  }
}
