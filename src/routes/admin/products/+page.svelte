<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  import Seo from '$lib/components/Seo.svelte';
  import { STOCK_LABELS } from '$lib/format';
  import type { StockStatus } from '$lib/types';
  let { data, form } = $props();

  type Row = (typeof data.products)[number] & { prices?: { price: number; currency: string; variant_id: string | null }[] };
  const base = (p: Row) => p.prices?.find((x) => x.variant_id === null) ?? null;
  const thumb = (p: Row) => [...((p.images as { url: string; sort_order: number }[]) ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.url;
  function pageHref(n: number) {
    const u = new URL(page.url);
    u.searchParams.set('page', String(n));
    return u.pathname + u.search;
  }
</script>

<Seo title="Products — Admin" noindex />

<div class="toolbar">
  <h1>Products &amp; wholesale prices</h1>
  <a class="btn btn--sm" href="/admin/products/new">Add product</a>
</div>
{#if form?.message}<div class="alert alert--error">{form.message}</div>{/if}
{#if form?.quickSaved}<div class="alert alert--success">Saved.</div>{/if}

<form class="filters" method="GET" style="margin-bottom: 14px">
  <input type="search" name="q" placeholder="Search name or SKU" value={data.q} aria-label="Search products" />
  <select name="category" aria-label="Category">
    <option value="">All categories</option>
    <option value="none" selected={data.category === 'none'}>Uncategorised</option>
    {#each data.allCategories as c}<option value={c.id} selected={data.category === c.id}>{c.name}</option>{/each}
  </select>
  <button class="btn btn--sm" type="submit">Filter</button>
</form>
<p class="muted">{data.total} product{data.total === 1 ? '' : 's'} · Edit price, MOQ and stock directly in the table and press Save on that row.</p>

<div class="table-wrap">
  <table>
    <thead>
      <tr><th></th><th>Product / SKU</th><th>Category</th><th>Wholesale price</th><th>MOQ</th><th>Stock</th><th>Status</th><th></th></tr>
    </thead>
    <tbody>
      {#each data.products as p (p.id)}
        {@const bp = base(p as Row)}
        {@const fid = `q-${p.id}`}
        <tr>
          <td>{#if thumb(p as Row)}<img class="th" src={thumb(p as Row)} alt="" loading="lazy" width="48" height="60" />{:else}<span class="th ph"></span>{/if}</td>
          <td><a href={`/admin/products/${p.id}`}><strong>{p.name}</strong></a><br /><span class="muted">{p.sku}</span></td>
          <td>{(p.category as unknown as { name: string } | null)?.name ?? '—'}</td>
          <td class="price">
            <input form={fid} name="price" type="number" step="0.01" min="0" value={bp?.price ?? ''} aria-label="Wholesale price" placeholder="—" />
            <input form={fid} name="currency" type="text" maxlength="3" value={bp?.currency ?? 'INR'} aria-label="Currency" class="cur" />
          </td>
          <td><input form={fid} name="moq" type="number" min="1" value={p.moq} aria-label="MOQ" class="num" /></td>
          <td class="stock">
            <select form={fid} name="stock_status" aria-label="Stock status">
              {#each Object.entries(STOCK_LABELS) as [k, label]}<option value={k} selected={p.stock_status === (k as StockStatus)}>{label}</option>{/each}
            </select>
            <input form={fid} name="stock_quantity" type="number" min="0" value={p.stock_quantity ?? ''} aria-label="Stock quantity" placeholder="qty" class="num" />
          </td>
          <td>
            {#if p.is_published}<span class="badge badge--solid">Live</span>{:else}<span class="badge badge--muted">Draft</span>{/if}
            {#if p.is_featured}<span class="badge">Featured</span>{/if}
          </td>
          <td>
            <form id={fid} method="POST" action="?/quick" use:enhance={() => async ({ update }) => update({ reset: false })}>
              <input type="hidden" name="id" value={p.id} />
              <button class="btn btn--sm" type="submit">Save</button>
            </form>
          </td>
        </tr>
      {:else}
        <tr><td colspan="8" class="muted">No products yet. <a href="/admin/products/new">Add your first product</a>.</td></tr>
      {/each}
    </tbody>
  </table>
</div>

{#if data.pages > 1}
  <nav class="pager">
    {#if data.page > 1}<a href={pageHref(data.page - 1)}>← Previous</a>{/if}
    <span>Page {data.page} of {data.pages}</span>
    {#if data.page < data.pages}<a href={pageHref(data.page + 1)}>Next →</a>{/if}
  </nav>
{/if}

<style>
  .th { width: 48px; height: 60px; object-fit: cover; border-radius: var(--radius); display: block; }
  .ph { background: var(--ivory); border: 1px solid var(--charcoal-08); }
  td input, td select { min-height: 38px; padding: 6px 8px; font-size: 0.9rem; }
  .price { display: flex; gap: 4px; min-width: 170px; }
  .price input:first-child { width: 110px; }
  .cur { width: 60px; text-transform: uppercase; }
  .num { width: 80px; }
  .stock { min-width: 220px; }
  .stock select { width: 140px; margin-bottom: 4px; }
  .pager { display: flex; gap: 16px; justify-content: center; margin-top: 18px; }
</style>
