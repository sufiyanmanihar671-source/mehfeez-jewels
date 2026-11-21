import { listProducts, withCardPrices } from '$lib/server/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { supabase, configured, canSeePrices } = locals;
  const [featured, arrivals, bestsellers] = await Promise.all([
    listProducts(supabase, configured, { flag: 'is_featured', limit: 8 }),
    listProducts(supabase, configured, { flag: 'is_new_arrival', limit: 8 }),
    listProducts(supabase, configured, { flag: 'is_bestseller', limit: 8 })
  ]);
  const all = [...featured.products, ...arrivals.products, ...bestsellers.products];
  const unique = [...new Map(all.map((p) => [p.id, p])).values()];
  const prices = await withCardPrices(supabase, canSeePrices, unique);
  return {
    featured: featured.products,
    arrivals: arrivals.products,
    bestsellers: bestsellers.products,
    prices
  };
};

import { submitEnquiry } from '$lib/server/enquiry';
import type { Actions } from './$types';

export const actions: Actions = {
  enquiry: submitEnquiry
};
