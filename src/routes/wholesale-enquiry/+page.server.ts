import { submitEnquiry } from '$lib/server/enquiry';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const p = locals.profile;
  const defaults: Record<string, string> = p
    ? { full_name: p.full_name, business_name: p.company_name, email: p.email, whatsapp: p.whatsapp, country: p.country }
    : {};
  let product: { id: string; name: string; sku: string } | null = null;
  const sku = url.searchParams.get('product');
  if (sku && locals.configured) {
    const { data } = await locals.supabase
      .from('products')
      .select('id, name, sku')
      .eq('sku', sku.slice(0, 64))
      .maybeSingle();
    product = data;
  }
  return { defaults, product };
};

export const actions: Actions = { default: submitEnquiry };
