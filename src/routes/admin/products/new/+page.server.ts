import { redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import { addProductImages, formImages, saveProduct } from '$lib/server/productForm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const supabase = requireAdmin(locals);
  const { data } = await supabase.from('categories').select('id, name').order('sort_order');
  return { allCategories: data ?? [] };
};

export const actions: Actions = {
  default: async ({ locals, request }) => {
    const supabase = requireAdmin(locals);
    const form = await request.formData();
    const result = await saveProduct(supabase, form, null);
    if (!('id' in result)) return result;
    // Photos chosen on the "Add product" form are uploaded right after the product is created.
    const files = formImages(form);
    let photoError = '';
    if (files.length) {
      const name = String(form.get('name') ?? '').trim().slice(0, 200) || null;
      photoError = (await addProductImages(supabase, result.id, files, name)) ?? '';
    }
    redirect(303, `/admin/products/${result.id}?created=1${photoError ? '&photo_error=1' : ''}`);
  }
};
