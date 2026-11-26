import type { SupabaseClient } from '@supabase/supabase-js';
import { listProducts, withCardPrices, type ProductQuery } from './catalog';

export const PAGE_SIZE = 24;

const FLAGS: Record<string, ProductQuery['flag']> = {
  featured: 'is_featured',
  new: 'is_new_arrival',
  bestsellers: 'is_bestseller'
};
export const COLLECTIONS = ['trending', 'premium', 'exclusive', 'traditional'];

/** Shared loader for /collections and /categories/[slug]. */
export async function loadListing(
  locals: { supabase: SupabaseClient; configured: boolean; canSeePrices: boolean },
  url: URL,
  categoryId?: string
) {
  const page = Math.max(1, Math.min(500, Number(url.searchParams.get('page')) || 1));
  const q = (url.searchParams.get('q') ?? '').slice(0, 60);
  const show = url.searchParams.get('show') ?? '';
  const sort = url.searchParams.get('sort') === 'name' ? 'name' : 'newest';
  const { products, total } = await listProducts(locals.supabase, locals.configured, {
    categoryId,
    search: q || undefined,
    flag: FLAGS[show],
    collection: COLLECTIONS.includes(show) ? show : undefined,
    sort,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE
  });
  const prices = await withCardPrices(locals.supabase, locals.canSeePrices, products);
  return { products, prices, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), q, show, sort };
}
