import { listHeroSlides, listProducts, sortImages, withCardPrices } from '$lib/server/catalog';
import type { Product } from '$lib/types';
import type { PageServerLoad } from './$types';

const firstImage = (list: Product[]) => list.map(sortImages).find((p) => p.images?.length)?.images?.[0]?.url ?? null;

export const load: PageServerLoad = async ({ locals }) => {
  const { supabase, configured, canSeePrices } = locals;
  const q = (o: Parameters<typeof listProducts>[2]) => listProducts(supabase, configured, o);

  const [slides, fresh, trending, best, featured, premium, exclusive, traditional, recent] = await Promise.all([
    listHeroSlides(supabase, configured),
    q({ flag: 'is_new_arrival', limit: 8 }),
    q({ collection: 'trending', limit: 8 }),
    q({ flag: 'is_bestseller', limit: 8 }),
    q({ flag: 'is_featured', limit: 8 }),
    q({ collection: 'premium', limit: 4 }),
    q({ collection: 'exclusive', limit: 4 }),
    q({ collection: 'traditional', limit: 4 }),
    q({ limit: 60 })
  ]);

  // Product tabs (reference "Featured Products"); empty tabs are hidden on the page.
  const tabs = [
    { key: 'new', label: 'New Arrivals', href: '/collections?show=new', products: fresh.products },
    { key: 'trending', label: 'Trending Designs', href: '/collections?show=trending', products: trending.products },
    { key: 'bestsellers', label: 'Bestselling', href: '/collections?show=bestsellers', products: best.products },
    { key: 'featured', label: 'Featured Wholesale', href: '/collections?show=featured', products: featured.products }
  ];
  // If nothing is tagged yet, still show the latest designs.
  if (tabs.every((t) => !t.products.length) && recent.products.length) {
    tabs[0] = { key: 'latest', label: 'Latest Designs', href: '/collections', products: recent.products.slice(0, 8) };
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

  const collectionPhoto = {
    new: firstImage(fresh.products),
    trending: firstImage(trending.products),
    premium: firstImage(premium.products),
    exclusive: firstImage(exclusive.products),
    traditional: firstImage(traditional.products)
  };

  const all = [...new Map(tabs.flatMap((t) => t.products).map((p) => [p.id, p])).values()];
  const prices = await withCardPrices(supabase, canSeePrices, all);
  return { slides, tabs: tabs.filter((t) => t.products.length), prices, categoryPhoto, collectionPhoto, gallery };
};
