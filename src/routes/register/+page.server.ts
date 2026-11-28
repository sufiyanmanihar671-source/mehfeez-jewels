import { fail, redirect } from '@sveltejs/kit';
import { fieldErrors, formToObject, isBot, registerSchema, safeValues } from '$lib/server/validation';
import { authMessage, siteOrigin } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) redirect(303, '/account');
};

export const actions: Actions = {
  default: async ({ request, locals, url }) => {
    const form = await request.formData();
    const raw = formToObject(form);
    if (isBot(form)) return { success: true, email: '' };
    if (!locals.configured) return fail(503, { values: safeValues(raw), message: 'Registration is unavailable until Supabase is connected.' });
    if (form.get('terms') !== 'on') {
      return fail(400, { values: safeValues(raw), errors: { terms: 'Please tick this box to continue.' } });
    }

    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) return fail(400, { values: safeValues(raw), errors: fieldErrors(parsed.error) });
    const { email, password, ...business } = parsed.data;

    const { data, error } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        data: business,
        emailRedirectTo: `${siteOrigin(url)}/auth/confirm?next=/account`
      }
    });
    if (error) return fail(400, { values: safeValues(raw), message: authMessage(error) });

    // With email confirmation enabled (recommended), no session is returned until the email is verified.
    if (data.session) redirect(303, '/account?welcome=1');
    return { success: true, email };
  }
};
