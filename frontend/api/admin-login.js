import { createSessionToken, findStaffUser, sessionCookie } from './_auth.js';

const readJsonBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = await readJsonBody(req);
    const user = findStaffUser(email, password);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    res.setHeader('Set-Cookie', sessionCookie(req, createSessionToken(user)));
    return res.status(200).json({ user });
  } catch {
    return res.status(400).json({ error: 'Invalid login request' });
  }
}
