import { error, fail, redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import { businessProfileSchema, fieldErrors, formToObject } from '$lib/server/validation';
import type { Profile } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const supabase = requireAdmin(locals);
  const { data } = await supabase.from('profiles').select('*').eq('id', params.id).maybeSingle<Profile>();
  if (!data) error(404, 'Customer not found');
  const { data: enquiries } = await supabase
    .from('enquiries')
    .select('id, message, status, created_at')
    .or(`user_id.eq.${data.id},email.eq."${data.email.replace(/["\\]/g, '')}"`)
    .order('created_at', { ascending: false })
    .limit(20);
  return { customer: data, enquiries: enquiries ?? [] };
};

export const actions: Actions = {
  status: async ({ locals, request, params }) => {
    const supabase = requireAdmin(locals);
    const form = await request.formData();
    const status = String(form.get('status'));
    if (!['pending', 'approved', 'rejected'].includes(status)) return fail(400, { message: 'Invalid status' });
    const admin_note = String(form.get('admin_note') ?? '').trim().slice(0, 2000) || null;
    const { error: err } = await supabase.from('profiles').update({ status, admin_note }).eq('id', params.id);
    if (err) return fail(400, { message: err.message });
    return { saved: 'status' };
  },
  details: async ({ locals, request, params }) => {
    const supabase = requireAdmin(locals);
    const raw = formToObject(await request.formData());
    const parsed = businessProfileSchema.safeParse(raw);
    if (!parsed.success) return fail(400, { values: raw, errors: fieldErrors(parsed.error) });
    const { error: err } = await supabase.from('profiles').update(parsed.data).eq('id', params.id);
    if (err) return fail(400, { message: err.message });
    return { saved: 'details' };
  },
  delete: async ({ locals, params }) => {
    const supabase = requireAdmin(locals);
    if (params.id === locals.user?.id) return fail(400, { message: 'You cannot delete your own account here.' });
    // Removes the business profile (and therefore all price access). The auth login itself
    // can be removed from Supabase Dashboard > Authentication if required.
    const { error: err } = await supabase.from('profiles').delete().eq('id', params.id).eq('role', 'customer');
    if (err) return fail(400, { message: err.message });
    redirect(303, '/admin/customers');
  }
};
