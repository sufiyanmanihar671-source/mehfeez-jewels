<script lang="ts">
  import { page } from '$app/state';
  import ProductCard from './ProductCard.svelte';
  import Icon from './Icon.svelte';
  import type { Category, Price, Product } from '$lib/types';

  let {
    products,
    prices,
    total,
    pageNo,
    pages,
    q,
    show,
    sort,
    categories,
    activeCategory = null,
    loggedIn,
    status
  }: {
    products: Product[];
    prices: Record<string, Price>;
    total: number;
    pageNo: number;
    pages: number;
    q: string;
    show: string;
    sort: string;
    categories: Category[];
    activeCategory?: string | null;
    loggedIn: boolean;
    status: 'pending' | 'approved' | 'rejected' | null | undefined;
  } = $props();

  function pageHref(n: number) {
    const u = new URL(page.url);
    u.searchParams.set('page', String(n));
    return u.pathname + u.search;
  }
</script>

<div class="layout">
  <aside class="filters">
    <form method="GET" class="search" role="search">
      <label class="sr-only" for="q">Search designs</label>
      <input id="q" name="q" type="search" placeholder="Search name or SKU" value={q} />
      {#if show}<input type="hidden" name="show" value={show} />{/if}
      <button class="btn btn--sm" type="submit" aria-label="Search"><Icon name="search" size={16} /></button>
    </form>
    <nav aria-label="Categories">
      <h4>Categories</h4>
      <a href="/collections" class:active={!activeCategory && !show}>All designs</a>
      {#each categories as c}
        <a href={`/categories/${c.slug}`} class:active={activeCategory === c.slug}>{c.name}</a>
      {/each}
    </nav>
    <nav aria-label="Highlights">
      <h4>Highlights</h4>
      <a href="/collections?show=featured" class:active={show === 'featured'}>Featured</a>
      <a href="/collections?show=new" class:active={show === 'new'}>New arrivals</a>
      <a href="/collections?show=bestsellers" class:active={show === 'bestsellers'}>Bestsellers</a>
    </nav>
  </aside>

  <div>
    <div class="toolbar">
      <span class="muted">{total} {total === 1 ? 'design' : 'designs'}{q ? ` matching “${q}”` : ''}</span>
      <form method="GET">
        {#if q}<input type="hidden" name="q" value={q} />{/if}
        {#if show}<input type="hidden" name="show" value={show} />{/if}
        <label class="sr-only" for="sort">Sort</label>
        <select id="sort" name="sort" onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()}>
          <option value="newest" selected={sort === 'newest'}>Newest first</option>
          <option value="name" selected={sort === 'name'}>Name A–Z</option>
        </select>
        <noscript><button class="btn btn--sm" type="submit">Apply</button></noscript>
      </form>
    </div>

    {#if products.length}
      <div class="grid grid--products">
        {#each products as p (p.id)}
          <ProductCard product={p} price={prices[p.id]} {loggedIn} {status} />
        {/each}
      </div>
      {#if pages > 1}
        <nav class="pager" aria-label="Pagination">
          {#if pageNo > 1}<a class="btn btn--sm btn--outline" href={pageHref(pageNo - 1)} rel="prev">Previous</a>{/if}
          <span>Page {pageNo} of {pages}</span>
          {#if pageNo < pages}<a class="btn btn--sm btn--outline" href={pageHref(pageNo + 1)} rel="next">Next</a>{/if}
        </nav>
      {/if}
    {:else}
      <div class="empty">
        <p>No designs found{q ? ' for this search' : ' in this collection yet'}.</p>
        <a class="btn btn--sm" href="/wholesale-enquiry">Ask our team</a>
      </div>
    {/if}
  </div>
</div>

<style>
  .layout {
    display: grid;
    gap: 28px;
  }
  @media (min-width: 1000px) {
    .layout {
      grid-template-columns: 250px 1fr;
      gap: 40px;
    }
    .filters {
      position: sticky;
      top: calc(var(--header-h) + 20px);
      align-self: start;
    }
  }
  .filters {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .search {
    display: flex;
    gap: 6px;
  }
  .search .btn {
    min-height: 48px;
    padding: 0 14px;
  }
  nav h4 {
    font-family: var(--font-body);
    font-size: 0.72rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .filters nav {
    display: flex;
    flex-direction: column;
  }
  .filters nav a {
    padding: 7px 0 7px 12px;
    border-left: 2px solid var(--charcoal-08);
    color: var(--charcoal-70);
    font-size: 0.93rem;
  }
  .filters nav a.active {
    border-left-color: var(--burgundy);
    color: var(--burgundy);
    font-weight: 500;
  }
  @media (max-width: 999px) {
    .filters nav {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 6px;
    }
    .filters nav h4 {
      width: 100%;
    }
    .filters nav a {
      border: 1px solid var(--charcoal-15);
      border-radius: 999px;
      padding: 6px 12px;
      font-size: 0.82rem;
      background: var(--white);
    }
    .filters nav a.active {
      background: var(--burgundy);
      color: var(--white);
      border-color: var(--burgundy);
    }
  }
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .toolbar select {
    min-height: 40px;
    padding: 6px 12px;
    width: auto;
  }
  .pager {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 36px;
  }
</style>
