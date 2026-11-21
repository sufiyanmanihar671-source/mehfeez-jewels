import { fail } from '@sveltejs/kit';
import { requireAdmin, uploadImage } from '$lib/server/admin';
import { getSettings } from '$lib/server/settings';
import { fieldErrors, formToObject, settingsSchema } from '$lib/server/validation';
import { waDigits } from '$lib/whatsapp';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  requireAdmin(locals);
  return { current: await getSettings(locals.supabase, true) };
};

export const actions: Actions = {
  save: async ({ locals, request }) => {
    const supabase = requireAdmin(locals);
    const raw = formToObject(await request.formData(), [], ['video_call_enabled']);
    const parsed = settingsSchema.safeParse(raw);
    if (!parsed.success) return fail(400, { values: raw, errors: fieldErrors(parsed.error) });
    const row = {
      ...parsed.data,
      whatsapp_number: waDigits(parsed.data.whatsapp_number),
      video_call_number: waDigits(parsed.data.video_call_number)
    };
    const { error } = await supabase.from('site_settings').update(row).eq('id', 1);
    if (error) return fail(400, { values: raw, message: error.message });
    return { saved: true };
  },
  image: async ({ locals, request }) => {
    const supabase = requireAdmin(locals);
    const form = await request.formData();
    const field = String(form.get('field'));
    if (field !== 'logo_url' && field !== 'hero_image_url') return fail(400, { message: 'Invalid field' });
    if (form.get('remove') === '1') {
      await supabase.from('site_settings').update({ [field]: null }).eq('id', 1);
      return { saved: true };
    }
    const file = form.get('file');
    if (!(file instanceof File)) return fail(400, { message: 'Choose an image.' });
    const up = await uploadImage(supabase, 'site-assets', file, field === 'logo_url' ? 'logo' : 'hero');
    if ('error' in up) return fail(400, { message: up.error });
    const { error } = await supabase.from('site_settings').update({ [field]: up.url }).eq('id', 1);
    if (error) return fail(400, { message: error.message });
    return { saved: true };
  }
};
