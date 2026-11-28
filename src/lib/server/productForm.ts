import { fail } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fieldErrors, formToObject, priceSchema, productSchema } from './validation';
import { dbFail, setPrice, uploadImage } from './admin';
import { slugify } from '$lib/format';

const FLAGS = ['is_published', 'is_featured', 'is_new_arrival', 'is_bestseller'];
const COLOR_FIELDS = ['cs_name', 'cs_status', 'cs_qty'];
const STATUS_RANK = ['in_stock', 'low_stock', 'made_to_order', 'out_of_stock'];

/**
 * Colour rows from the admin form -> color_stock list, plus the plain colour list
 * and the product's overall stock (best status of any colour, total quantity).
 */
function applyColorRows(raw: Record<string, unknown>) {
  const names = (raw.cs_name as string[]) ?? [];
  const statuses = (raw.cs_status as string[]) ?? [];
  const qtys = (raw.cs_qty as string[]) ?? [];
  for (const k of COLOR_FIELDS) delete raw[k];
  const seen = new Set<string>();
  const rows = names
    .map((n, i) => ({ name: n.trim(), status: statuses[i] || 'in_stock', qtyRaw: (qtys[i] ?? '').trim() }))
    .filter((r) => r.name && !seen.has(r.name.toLowerCase()) && seen.add(r.name.toLowerCase()))
    .map((r) => ({ name: r.name, status: r.status, qty: r.qtyRaw === '' ? null : Math.max(0, Math.floor(Number(r.qtyRaw) || 0)) }));
  raw.color_stock = rows;
  raw.colors = rows.map((r) => r.name).join(', ');
  if (rows.length) {
    raw.stock_status = STATUS_RANK.find((s) => rows.some((r) => r.status === s)) ?? 'in_stock';
    raw.stock_quantity = rows.every((r) => r.qty !== null) ? String(rows.reduce((t, r) => t + (r.qty ?? 0), 0)) : '';
  }
}

/** Validates and saves product fields + base wholesale price. Returns the product id or an ActionFailure. */
export async function saveProduct(supabase: SupabaseClient, form: FormData, id: string | null) {
  const raw = formToObject(form, ['collections', ...COLOR_FIELDS], FLAGS);
  applyColorRows(raw);
  if (!raw.slug && typeof raw.name === 'string') raw.slug = slugify(raw.name);
  const parsed = productSchema.safeParse(raw);
  const priceParsed = priceSchema.safeParse({ price: raw.price, currency: raw.currency || 'INR', price_note: raw.price_note });
  if (!parsed.success || !priceParsed.success) {
    return fail(400, {
      values: raw,
      errors: { ...(parsed.success ? {} : fieldErrors(parsed.error)), ...(priceParsed.success ? {} : fieldErrors(priceParsed.error)) }
    });
  }

  let productId = id;
  const write = async (row: Record<string, unknown>) =>
    id
      ? { ...(await supabase.from('products').update(row).eq('id', id)), data: { id } }
      : await supabase.from('products').insert(row).select('id').single();
  // If newer columns don't exist yet (supabase/setup/run-this-now.sql not run), drop them and retry
  // so the product still saves.
  let row: Record<string, unknown> = { ...parsed.data };
  let res = await write(row);
  for (let i = 0; i < 12 && res.error; i++) {
    const m = /'([a-z_]+)' column/.exec(res.error.message) ?? /column (?:[a-z_]+\.)?"?([a-z_]+)"? does not exist/.exec(res.error.message);
    if (!m || !(m[1] in row)) break;
    const { [m[1]]: _drop, ...rest } = row;
    row = rest;
    res = await write(row);
  }
  if (res.error) return dbFail(res.error, raw);
  productId = (res.data as { id: string }).id;

  const p = priceParsed.data;
  const err = await setPrice(supabase, productId!, null, p.price, p.currency, p.price_note);
  if (err) return fail(400, { values: raw, message: `Product saved, but the price could not be saved: ${err.message}` });
  return { id: productId! };
}

/** Uploads photos for a product (appended after existing ones). Returns an error message or null. */
export async function addProductImages(supabase: SupabaseClient, productId: string, files: File[], alt: string | null): Promise<string | null> {
  if (files.length > 10) return 'Upload up to 10 photos at a time.';
  const { count } = await supabase.from('product_images').select('id', { count: 'exact', head: true }).eq('product_id', productId);
  let order = count ?? 0;
  for (const file of files) {
    const up = await uploadImage(supabase, 'product-images', file, `products/${productId}`);
    if ('error' in up) return up.error;
    const { error } = await supabase.from('product_images').insert({ product_id: productId, url: up.url, storage_path: up.path, alt, sort_order: order++ });
    if (error) return 'A photo could not be saved. Please try again.';
  }
  return null;
}

/** Image files from a form field (empty picks are ignored). */
export const formImages = (form: FormData, field = 'images') =>
  form.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
