import { error, json } from '@sveltejs/kit';
import { isProfileComplete, safeNext } from '$lib/server/auth';
import type { RequestHandler } from './$types';

const NONCE_COOKIE = 'mj_gnonce';

/**
 * Completes Google sign-in from Google's own button (Google Identity Services).
 * Google shows "continue to mehfeezjewels.com" because the ID token is issued
 * for this site; Supabase verifies the token (signature, audience, nonce) and
 * creates the session cookies here.
 */
export const POST: RequestHandler = async ({ request, locals, cookies, url }) => {
  // JSON POST: browsers send a CORS preflight for cross-site JSON, but check the origin anyway.
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) error(403, 'Forbidden');
  if (!locals.configured) error(503, 'Sign-in unavailable');

  let body: { credential?: unknown; next?: unknown };
  try {
    body = await request.json();
  } catch {
    error(400, 'Bad request');
  }
  const token = typeof body.credential === 'string' ? body.credential : '';
  if (!token || token.length > 5000) error(400, 'Bad request');

  const nonce = cookies.get(NONCE_COOKIE);
  cookies.delete(NONCE_COOKIE, { path: '/auth/google' });
  if (!nonce) return json({ ok: false, message: 'Your sign-in session expired. Please try again.' }, { status: 400 });

  const { data, error: err } = await locals.supabase.auth.signInWithIdToken({ provider: 'google', token, nonce });
  if (err || !data.user) {
    console.error('google id token sign-in', err?.message);
    return json({ ok: false, message: 'Google sign-in could not be completed. Please try again.' }, { status: 400 });
  }

  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('role, company_name, whatsapp, country')
    .eq('id', data.user.id)
    .maybeSingle();

  const next = safeNext(typeof body.next === 'string' ? body.next : null, '/account');
  const redirect = isProfileComplete(profile) ? next : `/account/complete?next=${encodeURIComponent(next)}`;
  return json({ ok: true, redirect }, { headers: { 'Cache-Control': 'private, no-store' } });
};
