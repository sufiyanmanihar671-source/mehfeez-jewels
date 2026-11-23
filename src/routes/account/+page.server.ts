import { fail, redirect } from '@sveltejs/kit';
import { businessProfileSchema, fieldErrors, formToObject } from '$lib/server/validation';
import { isProfileComplete } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(303, '/login?next=/account');
  // Accounts created with Google must add business details first (admins exempt).
  if (!locals.isAdmin && !isProfileComplete(locals.profile)) redirect(303, '/account/complete');
  const { data: enquiries } = await locals.supabase
    .from('enquiries')
    .select('id, message, status, created_at, product:products(name, sku, slug)')
    .eq('user_id', locals.user.id)
    .order('created_at', { ascending: false })
    .limit(20);
  return { enquiries: enquiries ?? [], emailConfirmed: !!locals.user.email_confirmed_at };
};

export const actions: Actions = {
  update: async ({ request, locals }) => {
    if (!locals.user) redirect(303, '/login');
    const raw = formToObject(await request.formData());
    const parsed = businessProfileSchema.safeParse(raw);
    if (!parsed.success) return fail(400, { values: raw, errors: fieldErrors(parsed.error) });

    // RLS limits this to the user's own row; a DB trigger blocks status/role changes.
    const { error } = await locals.supabase.from('profiles').update(parsed.data).eq('id', locals.user.id);
    if (error) {
      console.error('profile update', error.message);
      return fail(400, { values: raw, message: 'Could not save your details. Please try again.' });
    }
    return { saved: true };
  }
};
