// Minimal local stand-in for Supabase (PostgREST + Auth) used ONLY for
// end-to-end rendering tests of the SvelteKit app. It mimics the RLS outcome:
// product_prices rows are returned only for the "approved" test token.
import { createServer } from 'node:http';

const PORT = Number(process.env.MOCK_PORT || 54321);
const cat = { id: 'c1111111-1111-4111-8111-111111111111', name: 'Bridal Jewellery', slug: 'bridal-jewellery', description: 'Complete bridal sets.', image_url: null, sort_order: 1, is_active: true };
const cat2 = { id: 'c2222222-2222-4222-8222-222222222222', name: 'Earrings', slug: 'earrings', description: 'Studs and jhumkas.', image_url: null, sort_order: 2, is_active: true };
const product = {
  id: 'p1111111-1111-4111-8111-111111111111', name: 'Royal Kundan Bridal Set', slug: 'royal-kundan-bridal-set', sku: 'MJ-BR-001',
  description: 'Statement bridal necklace set with matching earrings.\n\nHand-finished stone setting.', category_id: cat.id, moq: 6,
  stock_status: 'in_stock', stock_quantity: 120, is_published: true, is_featured: true, is_new_arrival: true, is_bestseller: true,
  meta_title: null, meta_description: null, sort_order: 0, created_at: '2026-11-01T00:00:00Z', updated_at: '2026-11-01T00:00:00Z',
  category: { id: cat.id, name: cat.name, slug: cat.slug }, images: [],
  variants: [{ id: 'v1111111-1111-4111-8111-111111111111', name: 'Ruby', sku: 'MJ-BR-001-R', stock_status: 'in_stock', sort_order: 0 }]
};
const product2 = { ...product, id: 'p2222222-2222-4222-8222-222222222222', name: 'AD Jhumka Earrings', slug: 'ad-jhumka-earrings', sku: 'MJ-ER-014', category_id: cat2.id, category: { id: cat2.id, name: cat2.name, slug: cat2.slug }, variants: [], is_bestseller: false };
const prices = [
  { product_id: product.id, variant_id: null, price: 4850, currency: 'INR', price_note: 'per set' },
  { product_id: product.id, variant_id: product.variants[0].id, price: 5100, currency: 'INR', price_note: null },
  { product_id: product2.id, variant_id: null, price: 690, currency: 'INR', price_note: null }
];
const users = {
  'approved-token': { id: 'u-approved', email: 'approved@test.local', status: 'approved', role: 'customer' },
  'pending-token': { id: 'u-pending', email: 'pending@test.local', status: 'pending', role: 'customer' },
  'admin-token': { id: 'u-admin', email: 'admin@test.local', status: 'approved', role: 'admin' }
};
const profile = (u) => ({ id: u.id, email: u.email, full_name: 'Test Buyer', company_name: 'Test Traders', whatsapp: '+971501234567', country: 'United Arab Emirates', city: 'Dubai', address: 'Deira, Dubai', business_type: 'Wholesaler', gst_number: null, website: null, additional_info: null, status: u.status, role: u.role, created_at: '2026-11-01T00:00:00Z' });
const settings = { id: 1, whatsapp_number: '919321245814', whatsapp_message: 'Hello Mehfeez Jewels, I am interested in your wholesale jewellery collections.', video_call_number: '919321245814', video_call_message: 'Hello Mehfeez Jewels, I would like to schedule a video call to discuss your jewellery collections, wholesale pricing and bulk order requirements.', video_call_enabled: true, contact_phone: '+91 93212 45814', contact_email: null, address: 'Room No. 4, Malad West, Chincholi Bunder Road, Opposite Vivanta Hospital, Mumbai – 400064, Maharashtra, India.', business_hours: null, instagram_url: null, facebook_url: null, logo_url: null, hero_title: 'Artificial Jewellery, Crafted for Wholesale', hero_subtitle: 'Manufacturer and wholesale supplier for retailers and distributors worldwide.', hero_image_url: null };
export const enquiries = [];

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const user = users[token];
  const accept = req.headers.accept || '';
  const single = accept.includes('vnd.pgrst.object');
  const q = Object.fromEntries(url.searchParams);
  let body = '';
  for await (const c of req) body += c;

  if (url.pathname === '/auth/v1/user') return user ? send(res, 200, { id: user.id, email: user.email, email_confirmed_at: '2026-11-01T00:00:00Z', aud: 'authenticated', role: 'authenticated' }) : send(res, 401, { code: 401, error_code: 'bad_jwt', msg: 'invalid JWT' });

  const table = url.pathname.replace('/rest/v1/', '');
  let rows = [];
  if (table === 'site_settings') rows = [settings];
  else if (table === 'categories') rows = [cat, cat2];
  else if (table === 'products') {
    rows = [product, product2];
    if (q.slug) rows = rows.filter((r) => r.slug === q.slug.replace('eq.', ''));
    if (q.category_id) rows = rows.filter((r) => r.category_id === q.category_id.replace('eq.', ''));
  } else if (table === 'product_prices') {
    // Simulates RLS: anon -> permission denied, non-approved -> zero rows.
    if (!user) return send(res, 401, { code: '42501', message: 'permission denied for table product_prices' });
    rows = user.status === 'approved' ? prices : [];
  } else if (table === 'profiles') rows = user ? [profile(user)] : [];
  else if (table === 'enquiries') rows = [];
  else if (table === 'rpc/submit_enquiry') {
    enquiries.push(JSON.parse(body));
    return send(res, 200, 'e-1');
  }

  if (single) return rows.length ? send(res, 200, rows[0]) : send(res, 406, { code: 'PGRST116', message: 'no rows' });
  send(res, 200, rows, { 'Content-Range': `0-${Math.max(0, rows.length - 1)}/${rows.length}` });
}).listen(PORT, () => console.log(`mock supabase on ${PORT}`));
