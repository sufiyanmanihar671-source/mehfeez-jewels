import { fail } from '@sveltejs/kit';
import { dbFail, requireAdmin, uploadImage } from '$lib/server/admin';
import { categorySchema, fieldErrors, formToObject } from '$lib/server/validation';
import { slugify } from '$lib/format';
import type { Category } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const supabase = requireAdmin(locals);
  const { data } = await supabase.from('categories').select('*').order('sort_order').order('name');
  const { data: counts } = await supabase.from('products').select('category_id');
  const productCounts: Record<string, number> = {};
  for (const r of counts ?? []) if (r.category_id) productCounts[r.category_id] = (productCounts[r.category_id] ?? 0) + 1;
  return { all: (data as Category[]) ?? [], productCounts };
};

async function parse(request: Request) {
  const form = await request.formData();
  const raw = formToObject(form, [], ['is_active']);
  if (!raw.slug && typeof raw.name === 'string') raw.slug = slugify(raw.name);
  return { form, raw, parsed: categorySchema.safeParse(raw) };
}

export const actions: Actions = {
  save: async ({ locals, request }) => {
    const supabase = requireAdmin(locals);
    const { form, raw, parsed } = await parse(request);
    if (!parsed.success) return fail(400, { errors: fieldErrors(parsed.error), values: raw, id: raw.id });
    const id = String(form.get('id') ?? '');
    const row: Record<string, unknown> = { ...parsed.data };

    const file = form.get('image');
    if (file instanceof File && file.size > 0) {
      const up = await uploadImage(supabase, 'product-images', file, 'categories');
      if ('error' in up) return fail(400, { message: up.error, values: raw, id });
      row.image_url = up.url;
    }
    if (form.get('remove_image') === 'on') row.image_url = null;

    const { error } = id ? await supabase.from('categories').update(row).eq('id', id) : await supabase.from('categories').insert(row);
    if (error) return dbFail(error, raw);
    return { saved: true };
  },
  delete: async ({ locals, request }) => {
    const supabase = requireAdmin(locals);
    const id = String((await request.formData()).get('id') ?? '');
    // Products in this category are kept and become "uncategorised" (FK on delete set null).
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return dbFail(error);
    return { deleted: true };
  },
  move: async ({ locals, request }) => {
    const supabase = requireAdmin(locals);
    const form = await request.formData();
    const id = String(form.get('id'));
    const dir = form.get('dir') === 'up' ? -1 : 1;
    const { data } = await supabase.from('categories').select('id, sort_order').order('sort_order').order('name');
    const list = data ?? [];
    const i = list.findIndex((c) => c.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return { moved: false };
    [list[i], list[j]] = [list[j], list[i]];
    await Promise.all(list.map((c, idx) => supabase.from('categories').update({ sort_order: idx + 1 }).eq('id', c.id)));
    return { moved: true };
  }
};
