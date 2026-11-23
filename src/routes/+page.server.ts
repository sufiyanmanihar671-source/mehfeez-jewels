import { listHeroSlides, listProducts, sortImages, withCardPrices } from '$lib/server/catalog';
import type { Product } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { supabase, configured, canSeePrices } = locals;

  const [slides, featured, arrivals, recent] = await Promise.all([
    listHeroSlides(supabase, configured),
    listProducts(supabase, configured, { flag: 'is_featured', limit: 8 }),
    listProducts(supabase, configured, { flag: 'is_new_arrival', limit: 8 }),
    listProducts(supabase, configured, { limit: 60 })
  ]);

  // "Our Featured Designs": featured first, topped up with new arrivals, then latest designs.
  const seen = new Set<string>();
  const designs: Product[] = [];
  for (const p of [...featured.products, ...arrivals.products, ...recent.products]) {
    if (designs.length >= 8) break;
    if (!seen.has(p.id)) {
      seen.add(p.id);
      designs.push(p);
    }
  }

  // One real product photo per category (used when a category has no image of its own).
  const categoryPhoto: Record<string, string> = {};
  const gallery: { url: string; name: string; slug: string }[] = [];
  for (const p of recent.products.map(sortImages)) {
    const img = p.images?.[0]?.url;
    if (!img) continue;
    if (p.category?.id && !categoryPhoto[p.category.id]) categoryPhoto[p.category.id] = img;
    if (gallery.length < 8) gallery.push({ url: img, name: p.name, slug: p.slug });
  }

  const prices = await withCardPrices(supabase, canSeePrices, designs);
  return { slides, designs, prices, categoryPhoto, gallery };
};
