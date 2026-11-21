import { error } from '@sveltejs/kit';
import { getPrices, listProducts, sortImages, withCardPrices } from '$lib/server/catalog';
import { submitEnquiry } from '$lib/server/enquiry';
import type { Product } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.configured) error(404, 'Product not found');
  const { data, error: err } = await locals.supabase
    .from('products')
    .select(
      'id, name, slug, sku, description, category_id, moq, stock_status, stock_quantity, is_published, is_featured, is_new_arrival, is_bestseller, meta_title, meta_description, sort_order, created_at, category:categories(id, name, slug), images:product_images(id, url, alt, sort_order), variants:product_variants(id, name, sku, stock_status, sort_order)'
    )
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle();
  if (err) console.error('product', err.message);
  if (!data) error(404, 'Product not found');
  const product = sortImages(data as unknown as Product);
  product.variants = [...(product.variants ?? [])].sort((a, b) => a.sort_order - b.sort_order);

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

export const actions: Actions = { enquiry: submitEnquiry };
