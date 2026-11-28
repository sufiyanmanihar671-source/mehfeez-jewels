<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import { formatDate } from '$lib/format';
  let { data } = $props();
  const s = $derived(data.stats);
  const tiles = $derived([
    { label: 'Total customers', value: s.customers_total, href: '/admin/customers' },
    { label: 'Approved', value: s.customers_approved, href: '/admin/customers?status=approved' },
    { label: 'Pending approval', value: s.customers_pending, href: '/admin/customers?status=pending', hot: true },
    { label: 'Rejected', value: s.customers_rejected, href: '/admin/customers?status=rejected' },
    { label: 'Products (published)', value: `${s.products_published ?? 0} / ${s.products_total ?? 0}`, href: '/admin/products' },
    { label: 'Categories', value: s.categories_total, href: '/admin/categories' },
    { label: 'New enquiries', value: s.enquiries_new, href: '/admin/enquiries?status=new', hot: true },
    { label: 'All enquiries', value: s.enquiries_total, href: '/admin/enquiries' }
  ]);
</script>

<Seo title="Admin dashboard" noindex />

<h1>Dashboard</h1>

<div class="quick">
  <a class="btn" href="/admin/products/new">+ Add product</a>
  <a class="btn btn--outline" href="/admin/customers?status=pending">Approve customers{#if s.customers_pending} ({s.customers_pending}){/if}</a>
  <a class="btn btn--outline" href="/admin/enquiries?status=new">New enquiries{#if s.enquiries_new} ({s.enquiries_new}){/if}</a>
  <a class="btn btn--outline" href="/" target="_blank">View website ↗</a>
</div>

<div class="tiles">
  {#each tiles as t}
    <a class="tile" class:hot={t.hot && Number(t.value) > 0} href={t.href}>
      <span class="v">{t.value ?? 0}</span>
      <span class="l">{t.label}</span>
    </a>
  {/each}
</div>

<div class="two">
  <section class="card">
    <div class="toolbar"><h2>Awaiting approval</h2><a href="/admin/customers?status=pending">View all</a></div>
    {#if data.pending.length}
      <ul class="list">
        {#each data.pending as c (c.id)}
          <li><a href={`/admin/customers/${c.id}`}><strong>{c.company_name || c.full_name}</strong></a><span class="muted">{c.country} · {formatDate(c.created_at)}</span></li>
        {/each}
      </ul>
    {:else}<p class="muted">No customers are waiting for approval.</p>{/if}
  </section>
  <section class="card">
    <div class="toolbar"><h2>Latest enquiries</h2><a href="/admin/enquiries">View all</a></div>
    {#if data.enquiries.length}
      <ul class="list">
        {#each data.enquiries as e (e.id)}
          <li>
            <a href={`/admin/enquiries/${e.id}`}><strong>{e.business_name}</strong> — {e.full_name}</a>
            <span class="muted">{e.country} · {formatDate(e.created_at)} · <span class="badge">{e.status.replace('_', ' ')}</span></span>
          </li>
        {/each}
      </ul>
    {:else}<p class="muted">No enquiries yet.</p>{/if}
  </section>
</div>

<style>
  .quick {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 18px;
  }
  .quick .btn {
    min-height: 46px;
    padding: 0 10px;
    font-size: 0.7rem;
  }
  @media (min-width: 900px) {
    .quick {
      display: flex;
      flex-wrap: wrap;
    }
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 26px;
  }
  @media (min-width: 900px) {
    .tiles {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  .tile {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px;
    background: var(--white);
    border: 1px solid var(--charcoal-08);
    border-radius: var(--radius-lg);
    color: var(--charcoal);
    text-decoration: none !important;
  }
  .tile.hot {
    border-color: var(--burgundy);
    box-shadow: inset 4px 0 0 var(--burgundy);
  }
  .v {
    font-family: var(--font-display);
    font-size: clamp(1.6rem, 5vw, 2.2rem);
    font-weight: 700;
    color: var(--burgundy);
    line-height: 1;
  }
  .l {
    font-size: 0.82rem;
    color: var(--charcoal-70);
  }
  .two {
    display: grid;
    gap: 20px;
  }
  @media (min-width: 1100px) {
    .two {
      grid-template-columns: 1fr 1fr;
    }
  }
  h2 {
    font-size: 1.4rem;
    margin: 0;
  }
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .list li {
    display: flex;
    flex-direction: column;
    padding: 10px 0;
    border-bottom: 1px solid var(--charcoal-08);
    font-size: 0.93rem;
  }
</style>
