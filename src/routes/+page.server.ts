import { listHeroSlides, listProducts, sortImages, withCardPrices } from '$lib/server/catalog';
import type { Product } from '$lib/types';
import type { PageServerLoad } from './$types';

const firstImage = (list: Product[]) => list.map(sortImages).find((p) => p.images?.length)?.images?.[0]?.url ?? null;

export const load: PageServerLoad = async ({ locals }) => {
  const { supabase, configured, canSeePrices } = locals;
  const q = (o: Parameters<typeof listProducts>[2]) => listProducts(supabase, configured, o);

  const [slides, fresh, trending, premium, exclusive, traditional, recent] = await Promise.all([
    listHeroSlides(supabase, configured),
    q({ flag: 'is_new_arrival', limit: 6 }),
    q({ collection: 'trending', limit: 4 }),
    q({ collection: 'premium', limit: 4 }),
    q({ collection: 'exclusive', limit: 4 }),
    q({ collection: 'traditional', limit: 4 }),
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

  const collectionPhoto = {
    new: firstImage(fresh.products),
    trending: firstImage(trending.products),
    premium: firstImage(premium.products),
    exclusive: firstImage(exclusive.products),
    traditional: firstImage(traditional.products)
  };

  // New Arrivals grid: 6 designs (tagged new arrivals, otherwise the latest designs).
  const arrivals = (fresh.products.length ? fresh.products : recent.products).slice(0, 6);

  const prices = await withCardPrices(supabase, canSeePrices, arrivals);
  return { slides, arrivals, arrivalsAreNew: fresh.products.length > 0, prices, categoryPhoto, collectionPhoto, gallery };
};
