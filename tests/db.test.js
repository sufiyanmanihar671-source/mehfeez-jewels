// Database security tests: runs the real Supabase migrations inside PGlite
// (in-process Postgres) with a minimal stub of Supabase's auth schema and
// roles, then verifies Row Level Security behaves as required.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const ADMIN = '00000000-0000-0000-0000-00000000000a';
const PENDING = '00000000-0000-0000-0000-00000000000b';
const APPROVED = '00000000-0000-0000-0000-00000000000c';
const REJECTED = '00000000-0000-0000-0000-00000000000d';

const SUPABASE_STUB = `
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on functions to anon, authenticated;
  alter default privileges in schema public grant all on sequences to anon, authenticated;
`;

/** Run SQL as a Supabase role (anon / authenticated) with an optional user id. */
async function as(role, uid, sql, params = []) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false); set role ${role};`);
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec('reset role;');
  }
}

before(async () => {
  await db.exec(SUPABASE_STUB);
  const dir = new URL('../supabase/migrations/', import.meta.url);
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.sql') && !f.includes('storage')).sort()) {
    await db.exec(readFileSync(new URL(f, dir), 'utf8'));
  }
  const users = [
    [ADMIN, 'admin@test.local'], [PENDING, 'pending@test.local'],
    [APPROVED, 'approved@test.local'], [REJECTED, 'rejected@test.local']
  ];
  for (const [id, email] of users) {
    await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`, [
      id, email, JSON.stringify({ full_name: 'Test ' + email, company_name: 'Co', country: 'India' })
    ]);
  }
  await db.exec(`
    update public.profiles set role = 'admin', status = 'approved' where id = '${ADMIN}';
    update public.profiles set status = 'approved' where id = '${APPROVED}';
    update public.profiles set status = 'rejected' where id = '${REJECTED}';
    insert into public.products (id, name, slug, sku, moq) values
      ('11111111-1111-1111-1111-111111111111', 'AD Necklace', 'ad-necklace', 'MJ-001', 6);
    insert into public.products (id, name, slug, sku, is_published) values
      ('22222222-2222-2222-2222-222222222222', 'Hidden', 'hidden', 'MJ-002', false);
    insert into public.product_prices (product_id, price) values
      ('11111111-1111-1111-1111-111111111111', 1450),
      ('22222222-2222-2222-2222-222222222222', 999);
  `);
});

test('signup trigger creates a pending customer profile', async () => {
  const r = await db.query(`select status, role, full_name from public.profiles where id = $1`, [PENDING]);
  assert.deepEqual(r.rows[0], { status: 'pending', role: 'customer', full_name: 'Test pending@test.local' });
});

test('guests can browse published products but not unpublished ones', async () => {
  const r = await as('anon', null, `select sku from public.products order by sku`);
  assert.deepEqual(r.rows.map((x) => x.sku), ['MJ-001']);
});

test('guests cannot read wholesale prices at all', async () => {
  await assert.rejects(as('anon', null, `select * from public.product_prices`), /permission denied/);
});

test('pending and rejected customers get zero price rows', async () => {
  for (const uid of [PENDING, REJECTED]) {
    const r = await as('authenticated', uid, `select * from public.product_prices`);
    assert.equal(r.rows.length, 0, `uid ${uid} should see no prices`);
  }
});

test('approved customers see prices of published products only', async () => {
  const r = await as('authenticated', APPROVED, `select price::text from public.product_prices`);
  assert.deepEqual(r.rows, [{ price: '1450.00' }]);
});

test('admin sees all prices', async () => {
  const r = await as('authenticated', ADMIN, `select count(*)::int n from public.product_prices`);
  assert.equal(r.rows[0].n, 2);
});

test('customers cannot approve themselves or become admin', async () => {
  await assert.rejects(
    as('authenticated', PENDING, `update public.profiles set status = 'approved' where id = $1`, [PENDING]),
    /protected profile fields/
  );
  await assert.rejects(
    as('authenticated', PENDING, `update public.profiles set role = 'admin' where id = $1`, [PENDING]),
    /protected profile fields/
  );
});

test('customers can edit their own business details', async () => {
  await as('authenticated', PENDING, `update public.profiles set city = 'Dubai' where id = $1`, [PENDING]);
  const r = await db.query(`select city, status from public.profiles where id = $1`, [PENDING]);
  assert.deepEqual(r.rows[0], { city: 'Dubai', status: 'pending' });
});

test('customers cannot read or edit other profiles', async () => {
  const r = await as('authenticated', PENDING, `select id from public.profiles`);
  assert.deepEqual(r.rows.map((x) => x.id), [PENDING]);
  const u = await as('authenticated', PENDING, `update public.profiles set city = 'X' where id = $1 returning id`, [APPROVED]);
  assert.equal(u.rows.length, 0);
});

test('admin can approve customers', async () => {
  await as('authenticated', ADMIN, `update public.profiles set status = 'approved' where id = $1`, [REJECTED]);
  const r = await db.query(`select status, status_changed_at is not null as stamped from public.profiles where id = $1`, [REJECTED]);
  assert.deepEqual(r.rows[0], { status: 'approved', stamped: true });
  await db.query(`update public.profiles set status = 'rejected' where id = $1`, [REJECTED]);
});

test('non-admins cannot write catalogue data or prices', async () => {
  await assert.rejects(
    as('authenticated', APPROVED, `insert into public.products (name, slug, sku) values ('x', 'x', 'X1')`),
    /row-level security/
  );
  const u = await as('authenticated', APPROVED, `update public.product_prices set price = 1 returning id`);
  assert.equal(u.rows.length, 0);
  const s = await as('authenticated', APPROVED, `update public.site_settings set whatsapp_number = '1' returning id`);
  assert.equal(s.rows.length, 0);
});

test('enquiries go through validated, rate-limited RPC only', async () => {
  await assert.rejects(
    as('anon', null, `insert into public.enquiries (full_name, business_name, email, whatsapp, country, message) values ('a','b','c','d','e','f')`),
    /permission denied/
  );
  const payload = {
    full_name: 'Ali Khan', business_name: 'Khan Traders', email: 'ali@example.com',
    whatsapp: '+971 50 123 4567', country: 'United Arab Emirates', categories: ['Bridal Jewellery'],
    estimated_quantity: '200 sets', message: 'Please share your bridal catalogue.'
  };
  const r = await as('anon', null, `select public.submit_enquiry($1::jsonb, 'ip-1') id`, [JSON.stringify(payload)]);
  assert.ok(r.rows[0].id);
  await assert.rejects(
    as('anon', null, `select public.submit_enquiry($1::jsonb, 'ip-1')`, [JSON.stringify({ ...payload, email: 'bad' })]),
    /invalid_email/
  );
  for (let i = 0; i < 4; i++) {
    await as('anon', null, `select public.submit_enquiry($1::jsonb, 'ip-1')`, [JSON.stringify(payload)]);
  }
  await assert.rejects(
    as('anon', null, `select public.submit_enquiry($1::jsonb, 'ip-1')`, [JSON.stringify(payload)]),
    /rate_limited/
  );
  const guestRead = await as('anon', null, `select count(*)::int n from public.enquiries`).catch((e) => e);
  assert.ok(guestRead instanceof Error || guestRead.rows[0].n === 0);
  const adminRead = await as('authenticated', ADMIN, `select count(*)::int n from public.enquiries`);
  assert.equal(adminRead.rows[0].n, 5);
});

test('admin_stats is admin-only', async () => {
  await assert.rejects(as('authenticated', APPROVED, `select public.admin_stats()`), /forbidden/);
  const r = await as('authenticated', ADMIN, `select public.admin_stats() s`);
  assert.equal(r.rows[0].s.customers_total, 3);
});

test('rate limit table is not directly accessible', async () => {
  await assert.rejects(as('anon', null, `select * from public.rate_limits`), /permission denied/);
  await assert.rejects(as('authenticated', APPROVED, `select public.hit_rate_limit('x', 1, '1 hour')`), /permission denied/);
});

test('default categories are seeded with type/style groups', async () => {
  const r = await as('anon', null, `select category_group g, count(*)::int n from public.categories group by 1 order by 1`);
  assert.deepEqual(r.rows, [{ g: 'style', n: 6 }, { g: 'type', n: 8 }]);
});

test('product collection tags accept only known values', async () => {
  await db.query(`update public.products set collections = '{trending,premium}' where sku = 'MJ-001'`);
  const r = await as('anon', null, `select collections from public.products where collections @> '{premium}'`);
  assert.equal(r.rows.length, 1);
  await assert.rejects(db.query(`update public.products set collections = '{fake}' where sku = 'MJ-001'`), /check constraint/);
});

test('hero slides: public sees active only, only admins can write', async () => {
  await as('authenticated', ADMIN, `insert into public.hero_slides (image_url, title, is_active) values ('https://x.supabase.co/a.webp', 'Live', true), ('https://x.supabase.co/b.webp', 'Draft', false)`);
  const pub = await as('anon', null, `select title from public.hero_slides`);
  assert.deepEqual(pub.rows, [{ title: 'Live' }]);
  const adm = await as('authenticated', ADMIN, `select count(*)::int n from public.hero_slides`);
  assert.equal(adm.rows[0].n, 2);
  await assert.rejects(
    as('authenticated', APPROVED, `insert into public.hero_slides (image_url, title) values ('https://x/a', 'Hack')`),
    /row-level security/
  );
  await assert.rejects(
    as('authenticated', ADMIN, `insert into public.hero_slides (image_url, title, cta_href) values ('https://x/a', 'Bad', 'javascript:alert(1)')`),
    /check constraint/
  );
});
