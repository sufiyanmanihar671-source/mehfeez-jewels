import { fail, redirect } from '@sveltejs/kit';
import { isProfileComplete, safeNext } from '$lib/server/auth';
import { businessProfileSchema, fieldErrors, formToObject } from '$lib/server/validation';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(303, '/login?next=/account/complete');
  const next = safeNext(url.searchParams.get('next'), '/account');
  if (isProfileComplete(locals.profile)) redirect(303, next);
  return { next };
};

export const actions: Actions = {
  default: async ({ request, locals, url }) => {
    if (!locals.user) redirect(303, '/login');
    const form = await request.formData();
    const raw = formToObject(form);
    if (form.get('terms') !== 'on') {
      return fail(400, { values: raw, errors: { terms: 'Please confirm you are registering as a business buyer.' } });
    }
    const parsed = businessProfileSchema.safeParse(raw);
    if (!parsed.success) return fail(400, { values: raw, errors: fieldErrors(parsed.error) });

    // RLS: only the user's own row; the DB trigger blocks status/role changes.
    const { error } = await locals.supabase.from('profiles').update(parsed.data).eq('id', locals.user.id);
    if (error) {
      console.error('complete profile', error.message);
      return fail(400, { values: raw, message: 'Could not save your details. Please try again.' });
    }
    const next = safeNext(String(form.get('next') ?? url.searchParams.get('next') ?? ''), '/account');
    redirect(303, next === '/account' ? '/account?welcome=1' : next);
  }
};
