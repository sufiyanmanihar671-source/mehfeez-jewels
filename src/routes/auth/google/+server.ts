import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { safeNext } from '$lib/server/auth';
import type { RequestHandler } from './$types';

/**
 * Starts "Continue with Google". This is a plain link (GET), not a form post:
 * the site's CSP `form-action 'self'` would block a form that redirects to Google.
 * The PKCE code verifier is stored in an httpOnly cookie by the server client,
 * so the callback must come back to this same host (url.origin).
 */
export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.configured || env.PUBLIC_GOOGLE_LOGIN !== 'true') redirect(303, '/login?error=oauth');
  if (locals.user) redirect(303, '/account');

  const next = safeNext(url.searchParams.get('next'), '/account');
  const { data, error } = await locals.supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { prompt: 'select_account' },
      skipBrowserRedirect: true
    }
  });
  if (error || !data.url) {
    console.error('google oauth start', error?.message);
    redirect(303, '/login?error=oauth');
  }
  redirect(303, data.url);
};
