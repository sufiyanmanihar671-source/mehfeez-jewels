import { error } from '@sveltejs/kit';
import { getPrices, listProducts, sortImages, withCardPrices } from '$lib/server/catalog';
import type { Product } from '$lib/types';
import type { PageServerLoad } from './$types';

const BASE =
  'id, name, slug, sku, description, category_id, moq, stock_status, stock_quantity, is_published, is_featured, is_new_arrival, is_bestseller, meta_title, meta_description, sort_order, created_at, category:categories(id, name, slug), images:product_images(id, url, alt, sort_order), variants:product_variants(id, name, sku, stock_status, sort_order)';
const DETAILS = 'colors, sizes, material, finish, stone, weight, set_includes, dimensions, video_url';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.configured) error(404, 'Product not found');
  const find = (cols: string) =>
    locals.supabase.from('products').select(cols).eq('slug', params.slug).eq('is_published', true).maybeSingle();

  // Newest columns first; fall back if a migration (supabase/setup/run-this-now.sql) is not applied yet.
  let { data, error: err } = await find(`${BASE}, ${DETAILS}, color_stock`);
  if (err) ({ data, error: err } = await find(`${BASE}, ${DETAILS}`));
  if (err) ({ data, error: err } = await find(BASE));
  if (err) console.error('product', err.message);
  if (!data) error(404, 'Product not found');

  const product = sortImages(data as unknown as Product);
  product.variants = [...(product.variants ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  product.colors ??= [];
  product.sizes ??= [];
  product.color_stock ??= [];

  // Prices are requested with the visitor's own session: RLS returns rows only for approved customers.
  const prices = (await getPrices(locals.supabase, locals.canSeePrices, [product.id]))[product.id] ?? [];

  const related = product.category_id
    ? (await listProducts(locals.supabase, true, { categoryId: product.category_id, limit: 5 })).products
        .filter((p) => p.id !== product.id)
        .slice(0, 4)
    : [];
  const relatedPrices = await withCardPrices(locals.supabase, locals.canSeePrices, related);

  return { product, prices, related, relatedPrices };
};

