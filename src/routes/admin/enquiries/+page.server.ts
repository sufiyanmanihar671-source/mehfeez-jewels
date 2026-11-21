import { requireAdmin } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

const STATUSES = ['new', 'in_progress', 'responded', 'closed'];
const PAGE = 50;

export const load: PageServerLoad = async ({ locals, url }) => {
  const supabase = requireAdmin(locals);
  const status = url.searchParams.get('status') ?? '';
  const q = (url.searchParams.get('q') ?? '').replace(/[%_,()*\\]/g, ' ').trim().slice(0, 60);
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  let query = supabase
    .from('enquiries')
    .select('id, full_name, business_name, email, whatsapp, country, categories, estimated_quantity, status, created_at, product:products(name, sku)', { count: 'exact' });
  if (STATUSES.includes(status)) query = query.eq('status', status);
  if (q) query = query.or(`full_name.ilike.%${q}%,business_name.ilike.%${q}%,email.ilike.%${q}%,country.ilike.%${q}%`);
  const { data, count } = await query.order('created_at', { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
  return { enquiries: data ?? [], total: count ?? 0, status, q, page, pages: Math.max(1, Math.ceil((count ?? 0) / PAGE)) };
};
