import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { redirect, type Handle } from '@sveltejs/kit';
import type { Profile } from '$lib/types';

const PLACEHOLDER_URL = 'http://127.0.0.1:54321';

export const handle: Handle = async ({ event, resolve }) => {
  const url = env.PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
  const key = env.PUBLIC_SUPABASE_ANON_KEY || 'not-configured';
  event.locals.configured = Boolean(env.PUBLIC_SUPABASE_URL && env.PUBLIC_SUPABASE_ANON_KEY);

  event.locals.supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookies) => {
        for (const { name, value, options } of cookies) {
          event.cookies.set(name, value, { ...options, path: '/', httpOnly: true, sameSite: 'lax' });
        }
      }
    }
  });

  event.locals.user = null;
  event.locals.profile = null;
  event.locals.canSeePrices = false;
  event.locals.isAdmin = false;

  if (event.locals.configured) {
    // getUser() validates the JWT with Supabase Auth (never trust the cookie alone).
    const { data, error } = await event.locals.supabase.auth.getUser().catch(() => ({ data: { user: null }, error: true }));
    if (!error && data.user) {
      event.locals.user = data.user;
      const { data: profile } = await event.locals.supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle<Profile>();
      event.locals.profile = profile ?? null;
      event.locals.isAdmin = profile?.role === 'admin';
      event.locals.canSeePrices = profile?.role === 'admin' || profile?.status === 'approved';
    }
  }

  const path = event.url.pathname;
  if (path.startsWith('/admin') && !event.locals.isAdmin) {
    if (!event.locals.user) redirect(303, `/login?next=${encodeURIComponent(path)}`);
    redirect(303, '/account');
  }
  if (path.startsWith('/account') && !event.locals.user) {
    redirect(303, `/login?next=${encodeURIComponent(path)}`);
  }

  const response = await resolve(event, {
    filterSerializedResponseHeaders: (name) => name === 'content-range' || name === 'x-supabase-api-version'
  });

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Pages differ per visitor (guest / pending / approved), and the Cloudflare
  // edge cache keys only on URL. So dynamic pages must never be shared-cached:
  // logged-in responses may contain prices -> no-store; guest pages -> private.
  // Static assets (/_app/immutable) are cached at the edge by _headers instead;
  // user-independent endpoints (sitemap/robots) set their own public caching.
  if (event.locals.user || path.startsWith('/admin') || path.startsWith('/account')) {
    response.headers.set('Cache-Control', 'private, no-store');
  } else if (!response.headers.has('Cache-Control')) {
    response.headers.set('Cache-Control', 'private, no-cache');
  }
  response.headers.append('Vary', 'Cookie');
  return response;
};
