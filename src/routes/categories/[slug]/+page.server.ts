import { error } from '@sveltejs/kit';
import { loadListing } from '$lib/server/listing';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, params, parent }) => {
  const { categories } = await parent();
  const category = categories.find((c) => c.slug === params.slug);
  if (!category) error(404, 'Category not found');
  return { category, ...(await loadListing(locals, url, category.id)) };
};
