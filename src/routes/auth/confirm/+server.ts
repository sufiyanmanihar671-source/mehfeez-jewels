import { redirect } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';
import { safeNext } from '$lib/server/auth';
import type { RequestHandler } from './$types';

const TYPES: EmailOtpType[] = ['signup', 'email', 'recovery', 'invite', 'magiclink', 'email_change'];

/**
 * Handles links from Supabase auth emails (verification + password recovery).
 * Supports both the token_hash template (recommended for SSR) and the PKCE ?code= flow.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const code = url.searchParams.get('code');
  const next = safeNext(url.searchParams.get('next'), type === 'recovery' ? '/reset-password' : '/account');

  if (tokenHash && type && TYPES.includes(type)) {
    const { error } = await locals.supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) redirect(303, type === 'recovery' ? '/reset-password' : `${next}${next.includes('?') ? '&' : '?'}verified=1`);
  } else if (code) {
    // Default Supabase email templates (PKCE): Supabase has already verified the
    // email before redirecting here with ?code=. The exchange only succeeds in the
    // same browser that registered; on another device the email is still verified,
    // so we ask the user to log in instead of showing an error.
    const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(303, next === '/reset-password' ? next : `${next}${next.includes('?') ? '&' : '?'}verified=1`);
    redirect(303, next === '/reset-password' ? '/forgot-password?expired=1' : '/login?notice=verified');
  }
  redirect(303, '/login?error=link');
};
