import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { dbFail, requireAdmin, uploadImage } from '$lib/server/admin';
import { fieldErrors, formToObject } from '$lib/server/validation';
import type { HeroSlide } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

const slideSchema = z.object({
  title: z.string().trim().min(1, 'Heading is required').max(140),
  eyebrow: text(60),
  subtitle: text(300),
  cta_label: text(40),
  cta_href: text(300).refine((v) => v === null || /^(\/|https:\/\/)/.test(v), 'Link must start with / or https://'),
  sort_order: z.coerce.number().int().min(0).max(1000).default(0),
  is_active: z.boolean()
});

export const load: PageServerLoad = async ({ locals }) => {
  const supabase = requireAdmin(locals);
  const { data, error } = await supabase.from('hero_slides').select('*').order('sort_order').order('created_at');
  return { slides: (data as HeroSlide[]) ?? [], missingTable: !!error };
};

async function upload(supabase: ReturnType<typeof requireAdmin>, file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return null;
  return uploadImage(supabase, 'site-assets', file, 'hero');
}

export const actions: Actions = {
  create: async ({ locals, request }) => {
    const supabase = requireAdmin(locals);
    const form = await request.formData();
    const raw = formToObject(form, [], ['is_active']);
    const parsed = slideSchema.safeParse(raw);
    if (!parsed.success) return fail(400, { errors: fieldErrors(parsed.error), values: raw });

    const main = await upload(supabase, form.get('image'));
    if (!main) return fail(400, { message: 'Please choose a slide image.', values: raw });
    if ('error' in main) return fail(400, { message: main.error, values: raw });
    const mobile = await upload(supabase, form.get('mobile_image'));
    if (mobile && 'error' in mobile) return fail(400, { message: mobile.error, values: raw });

    const { error } = await supabase.from('hero_slides').insert({
      ...parsed.data,
      image_url: main.url,
      storage_path: main.path,
      mobile_image_url: mobile?.url ?? null,
      mobile_storage_path: mobile?.path ?? null
    });
    if (error) return dbFail(error, raw);
    return { saved: true };
  },

  update: async ({ locals, request }) => {
    const supabase = requireAdmin(locals);
    const form = await request.formData();
    const id = String(form.get('id') ?? '');
    const parsed = slideSchema.safeParse(formToObject(form, [], ['is_active']));
    if (!parsed.success) return fail(400, { message: Object.values(fieldErrors(parsed.error))[0] });

    const row: Record<string, unknown> = { ...parsed.data };
    const main = await upload(supabase, form.get('image'));
    if (main && 'error' in main) return fail(400, { message: main.error });
    if (main) Object.assign(row, { image_url: main.url, storage_path: main.path });
    const mobile = await upload(supabase, form.get('mobile_image'));
    if (mobile && 'error' in mobile) return fail(400, { message: mobile.error });
    if (mobile) Object.assign(row, { mobile_image_url: mobile.url, mobile_storage_path: mobile.path });
    if (form.get('remove_mobile') === 'on') Object.assign(row, { mobile_image_url: null, mobile_storage_path: null });

    const { error } = await supabase.from('hero_slides').update(row).eq('id', id);
    if (error) return dbFail(error);
    return { saved: true };
  },

  delete: async ({ locals, request }) => {
    const supabase = requireAdmin(locals);
    const id = String((await request.formData()).get('id') ?? '');
    const { data: s } = await supabase.from('hero_slides').select('storage_path, mobile_storage_path').eq('id', id).maybeSingle();
    const paths = [s?.storage_path, s?.mobile_storage_path].filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from('site-assets').remove(paths);
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) return dbFail(error);
    return { deleted: true };
  }
};
