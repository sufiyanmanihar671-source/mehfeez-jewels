import { redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import { saveProduct } from '$lib/server/productForm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const supabase = requireAdmin(locals);
  const { data } = await supabase.from('categories').select('id, name').order('sort_order');
  return { allCategories: data ?? [] };
};

export const actions: Actions = {
  default: async ({ locals, request }) => {
    const supabase = requireAdmin(locals);
    const result = await saveProduct(supabase, await request.formData(), null);
    if ('id' in result) redirect(303, `/admin/products/${result.id}?created=1`);
    return result;
  }
};
