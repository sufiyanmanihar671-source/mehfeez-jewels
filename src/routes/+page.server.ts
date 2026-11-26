import { listHeroSlides, listProducts, sortImages, withCardPrices } from '$lib/server/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { supabase, configured, canSeePrices } = locals;
  const q = (o: Parameters<typeof listProducts>[2]) => listProducts(supabase, configured, o);

  const [slides, fresh, recent] = await Promise.all([
    listHeroSlides(supabase, configured),
    q({ flag: 'is_new_arrival', limit: 6 }),
    q({ limit: 60 })
  ]);

  // One real product photo per category (used when a category has no image of its own).
  const categoryPhoto: Record<string, string> = {};
  const gallery: { url: string; name: string; slug: string }[] = [];
  for (const p of recent.products.map(sortImages)) {
    const img = p.images?.[0]?.url;
    if (!img) continue;
    if (p.category?.id && !categoryPhoto[p.category.id]) categoryPhoto[p.category.id] = img;
    if (gallery.length < 8) gallery.push({ url: img, name: p.name, slug: p.slug });
  }

  // New Arrivals grid: 6 designs (tagged new arrivals, otherwise the latest designs).
  const arrivals = (fresh.products.length ? fresh.products : recent.products).slice(0, 6);

  const prices = await withCardPrices(supabase, canSeePrices, arrivals);
  return { slides, arrivals, arrivalsAreNew: fresh.products.length > 0, prices, categoryPhoto, gallery };
};
