import { getSettings } from '$lib/server/settings';
import { listCategories } from '$lib/server/catalog';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const [settings, categories] = await Promise.all([
    getSettings(locals.supabase, locals.configured),
    listCategories(locals.supabase, locals.configured)
  ]);
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
