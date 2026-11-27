<script lang="ts">
  import { page } from '$app/state';
  import Logo from './Logo.svelte';
  import Icon from './Icon.svelte';
  import { waLink } from '$lib/whatsapp';
  import type { Category, Profile, SiteSettings } from '$lib/types';

  let {
    settings,
    categories,
    profile,
    loggedIn
  }: { settings: SiteSettings; categories: Category[]; profile: Profile | null; loggedIn: boolean } = $props();

  let open = $state(false);
  let menu = $state<string | null>(null);
  let searching = $state(false);
  let searchInput = $state<HTMLInputElement>();

  const bySlug = (slug: string) => categories.find((c) => c.slug === slug);
  const link = (slug: string, label: string) => ({ href: `/categories/${slug}`, label, exists: !!bySlug(slug) });

  // Navigation as per the brief (only categories that exist are shown).
  const productTypes = $derived(
    [
      link('earrings', 'Earrings'),
      link('necklace-sets', 'Necklace Sets'),
      link('choker-sets', 'Chokers'),
      link('bangles', 'Bangles'),
      link('bridal-jewellery', 'Bridal Jewellery'),
      link('pendant-sets', 'Pendant Sets'),
      link('complete-jewellery-sets', 'Complete Sets')
    ].filter((l) => l.exists)
  );
  const styles = $derived(
    [
      link('american-diamond-jewellery', 'American Diamond'),
      link('victorian-jewellery', 'Victorian Jewellery'),
      link('south-indian-jewellery', 'South Indian Jewellery'),
      link('heritage-jewellery', 'Heritage Jewellery'),
      link('traditional-jewellery', 'Traditional'),
      link('contemporary-jewellery', 'Contemporary')
    ].filter((l) => l.exists)
  );
  const wa = $derived(waLink(settings.whatsapp_number, settings.whatsapp_message));

  // B2B messages for the scrolling top bar (facts only — no invented numbers).
  const ticker = [
    'Wholesale only',
    'Direct from the manufacturer',
    'Bulk orders welcome',
    'MOQ per design',
    'New designs added regularly',
    'Approved buyers see wholesale prices',
    'Shipping across India & worldwide',
    'Video call available'
  ];

  function active(href: string) {
    const [path, q] = href.split('?');
    if (q) return page.url.pathname === path && page.url.search === `?${q}`;
    return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(path) && !page.url.search;
  }

  function toggleSearch() {
    searching = !searching;
    if (searching) setTimeout(() => searchInput?.focus(), 30);
  }

  $effect(() => {
    page.url.href;
    open = false;
    menu = null;
    searching = false;
  });
</script>

{#snippet dropdown(id: string, label: string, items: { href: string; label: string }[], viewAll: { href: string; label: string })}
  <div class="dd" role="presentation" onmouseenter={() => (menu = id)} onmouseleave={() => (menu = null)}>
    <button type="button" class="dd-btn" aria-expanded={menu === id} onclick={() => (menu = menu === id ? null : id)}>
      {label} <span class="caret" aria-hidden="true">▾</span>
    </button>
    {#if menu === id}
      <div class="dd-menu">
        {#each items as it}<a href={it.href}>{it.label}</a>{/each}
        <a class="all" href={viewAll.href}>{viewAll.label} →</a>
      </div>
    {/if}
  </div>
{/snippet}

<!-- Scrolling B2B announcement bar (pauses on hover; static for reduced-motion users) -->
<div class="topbar" aria-label="Wholesale information">
  <div class="marquee">
    {#each [0, 1] as copy}
      <div class="track" aria-hidden={copy === 1}>
        {#each ticker as t}
          <span>{t}</span><i aria-hidden="true">◆</i>
        {/each}
        <a href={wa} target="_blank" rel="noopener noreferrer" tabindex={copy === 1 ? -1 : 0}>WhatsApp {settings.contact_phone}</a><i aria-hidden="true">◆</i>
      </div>
    {/each}
  </div>
</div>

<header class="site-header">
  <div class="container bar">
    <button class="icon-btn burger" onclick={() => (open = !open)} aria-expanded={open} aria-controls="mobile-nav">
      <Icon name={open ? 'close' : 'menu'} size={24} stroke={1.4} />
      <span class="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
    </button>

    <nav class="nav nav-left" aria-label="Collections">
      {@render dropdown('cat', 'Categories', [{ href: '/collections?show=new', label: 'New Arrivals' }, ...productTypes], { href: '/collections', label: 'All designs' })}
      {@render dropdown('style', 'Styles', styles, { href: '/categories', label: 'All categories' })}
    </nav>

    <div class="brand"><Logo src={settings.logo_url} light /></div>

    <div class="right">
    <nav class="nav nav-right" aria-label="Main">
      <a href="/collections" class:active={active('/collections')}>All Designs</a>
      <a href="/wholesale-enquiry" class:active={active('/wholesale-enquiry')}>Wholesale Enquiry</a>
      <a href="/contact" class:active={active('/contact')}>Contact Us</a>
    </nav>

    <div class="tools">
      <button class="icon-btn" type="button" onclick={toggleSearch} aria-expanded={searching} aria-controls="site-search" aria-label="Search designs">
        <Icon name="search" size={20} stroke={1.4} />
      </button>
      <a class="icon-btn" href={loggedIn ? '/account' : '/login'} aria-label={loggedIn ? 'My account' : 'Login or register'} title={loggedIn ? 'My account' : 'Login / Register'}>
        <Icon name="user" size={21} stroke={1.4} />
      </a>
      {#if profile?.role === 'admin'}
        <a class="icon-btn hide-sm" href="/admin" aria-label="Admin panel" title="Admin panel"><Icon name="lock" size={19} stroke={1.4} /></a>
      {/if}
    </div>
    </div>
  </div>

  {#if searching}
    <form id="site-search" class="search" action="/collections" method="GET" role="search">
      <div class="container search-inner">
        <Icon name="search" size={18} stroke={1.4} />
        <input bind:this={searchInput} name="q" type="search" placeholder="Search designs or SKU…" aria-label="Search designs or SKU" />
        <button class="btn btn--light btn--sm" type="submit">Search</button>
      </div>
    </form>
  {/if}

  {#if open}
    <nav id="mobile-nav" class="mobile" aria-label="Mobile">
      <a href="/">Home</a>
      <a href="/collections">All Designs</a>
      <a href="/collections?show=new">New Arrivals</a>
      <span class="m-h">Categories</span>
      <div class="sub">{#each productTypes as l}<a href={l.href}>{l.label}</a>{/each}</div>
      <span class="m-h">Styles</span>
      <div class="sub">{#each styles as l}<a href={l.href}>{l.label}</a>{/each}</div>
      <a href="/about">About Us</a>
      <a href="/wholesale-enquiry">Wholesale Enquiry</a>
      <a href="/contact">Contact Us</a>
      {#if profile?.role === 'admin'}<a href="/admin">Admin panel</a>{/if}
      <div class="mobile-auth">
        {#if loggedIn}
          <a class="btn btn--light" href="/account">My account</a>
        {:else}
          <a class="btn btn--ghost-light" href="/login">Login</a>
          <a class="btn btn--light" href="/register">Register</a>
        {/if}
      </div>
    </nav>
  {/if}
</header>

<style>
  .topbar {
    background: var(--burgundy);
    color: var(--ivory);
    font-size: 0.68rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    overflow: hidden;
  }
  .marquee {
    display: flex;
    width: max-content;
    animation: ticker 45s linear infinite;
  }
  .topbar:hover .marquee {
    animation-play-state: paused;
  }
  .track {
    display: flex;
    align-items: center;
    gap: 18px;
    padding-right: 18px;
    min-height: 32px;
    white-space: nowrap;
  }
  .topbar i {
    font-style: normal;
    font-size: 0.5rem;
    opacity: 0.7;
  }
  .topbar a {
    color: var(--ivory);
  }
  @keyframes ticker {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .marquee {
      animation: none;
    }
  }

  .site-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--burgundy-deep);
    color: var(--ivory);
    border-bottom: 1px solid var(--ivory-20);
  }
  .bar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 8px;
    min-height: 76px;
  }
  .brand {
    grid-column: 2;
    display: flex;
    justify-content: center;
  }
  .burger {
    grid-column: 1;
    justify-self: start;
  }
  .right {
    grid-column: 3;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    min-width: 0;
  }
  .tools {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 2px;
  }
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 0;
    background: none;
    color: var(--ivory);
    cursor: pointer;
    text-decoration: none !important;
  }
  .icon-btn:hover {
    color: var(--white);
  }

  .nav {
    display: none;
    align-items: center;
    gap: clamp(14px, 1.6vw, 28px);
  }
  .nav a,
  .dd-btn {
    position: relative;
    color: var(--ivory);
    font: inherit;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    white-space: nowrap;
    padding: 32px 0;
    background: none;
    border: 0;
    cursor: pointer;
    text-decoration: none;
  }
  .nav a:hover,
  .nav a.active,
  .dd-btn:hover {
    color: var(--white);
  }
  .nav a::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 24px;
    height: 1px;
    background: var(--ivory);
    transform: scaleX(0);
    transition: transform 0.25s;
  }
  .nav a:hover::after,
  .nav a.active::after {
    transform: scaleX(1);
  }
  .caret {
    font-size: 0.6rem;
    margin-left: 2px;
  }
  .dd {
    position: relative;
  }
  .dd-menu {
    position: absolute;
    top: 100%;
    left: -22px;
    min-width: 240px;
    display: flex;
    flex-direction: column;
    padding: 12px 0;
    background: var(--ivory);
    border-top: 2px solid var(--burgundy);
    box-shadow: var(--shadow);
  }
  .dd-menu a {
    padding: 9px 22px;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: none;
    color: var(--charcoal);
  }
  .dd-menu a::after {
    display: none;
  }
  .dd-menu a:hover {
    color: var(--burgundy);
    background: var(--white);
  }
  .dd-menu .all {
    color: var(--burgundy);
    font-weight: 600;
    border-top: 1px solid var(--burgundy-15);
    margin-top: 6px;
    padding-top: 12px;
  }

  .search {
    background: var(--burgundy);
    border-top: 1px solid var(--ivory-20);
  }
  .search-inner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .search input {
    flex: 1;
    min-height: 42px;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--ivory-20);
    border-radius: 0;
    color: var(--white);
  }
  .search input::placeholder {
    color: var(--ivory-70);
  }
  .search input:focus {
    box-shadow: none;
    border-color: var(--ivory);
  }

  .mobile {
    display: flex;
    flex-direction: column;
    padding: 6px var(--gutter) 24px;
    background: var(--burgundy-deep);
    border-top: 1px solid var(--ivory-20);
    max-height: calc(100vh - 120px);
    overflow-y: auto;
  }
  .mobile > a {
    padding: 13px 0;
    border-bottom: 1px solid var(--ivory-20);
    color: var(--ivory);
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .m-h {
    margin-top: 14px;
    font-size: 0.66rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--ivory-70);
  }
  .sub {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 12px;
    padding: 6px 0 10px;
    border-bottom: 1px solid var(--ivory-20);
  }
  .sub a {
    padding: 6px 0;
    color: var(--ivory);
    font-size: 0.9rem;
  }
  .mobile-auth {
    display: flex;
    gap: 10px;
    margin-top: 18px;
  }
  .mobile-auth .btn {
    flex: 1;
  }

  @media (max-width: 560px) {
    .hide-sm {
      display: none;
    }
    .icon-btn {
      width: 32px;
    }
    .bar {
      gap: 4px;
    }
  }
  @media (min-width: 1280px) {
    .bar {
      min-height: 88px;
    }
    .nav {
      display: flex;
    }
    .nav-left {
      grid-column: 1;
      grid-row: 1;
    }
    .right {
      grid-row: 1;
      justify-content: space-between;
      padding-left: clamp(12px, 1.8vw, 36px);
    }
    .tools {
      gap: 0;
    }
    .burger,
    .mobile {
      display: none;
    }
  }
</style>
