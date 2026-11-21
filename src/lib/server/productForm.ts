import { fail } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fieldErrors, formToObject, priceSchema, productSchema } from './validation';
import { dbFail, setPrice } from './admin';
import { slugify } from '$lib/format';

const FLAGS = ['is_published', 'is_featured', 'is_new_arrival', 'is_bestseller'];

/** Validates and saves product fields + base wholesale price. Returns the product id or an ActionFailure. */
export async function saveProduct(supabase: SupabaseClient, form: FormData, id: string | null) {
  const raw = formToObject(form, [], FLAGS);
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
  if (id) {
    const { error } = await supabase.from('products').update(parsed.data).eq('id', id);
    if (error) return dbFail(error, raw);
  } else {
    const { data, error } = await supabase.from('products').insert(parsed.data).select('id').single();
    if (error) return dbFail(error, raw);
    productId = data.id;
  }

  const p = priceParsed.data;
  const err = await setPrice(supabase, productId!, null, p.price, p.currency, p.price_note);
  if (err) return fail(400, { values: raw, message: `Product saved, but the price could not be saved: ${err.message}` });
  return { id: productId! };
}
