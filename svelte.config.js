import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      routes: { include: ['/*'], exclude: ['<all>'] }
    }),
    csrf: { trustedOrigins: [] },
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        // Google Identity Services ("Sign in with Google" button)
        'script-src': ['self', 'https://accounts.google.com/gsi/client'],
        // Google sign-in, and the Google Maps embed on the Contact page
        'frame-src': ['https://accounts.google.com/gsi/', 'https://www.google.com/maps', 'https://www.google.com/maps/'],
        'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com', 'https://accounts.google.com/gsi/style'],
        'font-src': ['self', 'https://fonts.gstatic.com'],
        'img-src': ['self', 'data:', 'blob:', 'https://*.supabase.co', 'https://*.googleusercontent.com'],
        'connect-src': ['self', 'https://*.supabase.co', 'wss://*.supabase.co', 'https://accounts.google.com/gsi/'],
        'frame-ancestors': ['none'],
        'base-uri': ['self'],
        'form-action': ['self'],
        'object-src': ['none']
      }
    }
  }
};

export default config;
