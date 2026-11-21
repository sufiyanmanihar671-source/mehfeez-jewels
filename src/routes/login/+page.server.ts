import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { authMessage, safeNext } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.user) redirect(303, safeNext(url.searchParams.get('next')));
  return { next: safeNext(url.searchParams.get('next'), '') };
};

const schema = z.object({ email: z.string().trim().toLowerCase().pipe(z.email()), password: z.string().min(1).max(200) });

export const actions: Actions = {
  default: async ({ request, locals, url }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '');
    const parsed = schema.safeParse({ email, password: form.get('password') });
    if (!parsed.success) return fail(400, { email, message: 'Enter your email and password.' });
    if (!locals.configured) return fail(503, { email, message: 'Login is unavailable until Supabase is connected.' });

    const { error } = await locals.supabase.auth.signInWithPassword(parsed.data);
    if (error) return fail(400, { email, message: authMessage(error) });
    redirect(303, safeNext(String(form.get('next') ?? url.searchParams.get('next') ?? '')));
  }
};
