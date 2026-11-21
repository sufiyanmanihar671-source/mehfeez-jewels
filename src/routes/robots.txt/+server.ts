import { siteOrigin } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /account',
    'Disallow: /auth/',
    'Disallow: /reset-password',
    'Disallow: /forgot-password',
    'Disallow: /login',
    '',
    `Sitemap: ${siteOrigin(url)}/sitemap.xml`,
    ''
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } });
};
