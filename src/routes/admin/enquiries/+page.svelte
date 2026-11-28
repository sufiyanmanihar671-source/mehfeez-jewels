<script lang="ts">
  import { page } from '$app/state';
  import Seo from '$lib/components/Seo.svelte';
  import { formatDate } from '$lib/format';
  let { data } = $props();
  const tabs = [
    ['', 'All'],
    ['new', 'New'],
    ['in_progress', 'In progress'],
    ['responded', 'Responded'],
    ['closed', 'Closed']
  ];
  function pageHref(n: number) {
    const u = new URL(page.url);
    u.searchParams.set('page', String(n));
    return u.pathname + u.search;
  }
</script>

<Seo title="Enquiries — Admin" noindex />

<h1>Wholesale enquiries</h1>
<div class="toolbar">
  <nav class="filters chips">
    {#each tabs as [k, l]}
      <a class="btn btn--sm" class:btn--outline={data.status !== k} href={k ? `/admin/enquiries?status=${k}` : '/admin/enquiries'}>{l}</a>
    {/each}
  </nav>
  <form class="filters" method="GET">
    {#if data.status}<input type="hidden" name="status" value={data.status} />{/if}
    <input type="search" name="q" value={data.q} placeholder="Name, business, email, country" aria-label="Search enquiries" />
    <button class="btn btn--sm" type="submit">Search</button>
  </form>
</div>
<p class="muted">{data.total} enquir{data.total === 1 ? 'y' : 'ies'}</p>

<div class="table-wrap">
  <table class="rt">
    <thead><tr><th>Received</th><th>From</th><th>Country</th><th>Interest</th><th>Quantity</th><th>Status</th></tr></thead>
    <tbody>
      {#each data.enquiries as e (e.id)}
        {@const prod = e.product as unknown as { name: string; sku: string } | null}
        <tr>
          <td data-label="Received">{formatDate(e.created_at)}</td>
          <td><a href={`/admin/enquiries/${e.id}`}><strong>{e.business_name}</strong></a><br /><span class="muted">{e.full_name} · {e.email}</span></td>
          <td data-label="Country">{e.country}</td>
          <td data-label="Interested in">{prod ? `${prod.name} (${prod.sku})` : (e.categories ?? []).join(', ') || '—'}</td>
          <td data-label="Quantity">{e.estimated_quantity ?? '—'}</td>
          <td data-label="Status"><span class="badge" class:badge--solid={e.status === 'new'}>{e.status.replace('_', ' ')}</span></td>
        </tr>
      {:else}
        <tr><td colspan="6" class="muted">No enquiries found.</td></tr>
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
  .pager { display: flex; gap: 16px; justify-content: center; margin-top: 18px; }
</style>
