import { requireAdmin } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const supabase = requireAdmin(locals);
  const [{ data: stats }, { data: pending }, { data: enquiries }] = await Promise.all([
    supabase.rpc('admin_stats'),
    supabase
      .from('profiles')
      .select('id, full_name, company_name, country, created_at')
      .eq('status', 'pending')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('enquiries').select('id, full_name, business_name, country, status, created_at').order('created_at', { ascending: false }).limit(6)
  ]);
  return { stats: (stats ?? {}) as Record<string, number>, pending: pending ?? [], enquiries: enquiries ?? [] };
};
