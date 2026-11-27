import { fail } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fieldErrors, formToObject, priceSchema, productSchema } from './validation';
import { dbFail, setPrice } from './admin';
import { slugify } from '$lib/format';

const FLAGS = ['is_published', 'is_featured', 'is_new_arrival', 'is_bestseller'];

/** Validates and saves product fields + base wholesale price. Returns the product id or an ActionFailure. */
export async function saveProduct(supabase: SupabaseClient, form: FormData, id: string | null) {
  const raw = formToObject(form, ['collections'], FLAGS);
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
