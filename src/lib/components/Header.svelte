<script lang="ts">
  import { page } from '$app/state';
  import Logo from './Logo.svelte';
  import Icon from './Icon.svelte';
  import type { Category, Profile } from '$lib/types';

  let {
    logo,
    categories,
    profile,
    loggedIn
  }: { logo: string | null; categories: Category[]; profile: Profile | null; loggedIn: boolean } = $props();

  let open = $state(false);
  let catsOpen = $state(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/collections', label: 'Collections' }
  ];

  function active(href: string) {
    return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
  }

  $effect(() => {
    page.url.pathname;
    open = false;
    catsOpen = false;
  });
</script>

<header class="site-header">
  <div class="container bar">
    <Logo src={logo} />

    <nav class="desktop" aria-label="Main">
      {#each links as l}
        <a href={l.href} class:active={active(l.href)} aria-current={active(l.href) ? 'page' : undefined}>{l.label}</a>
      {/each}
      <div
        class="dropdown"
        role="presentation"
        onmouseenter={() => (catsOpen = true)}
        onmouseleave={() => (catsOpen = false)}
      >
        <a href="/categories" class:active={active('/categories')} aria-haspopup="true" aria-expanded={catsOpen}
          >Jewellery Categories</a
        >
        {#if catsOpen && categories.length}
          <div class="menu">
            {#each categories as c}
              <a href={`/categories/${c.slug}`}>{c.name}</a>
            {/each}
          </div>
        {/if}
      </div>
      <a href="/wholesale-enquiry" class:active={active('/wholesale-enquiry')}>Wholesale Enquiry</a>
      <a href="/contact" class:active={active('/contact')}>Contact Us</a>
    </nav>

    <div class="actions">
      {#if loggedIn}
        {#if profile?.role === 'admin'}
          <a class="btn btn--sm btn--outline" href="/admin">Admin</a>
        {/if}
        <a class="btn btn--sm" href="/account"><Icon name="user" size={16} /> My Account</a>
      {:else}
        <a class="btn btn--sm btn--outline hide-sm" href="/login">Login</a>
        <a class="btn btn--sm hide-sm" href="/register">Register</a>
      {/if}
      <button class="burger" onclick={() => (open = !open)} aria-expanded={open} aria-controls="mobile-nav">
        <Icon name={open ? 'close' : 'menu'} size={24} />
        <span class="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
      </button>
    </div>
  </div>

  {#if open}
    <nav id="mobile-nav" class="mobile" aria-label="Mobile">
      {#each links as l}
        <a href={l.href} class:active={active(l.href)}>{l.label}</a>
      {/each}
      <a href="/categories" class:active={active('/categories')}>Jewellery Categories</a>
      <div class="sub">
        {#each categories as c}
          <a href={`/categories/${c.slug}`}>{c.name}</a>
        {/each}
      </div>
      <a href="/wholesale-enquiry">Wholesale Enquiry</a>
      <a href="/contact">Contact Us</a>
      {#if !loggedIn}
        <div class="mobile-auth">
          <a class="btn btn--outline" href="/login">Login</a>
          <a class="btn" href="/register">Register</a>
        </div>
      {/if}
    </nav>
  {/if}
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: saturate(1.4) blur(10px);
    border-bottom: 1px solid var(--charcoal-08);
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: var(--header-h);
  }
  .desktop {
    display: none;
    gap: 26px;
    align-items: center;
  }
  .desktop > a,
  .dropdown > a {
    color: var(--charcoal);
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 26px 0;
    position: relative;
    text-decoration: none;
  }
  .desktop a.active::after,
  .desktop > a:hover::after,
  .dropdown > a:hover::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 18px;
    height: 1px;
    background: var(--burgundy);
  }
  .desktop a.active {
    color: var(--burgundy);
  }
  .dropdown {
    position: relative;
  }
  .menu {
    position: absolute;
    top: 100%;
    left: -20px;
    min-width: 260px;
    background: var(--white);
    border: 1px solid var(--charcoal-08);
    border-top: 2px solid var(--burgundy);
    box-shadow: var(--shadow);
    padding: 10px 0;
    display: flex;
    flex-direction: column;
  }
  .menu a {
    padding: 9px 20px;
    color: var(--charcoal);
    font-size: 0.92rem;
  }
  .menu a:hover {
    background: var(--ivory);
    color: var(--burgundy);
    text-decoration: none;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .burger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--charcoal-15);
    background: var(--white);
    color: var(--burgundy);
    border-radius: var(--radius);
    cursor: pointer;
  }
  .mobile {
    display: flex;
    flex-direction: column;
    padding: 8px var(--gutter) 24px;
    background: var(--white);
    border-top: 1px solid var(--charcoal-08);
    max-height: calc(100vh - var(--header-h));
    overflow-y: auto;
  }
  .mobile > a {
    padding: 14px 0;
    border-bottom: 1px solid var(--charcoal-08);
    color: var(--charcoal);
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-size: 0.85rem;
  }
  .mobile a.active {
    color: var(--burgundy);
  }
  .sub {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 12px;
    padding: 8px 0 12px;
    border-bottom: 1px solid var(--charcoal-08);
  }
  .sub a {
    font-size: 0.88rem;
    color: var(--charcoal-70);
    padding: 6px 0;
  }
  .mobile-auth {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 18px;
  }
  @media (max-width: 560px) {
    .hide-sm {
      display: none;
    }
  }
  @media (min-width: 1100px) {
    .desktop {
      display: flex;
    }
    .burger,
    .mobile {
      display: none;
    }
  }
</style>
