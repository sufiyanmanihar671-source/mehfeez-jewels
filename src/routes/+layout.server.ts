import { getSettings } from '$lib/server/settings';
import { categoryPhotoMap, listCategories } from '$lib/server/catalog';
import type { Category } from '$lib/types';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const [settings, plain, photos] = await Promise.all([
    getSettings(locals.supabase, locals.configured),
    listCategories(locals.supabase, locals.configured),
    categoryPhotoMap(locals.supabase, locals.configured)
  ]);
  // Photo per category for the phone "Discover" boxes (own image, else a product photo).
  const categories: Category[] = plain.map((c) => ({ ...c, photo: c.image_url || photos[c.id] || null }));
  // Never send internal admin notes to the browser.
  const profile = locals.profile ? { ...locals.profile, admin_note: undefined } : null;
  return {
    settings,
    categories,
    configured: locals.configured,
    user: locals.user ? { id: locals.user.id, email: locals.user.email } : null,
    profile,
    canSeePrices: locals.canSeePrices
  };
};
