import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { requireAdmin, setPrice } from '$lib/server/admin';
import type { Actions, PageServerLoad } from './$types';

const PAGE = 50;

export const load: PageServerLoad = async ({ locals, url }) => {
  const supabase = requireAdmin(locals);
  const q = (url.searchParams.get('q') ?? '').replace(/[%_,()*\\]/g, ' ').trim().slice(0, 60);
  const category = url.searchParams.get('category') ?? '';
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);

  let query = supabase
    .from('products')
    .select('id, name, slug, sku, moq, stock_status, stock_quantity, is_published, is_featured, is_new_arrival, is_bestseller, category:categories(name), images:product_images(url, sort_order), prices:product_prices(price, currency, variant_id)', { count: 'exact' });
  if (q) query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
  if (category === 'none') query = query.is('category_id', null);
  else if (/^[0-9a-f-]{36}$/i.test(category)) query = query.eq('category_id', category);
  const { data, count } = await query.order('created_at', { ascending: false }).range((page - 1) * PAGE, page * PAGE - 1);
  const { data: categories } = await supabase.from('categories').select('id, name').order('sort_order');

  return { products: data ?? [], total: count ?? 0, q, category, page, pages: Math.max(1, Math.ceil((count ?? 0) / PAGE)), allCategories: categories ?? [] };
};

const quickSchema = z.object({
  id: z.string().uuid(),
  price: z.string().trim().optional(),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).default('INR'),
  moq: z.coerce.number().int().min(1).max(100000),
  stock_status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'made_to_order']),
  stock_quantity: z.string().trim().optional()
});

export const actions: Actions = {
  quick: async ({ locals, request }) => {
    const supabase = requireAdmin(locals);
    const parsed = quickSchema.safeParse(Object.fromEntries(await request.formData()));
    if (!parsed.success) return fail(400, { message: 'Check the price, MOQ and stock values.' });
    const d = parsed.data;
    const qty = d.stock_quantity ? Number(d.stock_quantity) : null;
    if (qty !== null && (!Number.isInteger(qty) || qty < 0)) return fail(400, { message: 'Stock quantity must be a whole number.' });

    const { error } = await supabase.from('products').update({ moq: d.moq, stock_status: d.stock_status, stock_quantity: qty }).eq('id', d.id);
    if (error) return fail(400, { message: error.message });

    const price = d.price ? Number(d.price) : null;
    if (price !== null && (!Number.isFinite(price) || price < 0)) return fail(400, { message: 'Price must be a positive number.' });
    const { data: current } = await supabase.from('product_prices').select('price_note').eq('product_id', d.id).is('variant_id', null).maybeSingle();
    const pe = await setPrice(supabase, d.id, null, price, d.currency, current?.price_note ?? null);
    if (pe) return fail(400, { message: pe.message });
    return { quickSaved: d.id };
  }
};
