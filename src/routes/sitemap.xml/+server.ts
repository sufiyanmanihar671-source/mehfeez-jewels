import { siteOrigin } from '$lib/server/auth';
import type { RequestHandler } from './$types';

const STATIC = ['/', '/about', '/collections', '/categories', '/wholesale-enquiry', '/contact', '/register', '/privacy', '/terms'];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: RequestHandler = async ({ locals, url }) => {
  const site = siteOrigin(url);
  const urls: { loc: string; lastmod?: string; priority: string }[] = STATIC.map((p) => ({ loc: site + p, priority: p === '/' ? '1.0' : '0.7' }));

  if (locals.configured) {
    const [{ data: cats }, { data: prods }] = await Promise.all([
      locals.supabase.from('categories').select('slug, updated_at').eq('is_active', true),
      locals.supabase.from('products').select('slug, updated_at').eq('is_published', true).limit(5000)
    ]);
    for (const c of cats ?? []) urls.push({ loc: `${site}/categories/${c.slug}`, lastmod: c.updated_at, priority: '0.8' });
    for (const p of prods ?? []) urls.push({ loc: `${site}/products/${p.slug}`, lastmod: p.updated_at, priority: '0.6' });
  }

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ''}<priority>${u.priority}</priority></url>`)
      .join('\n') +
    '\n</urlset>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
};
