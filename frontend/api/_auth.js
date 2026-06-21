import crypto from 'node:crypto';

const COOKIE_NAME = 'unicamp_staff_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

const DEFAULT_STAFF_USERS = [
  { id: '1', name: 'Sarah Tan', email: 'comms@camp.sg', password: 'comms2026', role: 'comms' },
  { id: '2', name: 'Pastor David', email: 'pastoral@camp.sg', password: 'pastoral2026', role: 'pastoral' },
  { id: '3', name: 'Admin Lee', email: 'admin@camp.sg', password: 'admin2026', role: 'administrator' },
];

const base64Url = (value) =>
  Buffer.from(value)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');

const getSessionSecret = () =>
  process.env.ADMIN_SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'local-development-session-secret';

const sign = (value) =>
  crypto.createHmac('sha256', getSessionSecret()).update(value).digest('base64url');

const timingSafeEqual = (a, b) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const parseCookies = (req) => {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const index = cookie.indexOf('=');
        if (index === -1) return [cookie, ''];
        return [cookie.slice(0, index), decodeURIComponent(cookie.slice(index + 1))];
      })
  );
};

const publicUser = ({ id, name, email, role }) => ({ id, name, email, role });

export const findStaffUser = (email, password) => {
  const configuredAdmin =
    process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD
      ? [
          {
            id: 'admin-env',
            name: process.env.ADMIN_NAME || 'Administrator',
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: 'administrator',
          },
        ]
      : [];

  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = [...configuredAdmin, ...DEFAULT_STAFF_USERS].find(
    (candidate) =>
      candidate.email.toLowerCase() === normalizedEmail &&
      candidate.password === String(password || '')
  );

  return user ? publicUser(user) : null;
};

export const createSessionToken = (user) => {
  const payload = base64Url(
    JSON.stringify({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    })
  );

  return `${payload}.${sign(payload)}`;
};

const isHttpsRequest = (req) =>
  req.headers['x-forwarded-proto'] === 'https' ||
  req.headers.host?.includes('vercel.app') ||
  process.env.VERCEL === '1';

export const sessionCookie = (req, token) => {
  const secure = isHttpsRequest(req) ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
};

export const clearSessionCookie = (req) => {
  const secure = isHttpsRequest(req) ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
};

export const readStaffSession = (req) => {
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature || !timingSafeEqual(sign(payload), signature)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) return null;

    return publicUser({
      id: session.sub,
      name: session.name,
      email: session.email,
      role: session.role,
    });
  } catch {
    return null;
  }
};

export const canWriteContent = (session) =>
  Boolean(session && ['administrator', 'comms'].includes(session.role));
