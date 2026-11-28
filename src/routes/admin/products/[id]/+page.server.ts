import { error, fail, redirect } from '@sveltejs/kit';
import { dbFail, requireAdmin, setPrice, uploadImage } from '$lib/server/admin';
import { addProductImages, formImages, saveProduct } from '$lib/server/productForm';
import { fieldErrors, formToObject, variantSchema } from '$lib/server/validation';
import type { Price, Product } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const supabase = requireAdmin(locals);
  const { data } = await supabase
    .from('products')
    .select('*, images:product_images(id, url, alt, sort_order, storage_path), variants:product_variants(id, name, sku, stock_status, sort_order)')
    .eq('id', params.id)
    .maybeSingle();
  if (!data) error(404, 'Product not found');
  const product = data as Product;
  product.images = [...(product.images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  product.variants = [...(product.variants ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const [{ data: prices }, { data: cats }] = await Promise.all([
    supabase.from('product_prices').select('product_id, variant_id, price, currency, price_note').eq('product_id', params.id),
    supabase.from('categories').select('id, name').order('sort_order')
  ]);
  return { product, prices: (prices as Price[]) ?? [], allCategories: cats ?? [] };
};

export const actions: Actions = {
  save: async ({ locals, request, params }) => {
    const supabase = requireAdmin(locals);
    const result = await saveProduct(supabase, await request.formData(), params.id);
    if ('id' in result) return { saved: true };
    return result;
  },

  uploadImages: async ({ locals, request, params }) => {
    const supabase = requireAdmin(locals);
    const form = await request.formData();
    const files = formImages(form);
    if (!files.length) return fail(400, { imageMessage: 'Choose one or more photos to upload.' });
    const alt = String(form.get('alt') ?? '').trim().slice(0, 200) || null;
    const err = await addProductImages(supabase, params.id, files, alt);
    if (err) return fail(400, { imageMessage: err });
    return { imagesSaved: files.length };
  },

  deleteImage: async ({ locals, request, params }) => {
    const supabase = requireAdmin(locals);
    const id = String((await request.formData()).get('image_id'));
    const { data: img } = await supabase.from('product_images').select('storage_path').eq('id', id).eq('product_id', params.id).maybeSingle();
    if (img?.storage_path) await supabase.storage.from('product-images').remove([img.storage_path]);
    const { error: e } = await supabase.from('product_images').delete().eq('id', id).eq('product_id', params.id);
    if (e) return dbFail(e);
    return { imageDeleted: true };
  },

  coverImage: async ({ locals, request, params }) => {
    const supabase = requireAdmin(locals);
    const id = String((await request.formData()).get('image_id'));
    const { data: imgs } = await supabase.from('product_images').select('id').eq('product_id', params.id).order('sort_order');
    const ordered = [id, ...(imgs ?? []).map((i) => i.id).filter((x) => x !== id)];
    await Promise.all(ordered.map((imgId, i) => supabase.from('product_images').update({ sort_order: i }).eq('id', imgId)));
    return { coverSet: true };
  },

  addVariant: async ({ locals, request, params }) => {
    const supabase = requireAdmin(locals);
    const form = await request.formData();
    const raw = formToObject(form);
    const parsed = variantSchema.safeParse(raw);
    if (!parsed.success) return fail(400, { variantErrors: fieldErrors(parsed.error), variantValues: raw });
    const { price, ...variant } = parsed.data;
    const { count } = await supabase.from('product_variants').select('id', { count: 'exact', head: true }).eq('product_id', params.id);
    const { data, error: e } = await supabase
      .from('product_variants')
      .insert({ ...variant, sku: variant.sku?.toUpperCase() ?? null, product_id: params.id, sort_order: count ?? 0 })
      .select('id')
      .single();
    if (e) return dbFail(e);
    if (price !== null) {
      const currency = String(form.get('currency') || 'INR').toUpperCase().slice(0, 3);
      const pe = await setPrice(supabase, params.id, data.id, price, /^[A-Z]{3}$/.test(currency) ? currency : 'INR');
      if (pe) return fail(400, { message: pe.message });
    }
    return { variantSaved: true };
  },

  updateVariant: async ({ locals, request, params }) => {
    const supabase = requireAdmin(locals);
    const form = await request.formData();
    const id = String(form.get('variant_id'));
    const parsed = variantSchema.safeParse(formToObject(form));
    if (!parsed.success) return fail(400, { message: Object.values(fieldErrors(parsed.error))[0] });
    const { price, ...variant } = parsed.data;
    const { error: e } = await supabase
      .from('product_variants')
      .update({ ...variant, sku: variant.sku?.toUpperCase() ?? null })
      .eq('id', id)
      .eq('product_id', params.id);
    if (e) return dbFail(e);
    const currency = String(form.get('currency') || 'INR').toUpperCase().slice(0, 3);
    const pe = await setPrice(supabase, params.id, id, price, /^[A-Z]{3}$/.test(currency) ? currency : 'INR');
    if (pe) return fail(400, { message: pe.message });
    return { variantSaved: true };
  },

  deleteVariant: async ({ locals, request, params }) => {
    const supabase = requireAdmin(locals);
    const id = String((await request.formData()).get('variant_id'));
    const { error: e } = await supabase.from('product_variants').delete().eq('id', id).eq('product_id', params.id);
    if (e) return dbFail(e);
    return { variantDeleted: true };
  },

  delete: async ({ locals, params }) => {
    const supabase = requireAdmin(locals);
    const { data: imgs } = await supabase.from('product_images').select('storage_path').eq('product_id', params.id);
    const paths = (imgs ?? []).map((i) => i.storage_path).filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from('product-images').remove(paths);
    const { error: e } = await supabase.from('products').delete().eq('id', params.id);
    if (e) return dbFail(e);
    redirect(303, '/admin/products?deleted=1');
  }
};
