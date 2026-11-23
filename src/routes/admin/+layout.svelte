<script lang="ts">
  import { page } from '$app/state';
  let { data, children } = $props();
  const nav = $derived([
    { href: '/admin', label: 'Dashboard', exact: true },
    { href: '/admin/customers', label: 'Customers', count: data.pendingCount },
    { href: '/admin/products', label: 'Products & Prices' },
    { href: '/admin/categories', label: 'Categories' },
    { href: '/admin/hero', label: 'Homepage Slides' },
    { href: '/admin/enquiries', label: 'Enquiries', count: data.newEnquiries },
    { href: '/admin/settings', label: 'Settings' }
  ]);
  const isActive = (href: string, exact?: boolean) => (exact ? page.url.pathname === href : page.url.pathname.startsWith(href));
</script>

<svelte:head><meta name="robots" content="noindex, nofollow" /></svelte:head>

<div class="admin">
  <aside class="side">
    <div class="title">Admin</div>
    <nav aria-label="Admin">
      {#each nav as n}
        <a href={n.href} class:active={isActive(n.href, n.exact)}>
          {n.label}
          {#if n.count}<span class="count">{n.count}</span>{/if}
        </a>
      {/each}
    </nav>
    <div class="foot">
      <a href="/">← View website</a>
      <form method="POST" action="/logout"><button type="submit">Logout</button></form>
    </div>
  </aside>
  <div class="content">
    {@render children()}
  </div>
</div>

<style>
  .admin {
    display: grid;
    min-height: calc(100vh - var(--header-h));
    background: var(--ivory);
  }
  @media (min-width: 960px) {
    .admin {
      grid-template-columns: 240px 1fr;
    }
  }
  .side {
    background: var(--charcoal);
    color: var(--ivory);
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .title {
    font-family: var(--font-display);
    font-size: 1.4rem;
    color: var(--white);
    padding: 0 10px;
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  @media (min-width: 960px) {
    nav {
      flex-direction: column;
      flex-wrap: nowrap;
    }
    .side {
      position: sticky;
      top: var(--header-h);
      height: calc(100vh - var(--header-h));
    }
  }
  nav a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: var(--radius);
    color: var(--ivory-70);
    font-size: 0.92rem;
    text-decoration: none;
  }
  nav a:hover {
    background: rgba(255, 255, 255, 0.06);
    color: var(--white);
  }
  nav a.active {
    background: var(--burgundy);
    color: var(--white);
  }
  .count {
    background: var(--white);
    color: var(--burgundy);
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 1px 8px;
  }
  .foot {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    font-size: 0.85rem;
  }
  .foot a {
    color: var(--ivory-70);
  }
  .foot button {
    background: none;
    border: 1px solid var(--ivory-20);
    color: var(--ivory);
    border-radius: var(--radius);
    padding: 6px 12px;
    cursor: pointer;
    font: inherit;
  }
  .content {
    padding: clamp(20px, 3vw, 40px) var(--gutter);
    min-width: 0;
  }
  .content :global(h1) {
    font-size: clamp(1.8rem, 3vw, 2.4rem);
  }
  .content :global(.toolbar) {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }
  .content :global(.filters) {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .content :global(.filters input),
  .content :global(.filters select) {
    min-height: 40px;
    width: auto;
    padding: 6px 12px;
  }
</style>
