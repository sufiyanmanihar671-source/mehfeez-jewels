import { error, fail, redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import type { Enquiry } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const supabase = requireAdmin(locals);
  const { data } = await supabase.from('enquiries').select('*, product:products(name, sku, slug)').eq('id', params.id).maybeSingle();
  if (!data) error(404, 'Enquiry not found');
  return { enquiry: data as Enquiry & { user_id: string | null } };
};

export const actions: Actions = {
  update: async ({ locals, request, params }) => {
    const supabase = requireAdmin(locals);
    const form = await request.formData();
    const status = String(form.get('status'));
    if (!['new', 'in_progress', 'responded', 'closed'].includes(status)) return fail(400, { message: 'Invalid status' });
    const admin_notes = String(form.get('admin_notes') ?? '').trim().slice(0, 5000) || null;
    const { error: e } = await supabase.from('enquiries').update({ status, admin_notes }).eq('id', params.id);
    if (e) return fail(400, { message: e.message });
    return { saved: true };
  },
  delete: async ({ locals, params }) => {
    const supabase = requireAdmin(locals);
    const { error: e } = await supabase.from('enquiries').delete().eq('id', params.id);
    if (e) return fail(400, { message: e.message });
    redirect(303, '/admin/enquiries');
  }
};
