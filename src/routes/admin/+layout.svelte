<script lang="ts">
  import { page } from '$app/state';
  import Icon from '$lib/components/Icon.svelte';

  let { data, children } = $props();

  type Item = { href: string; label: string; short: string; icon: 'home' | 'user' | 'designs' | 'mail' | 'grid' | 'image' | 'settings'; exact?: boolean; count?: number };
  const nav = $derived<Item[]>([
    { href: '/admin', label: 'Dashboard', short: 'Home', icon: 'home', exact: true },
    { href: '/admin/customers', label: 'Customers', short: 'Customers', icon: 'user', count: data.pendingCount },
    { href: '/admin/products', label: 'Products & Prices', short: 'Products', icon: 'designs' },
    { href: '/admin/enquiries', label: 'Enquiries', short: 'Enquiries', icon: 'mail', count: data.newEnquiries },
    { href: '/admin/categories', label: 'Categories', short: 'Categories', icon: 'grid' },
    { href: '/admin/hero', label: 'Homepage Slides', short: 'Slides', icon: 'image' },
    { href: '/admin/settings', label: 'Settings', short: 'Settings', icon: 'settings' }
  ]);
  // Phone bottom bar: the four most used sections + "More" for the rest.
  const main = $derived(nav.slice(0, 4));
  const more = $derived(nav.slice(4));

  const isActive = (href: string, exact?: boolean) => (exact ? page.url.pathname === href : page.url.pathname.startsWith(href));
  const moreActive = $derived(more.some((n) => isActive(n.href)));

  let sheet = $state(false);
  $effect(() => {
    page.url.pathname;
    sheet = false;
  });
</script>

<svelte:head><meta name="robots" content="noindex, nofollow" /></svelte:head>
<svelte:window onkeydown={(e) => e.key === 'Escape' && (sheet = false)} />

<div class="admin">
  <!-- Desktop sidebar -->
  <aside class="side">
    <div class="title">Admin panel</div>
    <nav aria-label="Admin">
      {#each nav as n}
        <a href={n.href} class:active={isActive(n.href, n.exact)}>
          <Icon name={n.icon} size={18} stroke={1.5} />
          <span class="lbl">{n.label}</span>
          {#if n.count}<span class="count">{n.count}</span>{/if}
        </a>
      {/each}
    </nav>
    <div class="foot">
      <a href="/" target="_blank">View website ↗</a>
      <form method="POST" action="/logout"><button type="submit">Logout</button></form>
    </div>
  </aside>

  <div class="content">
    {@render children()}
  </div>
</div>

<!-- Phone: bottom tab bar -->
{#if sheet}
  <button class="backdrop" type="button" aria-label="Close menu" onclick={() => (sheet = false)}></button>
  <div class="sheet" role="dialog" aria-modal="true" aria-label="More admin sections">
    <div class="sheet-grid">
      {#each more as n}
        <a href={n.href} class:active={isActive(n.href)}><Icon name={n.icon} size={22} stroke={1.4} /><span>{n.label}</span></a>
      {/each}
      <a href="/" target="_blank"><Icon name="globe" size={22} stroke={1.4} /><span>View website</span></a>
    </div>
    <form method="POST" action="/logout"><button class="btn btn--outline btn--block" type="submit">Logout</button></form>
  </div>
{/if}
<nav class="tabs" aria-label="Admin sections">
  {#each main as n}
    <a href={n.href} class:on={isActive(n.href, n.exact)}>
      <span class="ic"><Icon name={n.icon} size={20} stroke={1.5} />{#if n.count}<span class="dot">{n.count > 9 ? '9+' : n.count}</span>{/if}</span>
      <span>{n.short}</span>
    </a>
  {/each}
  <button type="button" class:on={sheet || moreActive} aria-expanded={sheet} onclick={() => (sheet = !sheet)}>
    <span class="ic"><Icon name="menu" size={20} stroke={1.5} /></span><span>More</span>
  </button>
</nav>

<style>
  .admin {
    display: grid;
    min-height: calc(100vh - var(--header-h));
    background: var(--ivory);
  }
  .side {
    display: none;
  }
  @media (min-width: 960px) {
    .admin {
      grid-template-columns: 240px minmax(0, 1fr);
    }
    .side {
      position: sticky;
      top: var(--header-h);
      height: calc(100vh - var(--header-h));
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 22px 14px;
      background: var(--burgundy-deep);
      color: var(--ivory);
    }
    .tabs,
    .sheet,
    .backdrop {
      display: none !important;
    }
  }
  .title {
    padding: 0 10px;
    font-family: var(--font-display);
    font-size: 1.35rem;
    color: var(--white);
  }
  .side nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .side nav a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    color: var(--ivory-70);
    font-size: 0.92rem;
    text-decoration: none;
  }
  .side nav a:hover {
    background: rgba(255, 255, 255, 0.07);
    color: var(--white);
  }
  .side nav a.active {
    background: var(--ivory);
    color: var(--burgundy);
    font-weight: 600;
  }
  .lbl {
    flex: 1;
  }
  .count {
    min-width: 22px;
    padding: 1px 7px;
    border-radius: 999px;
    background: var(--ivory);
    color: var(--burgundy);
    font-size: 0.72rem;
    font-weight: 700;
    text-align: center;
  }
  .side nav a.active .count {
    background: var(--burgundy);
    color: var(--white);
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
    padding: 6px 12px;
    border: 1px solid var(--ivory-20);
    background: none;
    color: var(--ivory);
    font: inherit;
    cursor: pointer;
  }

  .content {
    min-width: 0;
    padding: clamp(16px, 3vw, 40px) var(--gutter) clamp(24px, 3vw, 40px);
  }
  @media (max-width: 959px) {
    .content {
      padding-bottom: calc(96px + env(safe-area-inset-bottom));
    }
  }

  /* phone tab bar */
  .tabs {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 70;
    display: flex;
    padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
    background: var(--burgundy-deep);
    border-top: 1px solid var(--ivory-20);
  }
  .tabs a,
  .tabs button {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 4px 2px;
    border: 0;
    background: none;
    color: var(--ivory-70);
    font: inherit;
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    white-space: nowrap;
    text-decoration: none !important;
    cursor: pointer;
  }
  .tabs .on {
    color: var(--white);
  }
  .tabs .on > span:last-child {
    border-bottom: 1px solid var(--ivory);
  }
  .ic {
    position: relative;
    display: inline-flex;
  }
  .dot {
    position: absolute;
    top: -6px;
    right: -12px;
    min-width: 17px;
    height: 17px;
    padding: 0 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: var(--ivory);
    color: var(--burgundy);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0;
  }
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 68;
    border: 0;
    background: rgba(30, 4, 12, 0.5);
  }
  .sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: calc(58px + env(safe-area-inset-bottom));
    z-index: 69;
    display: grid;
    gap: 14px;
    padding: 18px 16px;
    background: var(--ivory);
    border-radius: 18px 18px 0 0;
  }
  .sheet-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .sheet-grid a {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 54px;
    padding: 10px 14px;
    background: var(--white);
    border: 1px solid var(--burgundy-15);
    color: var(--charcoal);
    font-size: 0.92rem;
    font-weight: 500;
    text-decoration: none !important;
  }
  .sheet-grid a :global(svg) {
    color: var(--burgundy);
  }
  .sheet-grid a.active {
    border-color: var(--burgundy);
    color: var(--burgundy);
  }

  /* shared admin helpers */
  .content :global(h1) {
    font-size: clamp(1.5rem, 3vw, 2.3rem);
    margin-bottom: 14px;
  }
  .content :global(.toolbar) {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .content :global(.toolbar h1) {
    margin-bottom: 0;
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
  .content :global(.chips) {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 2px;
  }
  .content :global(.chips .btn) {
    flex: none;
  }
  @media (max-width: 759px) {
    .content :global(.card) {
      padding: 16px;
    }
    .content :global(.filters) {
      width: 100%;
    }
    .content :global(.filters input[type='search']) {
      flex: 1 1 160px;
    }
    /* Tables become stacked cards on phones (cells carry data-label). */
    .content :global(.table-wrap) {
      background: none;
      border: 0;
      overflow: visible;
    }
    .content :global(table.rt),
    .content :global(table.rt tbody),
    .content :global(table.rt tr),
    .content :global(table.rt td) {
      display: block;
      width: 100%;
    }
    .content :global(table.rt thead) {
      display: none;
    }
    .content :global(table.rt tr) {
      margin-bottom: 12px;
      padding: 12px 14px;
      background: var(--white);
      border: 1px solid var(--burgundy-15);
      border-left: 3px solid var(--burgundy);
    }
    .content :global(table.rt td) {
      padding: 5px 0;
      border: 0;
    }
    .content :global(table.rt td[data-label]::before) {
      content: attr(data-label);
      display: block;
      margin-bottom: 2px;
      font-size: 0.64rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .content :global(table.rt td.hide-sm) {
      display: none;
    }
  }
</style>
