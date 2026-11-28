import { redirect } from '@sveltejs/kit';
import { isProfileComplete, safeNext } from '$lib/server/auth';
import type { RequestHandler } from './$types';

/** Return point for "Continue with Google" (OAuth PKCE). */
export const GET: RequestHandler = async ({ locals, url }) => {
  const code = url.searchParams.get('code');
  const next = safeNext(url.searchParams.get('next'), '/account');
  if (!code) redirect(303, '/login?error=oauth');

  const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    console.error('google oauth callback', error?.message);
    redirect(303, '/login?error=oauth');
  }

  const { data: profile } = await locals.supabase
    .from('profiles')
    .select('role, company_name, whatsapp, country')
    .eq('id', data.user.id)
    .maybeSingle();

  // New Google users must add their business details before review.
  if (!isProfileComplete(profile)) redirect(303, `/account/complete?next=${encodeURIComponent(next)}`);
  redirect(303, next);
};
