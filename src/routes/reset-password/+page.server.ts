import { fail, redirect } from '@sveltejs/kit';
import { passwordSchema } from '$lib/server/validation';
import { authMessage } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // The recovery link (via /auth/confirm) signs the user in; without a session this page is useless.
  if (!locals.user) redirect(303, '/forgot-password');
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) redirect(303, '/forgot-password');
    const form = await request.formData();
    const password = String(form.get('password') ?? '');
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) return fail(400, { message: parsed.error.issues[0].message });
    if (password !== form.get('confirm_password')) return fail(400, { message: 'Passwords do not match.' });

    const { error } = await locals.supabase.auth.updateUser({ password });
    if (error) return fail(400, { message: authMessage(error) });
    redirect(303, '/account?password=updated');
  }
};
