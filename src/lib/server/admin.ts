import { error, fail } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Defence in depth: every admin load/action calls this (hooks also guard /admin). */
export function requireAdmin(locals: App.Locals): SupabaseClient {
  if (!locals.user || !locals.isAdmin) error(403, 'Admins only');
  return locals.supabase;
}

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg'
};

/**
 * Uploads an image to Supabase Storage using the admin's own session
 * (storage RLS only allows admins to write). Returns the public URL.
 */
export async function uploadImage(
  supabase: SupabaseClient,
  bucket: 'product-images' | 'site-assets',
  file: File,
  prefix: string
): Promise<{ url: string; path: string } | { error: string }> {
  if (!file || file.size === 0) return { error: 'Please choose an image.' };
  if (file.size > MAX_BYTES) return { error: 'Image must be 5 MB or smaller.' };
  const ext = TYPES[file.type];
  if (!ext || (ext === 'svg' && bucket !== 'site-assets')) return { error: 'Use a JPG, PNG, WebP or AVIF image.' };
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
  const { error: err } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false
  });
  if (err) return { error: `Upload failed: ${err.message}` };
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export function dbFail(err: { message: string; code?: string }, values?: unknown) {
  console.error('admin db error', err.code, err.message);
  const message =
    err.code === '23505'
      ? 'That slug or SKU is already in use. Please choose a unique value.'
      : err.code === '23503'
        ? 'This item is linked to other records and cannot be changed this way.'
        : 'The change could not be saved. Please check the values and try again.';
  return fail(400, { message, values });
}

/** Create, update or remove a wholesale price row (variantId null = base price). */
export async function setPrice(
  supabase: SupabaseClient,
  productId: string,
  variantId: string | null,
  price: number | null,
  currency = 'INR',
  note: string | null = null
): Promise<{ message: string } | null> {
  const match = supabase.from('product_prices').select('id').eq('product_id', productId);
  const { data: existing, error: selErr } = await (variantId ? match.eq('variant_id', variantId) : match.is('variant_id', null)).maybeSingle();
  if (selErr) return selErr;
  if (price === null) {
    if (existing) {
      const { error } = await supabase.from('product_prices').delete().eq('id', existing.id);
      if (error) return error;
    }
    return null;
  }
  const row = { product_id: productId, variant_id: variantId, price, currency, price_note: note };
  const { error } = existing
    ? await supabase.from('product_prices').update(row).eq('id', existing.id)
    : await supabase.from('product_prices').insert(row);
  return error ?? null;
}
