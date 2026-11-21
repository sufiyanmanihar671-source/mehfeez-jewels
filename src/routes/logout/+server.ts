import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// POST only (SvelteKit CSRF protection applies to form posts).
export const POST: RequestHandler = async ({ locals }) => {
  await locals.supabase.auth.signOut();
  redirect(303, '/');
};
