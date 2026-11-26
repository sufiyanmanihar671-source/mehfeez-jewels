// End-to-end check against a running site (wrangler pages dev + mock Supabase):
// guests and pending customers must never receive the wholesale price in any
// response body; approved customers must.
// Usage: node tests/e2e-price.mjs [baseUrl]
import assert from 'node:assert/strict';

const BASE = process.argv[2] || 'http://localhost:8788';
const COOKIE_NAME = 'sb-127-auth-token';

function sessionCookie(token) {
  const session = {
    access_token: token,
    refresh_token: 'r-' + token,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: 'u', email: 'x@test.local', aud: 'authenticated' }
  };
  return `${COOKIE_NAME}=base64-${Buffer.from(JSON.stringify(session)).toString('base64url')}`;
}

async function get(path, token) {
  const res = await fetch(BASE + path, { headers: token ? { cookie: sessionCookie(token) } : {}, redirect: 'manual' });
  return { status: res.status, headers: res.headers, body: await res.text() };
}

const PRICE_PATTERNS = [/4,850/, /4850/, /5,100/, /5100/, /690\.00|₹690|"price":690/];
const leaks = (body) => PRICE_PATTERNS.filter((re) => re.test(body)).map(String);

const pages = ['/', '/collections', '/categories/bridal-jewellery', '/products/royal-kundan-bridal-set', '/products/royal-kundan-bridal-set/__data.json', '/__data.json'];
let failures = 0;
async function check(name, fn) {
  try {
    await fn();
    console.log('✔', name);
  } catch (e) {
    failures++;
    console.log('✖', name, '\n   ', e.message);
  }
}

for (const p of pages) {
  await check(`guest: no price in ${p}`, async () => {
    const r = await get(p);
    assert.equal(r.status, 200);
    assert.deepEqual(leaks(r.body), []);
  });
  await check(`pending: no price in ${p}`, async () => {
    const r = await get(p, 'pending-token');
    assert.equal(r.status, 200);
    assert.deepEqual(leaks(r.body), []);
  });
}

await check('guest product page shows login prompt', async () => {
  const r = await get('/products/royal-kundan-bridal-set');
  assert.match(r.body, /Login or Register to View Wholesale Prices/);
  assert.match(r.body, /MJ-BR-001/);
  assert.match(r.body, /MOQ|Minimum order/);
});
await check('pending product page shows awaiting-approval message', async () => {
  const r = await get('/products/royal-kundan-bridal-set', 'pending-token');
  assert.match(r.body, /Prices visible after account approval/);
});
await check('approved customer sees wholesale price', async () => {
  const r = await get('/products/royal-kundan-bridal-set', 'approved-token');
  assert.match(r.body, /4,850/);
  assert.equal(r.headers.get('cache-control'), 'private, no-store');
});
await check('approved customer sees card prices on listing', async () => {
  const r = await get('/collections', 'approved-token');
  assert.match(r.body, /4,850/);
  assert.match(r.body, /690/);
});
await check('product WhatsApp link includes name and SKU', async () => {
  const r = await get('/products/royal-kundan-bridal-set');
  const m = r.body.match(/href="(https:\/\/wa\.me\/919321245814\?text=[^"]+)"/g) ?? [];
  const decoded = m.map((h) => decodeURIComponent(h.replace(/&amp;/g, '&')));
  assert.ok(decoded.some((d) => d.includes('Royal Kundan Bridal Set') && d.includes('MJ-BR-001')), 'no product-specific link');
});
await check('video call request link is present and honest', async () => {
  const r = await get('/');
  assert.match(r.body, /Schedule a Video Call/);
  assert.ok(decodeURIComponent(r.body).includes('I would like to schedule a video call'));
});
await check('admin area redirects guests to login', async () => {
  const r = await get('/admin');
  assert.equal(r.status, 303);
  assert.match(r.headers.get('location') ?? '', /^\/login/);
});
await check('admin area redirects non-admin customers', async () => {
  const r = await get('/admin/products', 'approved-token');
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('location'), '/account');
});
await check('account requires login', async () => {
  const r = await get('/account');
  assert.equal(r.status, 303);
});
await check('robots.txt and sitemap.xml', async () => {
  const rb = await get('/robots.txt');
  assert.match(rb.body, /Disallow: \/admin/);
  assert.match(rb.body, /Sitemap: /);
  const sm = await get('/sitemap.xml');
  assert.match(sm.body, /<urlset/);
  assert.match(sm.body, /\/products\/royal-kundan-bridal-set/);
});
await check('security headers present', async () => {
  const r = await get('/');
  assert.equal(r.headers.get('x-frame-options'), 'DENY');
  assert.ok(r.headers.get('content-security-policy'));
});
await check('dynamic pages are never shared-cacheable at the edge', async () => {
  for (const p of ['/', '/collections', '/products/royal-kundan-bridal-set']) {
    const g = await get(p);
    assert.match(g.headers.get('cache-control') ?? '', /private/, `guest ${p}`);
    const a = await get(p, 'approved-token');
    assert.match(a.headers.get('cache-control') ?? '', /no-store/, `approved ${p}`);
  }
});
await check('approved customer still sees prices after a guest visited the same URL', async () => {
  await get('/products/royal-kundan-bridal-set');
  const r = await get('/products/royal-kundan-bridal-set', 'approved-token');
  assert.match(r.body, /4,850/);
});
for (const p of ['/admin', '/admin/customers', '/admin/products', '/admin/products/new', '/admin/categories', '/admin/hero', '/admin/enquiries', '/admin/settings']) {
  await check(`admin can open ${p}`, async () => {
    const r = await get(p, 'admin-token');
    assert.equal(r.status, 200);
  });
}
for (const p of ['/about', '/contact', '/categories', '/wholesale-enquiry', '/login', '/register', '/forgot-password', '/privacy', '/terms', '/shipping-policy', '/return-policy', '/collections?show=trending']) {
  await check(`public page ${p} renders`, async () => {
    const r = await get(p);
    assert.equal(r.status, 200);
  });
}
await check('unknown product returns 404', async () => {
  const r = await get('/products/does-not-exist');
  assert.equal(r.status, 404);
});
await check('Continue with Google starts Supabase OAuth with a same-host callback', async () => {
  const r = await get('/auth/google?next=/collections');
  assert.equal(r.status, 303);
  const loc = new URL(r.headers.get('location'));
  assert.match(loc.pathname, /\/auth\/v1\/authorize$/);
  assert.equal(loc.searchParams.get('provider'), 'google');
  assert.match(loc.searchParams.get('redirect_to') ?? '', /^http:\/\/localhost:8788\/auth\/callback\?next=%2Fcollections$/);
  assert.ok(loc.searchParams.get('code_challenge'), 'PKCE challenge missing');
});
await check('OAuth callback without a code goes back to login with an error', async () => {
  const r = await get('/auth/callback');
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('location'), '/login?error=oauth');
});
await check('login and register pages offer Google sign-in', async () => {
  // Google's own button is drawn in the browser; the server renders its container.
  assert.match((await get('/login')).body, /class="gis/);
  assert.match((await get('/register')).body, /class="gis/);
});
await check('Google user without business details is sent to complete profile', async () => {
  const r = await get('/account', 'google-token');
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('location'), '/account/complete');
  const c = await get('/account/complete', 'google-token');
  assert.equal(c.status, 200);
  assert.match(c.body, /Complete your business profile/);
});
await check('Google user without business details never sees prices', async () => {
  const r = await get('/products/royal-kundan-bridal-set', 'google-token');
  assert.deepEqual(leaks(r.body), []);
});
await check('complete profile page skips users who already finished it', async () => {
  const r = await get('/account/complete', 'approved-token');
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('location'), '/account');
});
await check('Google nonce endpoint sets an httpOnly nonce and returns only its hash', async () => {
  const r = await fetch(BASE + '/auth/google/nonce');
  const body = await r.json();
  assert.match(body.nonce, /^[0-9a-f]{64}$/);
  const sc = r.headers.get('set-cookie') ?? '';
  assert.match(sc, /mj_gnonce=/);
  assert.match(sc, /HttpOnly/i);
  assert.ok(!sc.includes(body.nonce), 'raw nonce must differ from the hash given to Google');
});
await check('Google token endpoint rejects requests without a nonce or from other sites', async () => {
  const noNonce = await fetch(BASE + '/auth/google/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: 'x.y.z' }) });
  assert.equal(noNonce.status, 400);
  const foreign = await fetch(BASE + '/auth/google/token', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' }, body: JSON.stringify({ credential: 'x.y.z' }) });
  assert.equal(foreign.status, 403);
});
await check('CSP allows Google sign-in script and frame only', async () => {
  const csp = (await get('/login')).headers.get('content-security-policy') ?? '';
  assert.match(csp, /script-src[^;]*https:\/\/accounts\.google\.com\/gsi\/client/);
  assert.match(csp, /frame-src https:\/\/accounts\.google\.com\/gsi\//);
});
await check('homepage: B2B sections, logo, catalogue + video-call CTAs', async () => {
  const r = await get('/');
  for (const t of ['Arrivals', 'View All Categories', 'Why Choose', 'Book a Video Call', 'Shop by', 'Crafting Jewellery', 'Login to view price', 'View Details', '/brand/mehfeez-white.png', 'JEWELS']) {
    assert.ok(r.body.includes(t), `missing: ${t}`);
  }
  const wa = (r.body.match(/https:\/\/wa\.me\/[^"]+/g) ?? []).map((h) => decodeURIComponent(h.replace(/&amp;/g, '&')));
  assert.ok(wa.some((h) => h.includes('Royal Kundan Bridal Set') && h.includes('MJ-BR-001')), 'product card WhatsApp link must include name and SKU');
});
await check('Request Catalogue prefills the enquiry form', async () => {
  const r = await get('/wholesale-enquiry?type=catalogue');
  assert.match(r.body, /Request Wholesale Catalogue/);
  assert.match(r.body, /Please share your latest wholesale catalogue/);
});
await check('no payment gateway / cart code', async () => {
  const r = await get('/');
  assert.doesNotMatch(r.body, /razorpay|stripe|paypal|add to cart|checkout/i);
});

console.log(failures ? `\n${failures} check(s) failed` : '\nAll end-to-end checks passed');
process.exit(failures ? 1 : 0);
