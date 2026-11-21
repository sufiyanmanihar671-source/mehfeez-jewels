import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import type { Actions, PageServerLoad } from './$types';

const STATUSES = ['pending', 'approved', 'rejected'] as const;
const PAGE = 50;

export const load: PageServerLoad = async ({ locals, url }) => {
  const supabase = requireAdmin(locals);
  const status = url.searchParams.get('status') ?? '';
  const q = (url.searchParams.get('q') ?? '').replace(/[%_,()*\\]/g, ' ').trim().slice(0, 60);
  const country = url.searchParams.get('country') ?? '';
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);

  let query = supabase
    .from('profiles')
    .select('id, full_name, company_name, email, whatsapp, country, city, business_type, status, role, created_at', { count: 'exact' })
    .eq('role', 'customer');
  if ((STATUSES as readonly string[]).includes(status)) query = query.eq('status', status);
  if (country) query = query.eq('country', country.slice(0, 80));
  if (q) query = query.or(`full_name.ilike.%${q}%,company_name.ilike.%${q}%,email.ilike.%${q}%,whatsapp.ilike.%${q}%`);
  const { data, count } = await query.order('created_at', { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);

  return { customers: data ?? [], total: count ?? 0, status, q, country, page, pages: Math.max(1, Math.ceil((count ?? 0) / PAGE)) };
};

export const actions: Actions = {
  setStatus: async ({ locals, request }) => {
    const supabase = requireAdmin(locals);
    const form = await request.formData();
    const id = String(form.get('id') ?? '');
    const status = String(form.get('status') ?? '');
    if (!/^[0-9a-f-]{36}$/i.test(id) || !(STATUSES as readonly string[]).includes(status)) return fail(400, { message: 'Invalid request' });
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id).eq('role', 'customer');
    if (error) return fail(400, { message: error.message });
    return { updated: id };
  }
};
