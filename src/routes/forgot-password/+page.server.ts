import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { siteOrigin } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals, url }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    if (!z.email().safeParse(email).success) return fail(400, { email, message: 'Enter a valid email address.' });
    if (!locals.configured) return fail(503, { email, message: 'Password reset is unavailable until Supabase is connected.' });

    const { error } = await locals.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteOrigin(url)}/auth/confirm?next=/reset-password`
    });
    if (error && error.code?.startsWith('over_')) {
      return fail(429, { email, message: 'Too many requests. Please wait a few minutes and try again.' });
    }
    // Same response whether or not the account exists (prevents email enumeration).
    return { sent: true, email };
  }
};
