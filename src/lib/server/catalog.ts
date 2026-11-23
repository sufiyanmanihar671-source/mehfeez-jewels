import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category, Price, Product } from '$lib/types';

export const PRODUCT_CARD_SELECT =
  'id, name, slug, sku, moq, stock_status, is_featured, is_new_arrival, is_bestseller, created_at, category:categories(id, name, slug), images:product_images(id, url, alt, sort_order)';

export function sortImages<T extends { images?: { sort_order: number }[] }>(p: T): T {
  if (p.images) p.images = [...p.images].sort((a, b) => a.sort_order - b.sort_order);
  return p;
}

const STYLE_SLUGS = new Set([
  'american-diamond-jewellery',
  'victorian-jewellery',
  'heritage-jewellery',
  'south-indian-jewellery',
  'traditional-jewellery',
  'contemporary-jewellery'
]);

export async function listCategories(supabase: SupabaseClient, configured: boolean): Promise<Category[]> {
  if (!configured) return [];
  const base = 'id, name, slug, description, image_url, sort_order, is_active';
  const query = (cols: string) => supabase.from('categories').select(cols).eq('is_active', true).order('sort_order').order('name');
  let { data, error } = await query(`${base}, category_group`);
  if (error) {
    // Before the redesign migration is applied the column does not exist yet.
    ({ data, error } = await query(base));
  }
  if (error) console.error('listCategories', error.message);
  return ((data as unknown as Category[]) ?? []).map((c) => ({
    ...c,
    category_group: c.category_group ?? (STYLE_SLUGS.has(c.slug) ? 'style' : 'type')
  }));
}

export async function listHeroSlides(supabase: SupabaseClient, configured: boolean) {
  if (!configured) return [];
  const { data, error } = await supabase
    .from('hero_slides')
    .select('id, image_url, mobile_image_url, eyebrow, title, subtitle, cta_label, cta_href, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order')
    .order('created_at');
  if (error) return []; // table not created yet
  return (data as import('$lib/types').HeroSlide[]) ?? [];
}

export interface ProductQuery {
  categoryId?: string;
  search?: string;
  flag?: 'is_featured' | 'is_new_arrival' | 'is_bestseller';
  limit?: number;
  offset?: number;
  sort?: 'newest' | 'name';
}

export async function listProducts(
  supabase: SupabaseClient,
  configured: boolean,
  q: ProductQuery = {}
): Promise<{ products: Product[]; total: number }> {
  if (!configured) return { products: [], total: 0 };
  let query = supabase.from('products').select(PRODUCT_CARD_SELECT, { count: 'exact' }).eq('is_published', true);
  if (q.categoryId) query = query.eq('category_id', q.categoryId);
  if (q.flag) query = query.eq(q.flag, true);
  if (q.search) {
    const s = q.search.replace(/[%_,()*\\]/g, ' ').trim().slice(0, 60);
    if (s) query = query.or(`name.ilike.%${s}%,sku.ilike.%${s}%`);
  }
  query = q.sort === 'name' ? query.order('name') : query.order('sort_order').order('created_at', { ascending: false });
  const limit = q.limit ?? 24;
  const offset = q.offset ?? 0;
  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) console.error('listProducts', error.message);
  return { products: ((data as unknown as Product[]) ?? []).map(sortImages), total: count ?? 0 };
}

/**
 * Fetches wholesale prices using the REQUESTING USER'S session. RLS returns
 * rows only to approved customers and admins; guests are denied outright.
 * The canSeePrices flag only avoids a pointless round trip.
 */
export async function getPrices(
  supabase: SupabaseClient,
  canSeePrices: boolean,
  productIds: string[]
): Promise<Record<string, Price[]>> {
  if (!canSeePrices || productIds.length === 0) return {};
  const { data, error } = await supabase
    .from('product_prices')
    .select('product_id, variant_id, price, currency, price_note')
    .in('product_id', productIds);
  if (error) {
    console.error('getPrices', error.message);
    return {};
  }
  const out: Record<string, Price[]> = {};
  for (const row of (data as Price[]) ?? []) (out[row.product_id] ??= []).push({ ...row, price: Number(row.price) });
  return out;
}

/** Base (non-variant) price, or the lowest variant price. */
export function basePrice(prices: Price[] | undefined): Price | null {
  if (!prices?.length) return null;
  return prices.find((p) => p.variant_id === null) ?? [...prices].sort((a, b) => a.price - b.price)[0];
}

/** Attach a single display price to each product card (only when allowed). */
export async function withCardPrices(
  supabase: SupabaseClient,
  canSeePrices: boolean,
  products: Product[]
): Promise<Record<string, Price>> {
  const all = await getPrices(supabase, canSeePrices, products.map((p) => p.id));
  const out: Record<string, Price> = {};
  for (const p of products) {
    const bp = basePrice(all[p.id]);
    if (bp) out[p.id] = bp;
  }
  return out;
}

export async function clientKey(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('mj:' + ip));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
