import { listProducts, withCardPrices } from '$lib/server/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { supabase, configured, canSeePrices } = locals;
  const [arrivals, featured] = await Promise.all([
    listProducts(supabase, configured, { flag: 'is_new_arrival', limit: 8 }),
    listProducts(supabase, configured, { flag: 'is_featured', limit: 6 })
  ]);
  // Product photos shown in the hero showcase: featured designs first, then new arrivals.
  const showcase = [...featured.products, ...arrivals.products]
    .filter((p) => p.images?.length)
    .filter((p, i, a) => a.findIndex((q) => q.id === p.id) === i)
    .slice(0, 3)
    .map((p) => ({ name: p.name, slug: p.slug, url: p.images![0].url }));
  const prices = await withCardPrices(supabase, canSeePrices, arrivals.products);
  return { arrivals: arrivals.products, showcase, prices };
};
