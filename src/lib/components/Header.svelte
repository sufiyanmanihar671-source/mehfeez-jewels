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
  let catsOpen = $state(false);

  const left = [
    { href: '/', label: 'Home' },
    { href: '/collections', label: 'Collections', menu: true },
    { href: '/about', label: 'About Us' },
    { href: '/#why-mehfeez', label: 'Why Choose Us' }
  ];
  const right = [
    { href: '/wholesale-enquiry', label: 'B2B Enquiry' },
    { href: '/contact', label: 'Contact' }
  ];
  const types = $derived(categories.filter((c) => (c.category_group ?? 'type') === 'type'));
  const styles = $derived(categories.filter((c) => c.category_group === 'style'));
  const wa = $derived(waLink(settings.whatsapp_number, settings.whatsapp_message));

  function active(href: string) {
    if (href.includes('#')) return false;
    return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
  }

  $effect(() => {
    page.url.pathname;
    open = false;
    catsOpen = false;
  });
</script>

<!-- Slim announcement / contact bar -->
<div class="topbar">
  <div class="container topbar-inner">
    <span class="tb-item"><Icon name="pin" size={13} /> Mumbai, India</span>
    {#if settings.contact_email}
      <a class="tb-item hide-sm" href={`mailto:${settings.contact_email}`}><Icon name="mail" size={13} /> {settings.contact_email}</a>
    {/if}
    <span class="tb-item hide-sm">Wholesale enquiries welcome · India &amp; international</span>
    <a class="tb-item" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={13} /> {settings.contact_phone}</a>
  </div>
</div>

<header class="site-header">
  <div class="container bar">
    <button class="burger" onclick={() => (open = !open)} aria-expanded={open} aria-controls="mobile-nav">
      <Icon name={open ? 'close' : 'menu'} size={24} />
      <span class="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
    </button>

    <nav class="nav nav-left" aria-label="Main">
      {#each left as l}
        {#if l.menu}
          <div class="dropdown" role="presentation" onmouseenter={() => (catsOpen = true)} onmouseleave={() => (catsOpen = false)}>
            <a href={l.href} class:active={active(l.href)} aria-haspopup="true" aria-expanded={catsOpen}>{l.label} <span class="caret">▾</span></a>
            {#if catsOpen && categories.length}
              <div class="mega">
                <div>
                  <h4>By category</h4>
                  {#each types as c}<a href={`/categories/${c.slug}`}>{c.name}</a>{/each}
                </div>
                {#if styles.length}
                  <div>
                    <h4>By jewellery style</h4>
                    {#each styles as c}<a href={`/categories/${c.slug}`}>{c.name}</a>{/each}
                  </div>
                {/if}
                <div>
                  <h4>Highlights</h4>
                  <a href="/collections?show=new">New arrivals</a>
                  <a href="/collections?show=featured">Featured designs</a>
                  <a href="/collections?show=bestsellers">Bestsellers</a>
                  <a href="/collections">View all designs</a>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <a href={l.href} class:active={active(l.href)} aria-current={active(l.href) ? 'page' : undefined}>{l.label}</a>
        {/if}
      {/each}
    </nav>

    <div class="brand"><Logo src={settings.logo_url} /></div>

    <nav class="nav nav-right" aria-label="Business">
      {#each right as l}
        <a href={l.href} class:active={active(l.href)} aria-current={active(l.href) ? 'page' : undefined}>{l.label}</a>
      {/each}
    </nav>

    <div class="tools">
      {#if profile?.role === 'admin'}
        <a class="icon-link hide-sm" href="/admin" title="Admin panel" aria-label="Admin panel"><Icon name="lock" size={20} /></a>
      {/if}
      <a class="icon-link" href={loggedIn ? '/account' : '/login'} title={loggedIn ? 'My account' : 'Login / Register'} aria-label={loggedIn ? 'My account' : 'Login or register'}>
        <Icon name="user" size={21} />
      </a>
      <a class="wa-btn" href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp us">
        <Icon name="whatsapp" size={18} /><span>WhatsApp</span>
      </a>
    </div>
  </div>

  <!-- Mobile quick links (reference-style pill row) -->
  <nav class="quick" aria-label="Quick links">
    <a href="/collections" class:active={active('/collections')}>Collections</a>
    <a href="/wholesale-enquiry" class:active={active('/wholesale-enquiry')}>B2B Enquiry</a>
    <a href="/contact" class:active={active('/contact')}>Contact</a>
  </nav>

  {#if open}
    <nav id="mobile-nav" class="mobile" aria-label="Mobile">
      <a href="/">Home</a>
      <a href="/collections">All collections</a>
      <div class="sub">
        {#each categories as c}<a href={`/categories/${c.slug}`}>{c.name}</a>{/each}
      </div>
      <a href="/about">About Us</a>
      <a href="/#why-mehfeez">Why Choose Us</a>
      <a href="/wholesale-enquiry">B2B Enquiry</a>
      <a href="/contact">Contact</a>
      {#if profile?.role === 'admin'}<a href="/admin">Admin panel</a>{/if}
      <div class="mobile-auth">
        {#if loggedIn}
          <a class="btn btn--outline" href="/account">My account</a>
        {:else}
          <a class="btn btn--outline" href="/login">Login</a>
          <a class="btn" href="/register">Register</a>
        {/if}
      </div>
    </nav>
  {/if}
</header>

<style>
  .topbar {
    background: var(--burgundy-deep);
    color: var(--ivory);
    font-size: 0.76rem;
    letter-spacing: 0.04em;
  }
  .topbar-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px 26px;
    min-height: 34px;
    flex-wrap: wrap;
  }
  .tb-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--ivory);
    opacity: 0.92;
  }
  a.tb-item:hover {
    opacity: 1;
  }

  .site-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 249, 243, 0.97);
    backdrop-filter: saturate(1.3) blur(10px);
    border-bottom: 1px solid var(--burgundy-15);
  }
  .bar {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
    min-height: 72px;
  }
  .brand {
    display: flex;
    justify-content: center;
  }
  .nav {
    display: none;
    align-items: center;
    gap: clamp(14px, 1.7vw, 30px);
  }
  .nav a,
  .dropdown > a {
    position: relative;
    color: var(--charcoal);
    font-size: 0.74rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    white-space: nowrap;
    padding: 30px 0;
    text-decoration: none;
  }
  .nav a:hover,
  .nav a.active {
    color: var(--burgundy);
  }
  .nav a.active::after,
  .nav > a:hover::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 22px;
    height: 1px;
    background: var(--burgundy);
  }
  .caret {
    font-size: 0.6rem;
  }
  .dropdown {
    position: relative;
  }
  .mega {
    position: absolute;
    top: 100%;
    left: -24px;
    display: grid;
    grid-template-columns: repeat(3, minmax(190px, 1fr));
    gap: 28px;
    padding: 26px 30px;
    background: var(--white);
    border: 1px solid var(--burgundy-15);
    border-top: 2px solid var(--burgundy);
    box-shadow: var(--shadow);
  }
  .mega h4 {
    font-family: var(--font-body);
    font-size: 0.68rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--burgundy-accent);
    margin-bottom: 10px;
  }
  .mega a {
    display: block;
    padding: 6px 0;
    color: var(--charcoal);
    font-size: 0.92rem;
    white-space: nowrap;
  }
  .mega a:hover {
    color: var(--burgundy);
  }

  .tools {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }
  .icon-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    color: var(--charcoal);
  }
  .icon-link:hover {
    color: var(--burgundy);
  }
  .wa-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 16px;
    margin-left: 6px;
    background: var(--burgundy);
    color: var(--white);
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    text-decoration: none !important;
  }
  .wa-btn:hover {
    background: var(--burgundy-deep);
  }
  .burger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border: 0;
    background: none;
    color: var(--charcoal);
    cursor: pointer;
  }

  .quick {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-top: 1px solid var(--burgundy-15);
  }
  .quick a {
    text-align: center;
    padding: 11px 4px;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--charcoal);
    border-left: 1px solid var(--burgundy-15);
  }
  .quick a:first-child {
    border-left: 0;
  }
  .quick a.active {
    color: var(--burgundy);
  }

  .mobile {
    display: flex;
    flex-direction: column;
    padding: 6px var(--gutter) 24px;
    background: var(--ivory);
    border-top: 1px solid var(--burgundy-15);
    max-height: calc(100vh - 140px);
    overflow-y: auto;
  }
  .mobile > a {
    padding: 14px 0;
    border-bottom: 1px solid var(--charcoal-08);
    color: var(--charcoal);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-size: 0.8rem;
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
    color: var(--muted);
    padding: 6px 0;
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
    .wa-btn span {
      display: none;
    }
    .wa-btn {
      padding: 0 11px;
      margin-left: 0;
    }
  }
  @media (min-width: 1100px) {
    .bar {
      grid-template-columns: 1fr auto 1fr;
      min-height: 84px;
    }
    .nav {
      display: flex;
    }
    .nav-left {
      grid-column: 1;
      grid-row: 1;
    }
    .brand {
      grid-column: 2;
      grid-row: 1;
    }
    .nav-right {
      grid-column: 3;
      grid-row: 1;
      justify-self: start;
      padding-left: clamp(16px, 2vw, 34px);
    }
    .tools {
      grid-column: 3;
      grid-row: 1;
      justify-self: end;
    }
    .burger,
    .quick,
    .mobile {
      display: none;
    }
  }
</style>
