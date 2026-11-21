<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  import Seo from '$lib/components/Seo.svelte';
  import { COUNTRIES } from '$lib/countries';
  import { formatDate } from '$lib/format';
  import { waLink } from '$lib/whatsapp';
  let { data, form } = $props();

  function pageHref(n: number) {
    const u = new URL(page.url);
    u.searchParams.set('page', String(n));
    return u.pathname + u.search;
  }
</script>

<Seo title="Customers — Admin" noindex />

<h1>Customers</h1>
{#if form?.message}<div class="alert alert--error">{form.message}</div>{/if}

<div class="toolbar">
  <nav class="filters" aria-label="Status filter">
    <a class="btn btn--sm" class:btn--outline={data.status !== ''} href="/admin/customers">All</a>
    <a class="btn btn--sm" class:btn--outline={data.status !== 'pending'} href="/admin/customers?status=pending">Pending</a>
    <a class="btn btn--sm" class:btn--outline={data.status !== 'approved'} href="/admin/customers?status=approved">Approved</a>
    <a class="btn btn--sm" class:btn--outline={data.status !== 'rejected'} href="/admin/customers?status=rejected">Rejected</a>
  </nav>
  <form class="filters" method="GET">
    {#if data.status}<input type="hidden" name="status" value={data.status} />{/if}
    <input type="search" name="q" placeholder="Name, company, email, phone" value={data.q} aria-label="Search customers" />
    <select name="country" aria-label="Country">
      <option value="">All countries</option>
      {#each COUNTRIES as c}<option value={c} selected={data.country === c}>{c}</option>{/each}
    </select>
    <button class="btn btn--sm" type="submit">Filter</button>
  </form>
</div>

<p class="muted">{data.total} customer{data.total === 1 ? '' : 's'}</p>

<div class="table-wrap">
  <table>
    <thead>
      <tr><th>Business</th><th>Contact</th><th>Location</th><th>Type</th><th>Registered</th><th>Status</th><th>Actions</th></tr>
    </thead>
    <tbody>
      {#each data.customers as c (c.id)}
        <tr>
          <td><a href={`/admin/customers/${c.id}`}><strong>{c.company_name || '—'}</strong></a><br /><span class="muted">{c.full_name}</span></td>
          <td>{c.email}<br /><a href={waLink(c.whatsapp, `Hello ${c.full_name}, this is Mehfeez Jewels.`)} target="_blank" rel="noopener noreferrer">{c.whatsapp}</a></td>
          <td>{c.city}, {c.country}</td>
          <td>{c.business_type}</td>
          <td>{formatDate(c.created_at)}</td>
          <td><span class="badge" class:badge--solid={c.status === 'approved'} class:badge--dark={c.status === 'rejected'}>{c.status}</span></td>
          <td class="acts">
            {#if c.status !== 'approved'}
              <form method="POST" action="?/setStatus" use:enhance>
                <input type="hidden" name="id" value={c.id} /><input type="hidden" name="status" value="approved" />
                <button class="btn btn--sm" type="submit">Approve</button>
              </form>
            {/if}
            {#if c.status !== 'rejected'}
              <form method="POST" action="?/setStatus" use:enhance>
                <input type="hidden" name="id" value={c.id} /><input type="hidden" name="status" value="rejected" />
                <button class="btn btn--sm btn--outline" type="submit">Reject</button>
              </form>
            {/if}
          </td>
        </tr>
      {:else}
        <tr><td colspan="7" class="muted">No customers match these filters.</td></tr>
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
  .acts {
    display: flex;
    gap: 6px;
  }
  .pager {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 18px;
  }
</style>
