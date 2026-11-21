import { requireAdmin } from '$lib/server/admin';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const supabase = requireAdmin(locals);
  const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending').eq('role', 'customer');
  const { count: newEnq } = await supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new');
  return { pendingCount: count ?? 0, newEnquiries: newEnq ?? 0 };
};
