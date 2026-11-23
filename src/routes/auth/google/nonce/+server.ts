import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const NONCE_COOKIE = 'mj_gnonce';

/**
 * Issues a one-time nonce for Google sign-in (replay protection).
 * The RAW nonce stays in an httpOnly cookie; only its SHA-256 hash is given to
 * Google, which embeds it in the ID token. Supabase checks hash(raw) == token.nonce.
 */
export const GET: RequestHandler = async ({ cookies, url }) => {
  const raw = crypto.randomUUID() + crypto.randomUUID();
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  const hashed = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  cookies.set(NONCE_COOKIE, raw, {
    path: '/auth/google',
    httpOnly: true,
    sameSite: 'lax',
    secure: url.protocol === 'https:',
    maxAge: 60 * 15
  });
  return json({ nonce: hashed }, { headers: { 'Cache-Control': 'private, no-store' } });
};
