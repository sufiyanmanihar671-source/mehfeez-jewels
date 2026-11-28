<script lang="ts">
  import { page } from '$app/state';
  import Icon from './Icon.svelte';
  import { waLink } from '$lib/whatsapp';
  import { imageUrl } from '$lib/image';
  import { cart } from '$lib/cart.svelte';
  import type { Category, SiteSettings } from '$lib/types';

  /**
   * App-style bottom bar on phones with the key B2B actions.
   * Home · Discover · WhatsApp (centre) · Enquiry Cart · Login/Account.
   * "Discover" opens a sheet of category boxes (same look as the homepage).
   */
  let {
    settings,
    categories = [],
    chatHref = null,
    loggedIn = false
  }: {
    settings: SiteSettings;
    categories?: Category[];
    chatHref?: string | null;
    loggedIn?: boolean;
  } = $props();
  const path = $derived(page.url.pathname);
  const types = $derived(categories.filter((c) => (c.category_group ?? 'type') === 'type'));
  const styles = $derived(categories.filter((c) => c.category_group === 'style'));

  let open = $state(false);
  // Close the sheet whenever the page changes.
  $effect(() => {
    page.url.href;
    open = false;
  });
  $effect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => (document.documentElement.style.overflow = '');
  });
</script>

{#snippet tiles(list: Category[])}
  <ul class="tiles">
    {#each list as c (c.id)}
      <li>
        <a href={`/categories/${c.slug}`} class:on={path === `/categories/${c.slug}`}>
          <span class="frame" class:noimg={!c.photo}>
            {#if c.photo}
              <img src={imageUrl(c.photo, 300)} alt="" loading="lazy" decoding="async" width="150" height="188" />
            {:else}
              <span class="fname">{c.name.replace(/ Jewellery$/, '')}</span>
            {/if}
          </span>
          <strong>{c.name}</strong>
        </a>
      </li>
    {/each}
  </ul>
{/snippet}

<svelte:window onkeydown={(e) => e.key === 'Escape' && (open = false)} />

  {#if open}
    <button class="backdrop" type="button" aria-label="Close categories" onclick={() => (open = false)}></button>
    <div class="sheet" id="discover-sheet" role="dialog" aria-modal="true" aria-label="Discover designs">
      <div class="sheet-head">
        <span class="grip" aria-hidden="true"></span>
        <h2>Discover Designs</h2>
        <button class="x" type="button" onclick={() => (open = false)} aria-label="Close"><Icon name="close" size={18} /></button>
      </div>
      <div class="quick">
        <a href="/collections"><Icon name="designs" size={18} stroke={1.5} /> All Designs</a>
        <a href="/collections?show=new"><Icon name="sparkle" size={18} stroke={1.5} /> New Arrivals</a>
      </div>
      {#if types.length}
        <h3>Categories</h3>
        {@render tiles(types)}
      {/if}
      {#if styles.length}
        <h3>Styles</h3>
        {@render tiles(styles)}
      {/if}
    </div>
  {/if}

  <nav class="mbar" aria-label="Quick actions">
    <a class="it" href="/" class:on={path === '/' && !open}>
      <Icon name="home" size={20} stroke={1.5} /><span>Home</span>
    </a>
    <button
      class="it"
      type="button"
      class:on={open || path.startsWith('/collections') || path.startsWith('/categories')}
      aria-expanded={open}
      aria-controls="discover-sheet"
      onclick={() => (open = !open)}
    >
      <Icon name="designs" size={20} stroke={1.4} /><span>Discover</span>
    </button>
    <a class="it wa" href={chatHref ?? waLink(settings.whatsapp_number, settings.whatsapp_message)} target="_blank" rel="noopener noreferrer">
      <span class="wa-ic"><Icon name="whatsapp" size={24} /></span><span>WhatsApp</span>
    </a>
    <a class="it" href="/cart" class:on={path === '/cart'} aria-label={`Enquiry cart, ${cart.count} ${cart.count === 1 ? 'design' : 'designs'}`}>
      <span class="ic">
        <Icon name="bag" size={20} stroke={1.5} />
        {#if cart.count}<span class="badge">{cart.count > 9 ? '9+' : cart.count}</span>{/if}
      </span>
      <span>Cart</span>
    </a>
    {#if loggedIn}
      <a class="it" href="/account" class:on={path.startsWith('/account')}>
        <Icon name="user" size={20} stroke={1.5} /><span>Account</span>
      </a>
    {:else}
      <a class="it" href={`/login?next=${encodeURIComponent(path)}`} class:on={path === '/login' || path === '/register'}>
        <Icon name="user" size={20} stroke={1.5} /><span>Login</span>
      </a>
    {/if}
  </nav>

<style>
  .mbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 70;
    display: flex;
    justify-content: space-around;
    align-items: stretch;
    padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
    background: var(--burgundy-deep);
    border-top: 1px solid var(--ivory-20);
    box-shadow: 0 -10px 30px -16px rgba(0, 0, 0, 0.5);
  }
  .it {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
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
  .it.on {
    color: var(--white);
  }
  .it.on span:last-child {
    border-bottom: 1px solid var(--ivory);
  }
  .wa {
    color: var(--white);
  }
  .ic {
    position: relative;
    display: inline-flex;
  }
  .badge {
    position: absolute;
    top: -6px;
    right: -10px;
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
    box-shadow: 0 0 0 2px var(--burgundy-deep);
  }
  .wa-ic {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin-top: -22px;
    border-radius: 50%;
    background: var(--ivory);
    color: var(--burgundy);
    box-shadow: 0 0 0 3px var(--burgundy-deep);
  }

  /* Discover sheet */
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 68;
    border: 0;
    padding: 0;
    background: rgba(30, 4, 12, 0.55);
    animation: fade 0.2s ease;
  }
  .sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: calc(58px + env(safe-area-inset-bottom));
    z-index: 69;
    max-height: min(72vh, 560px);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0 16px 18px;
    background: var(--ivory);
    border-radius: 18px 18px 0 0;
    box-shadow: 0 -18px 40px -20px rgba(0, 0, 0, 0.6);
    animation: up 0.25s ease;
  }
  @keyframes up {
    from {
      transform: translateY(24px);
      opacity: 0;
    }
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
  }
  .sheet-head {
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px 0 10px;
    background: var(--ivory);
  }
  .grip {
    position: absolute;
    top: 7px;
    left: 50%;
    width: 38px;
    height: 4px;
    margin-left: -19px;
    border-radius: 4px;
    background: var(--burgundy-30);
  }
  .sheet h2 {
    margin: 0;
    font-size: 1.3rem;
    color: var(--burgundy);
  }
  .x {
    position: absolute;
    right: 0;
    top: 10px;
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--burgundy-15);
    border-radius: 50%;
    background: var(--white);
    color: var(--burgundy);
    cursor: pointer;
  }
  .quick {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 4px 0 6px;
  }
  .quick a {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    background: var(--burgundy);
    color: var(--white);
    font-size: 0.74rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none !important;
  }
  .sheet h3 {
    margin: 16px 0 8px;
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .tiles {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px 10px;
  }
  .tiles a {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
    text-decoration: none !important;
  }
  .frame {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    padding: 4px;
    background: var(--white);
    border: 1px solid var(--burgundy-15);
  }
  .frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .frame.noimg {
    background: var(--burgundy-deep);
    outline: 1px solid var(--ivory-20);
    outline-offset: -6px;
  }
  .fname {
    font-family: var(--font-display);
    font-size: 0.98rem;
    line-height: 1.15;
    color: var(--ivory);
    padding: 0 8px;
  }
  .tiles strong {
    font-family: var(--font-display);
    font-size: 0.86rem;
    font-weight: 600;
    line-height: 1.2;
    color: var(--charcoal);
  }
  .tiles a.on .frame {
    border: 2px solid var(--burgundy);
  }
  .tiles a.on strong {
    color: var(--burgundy);
  }
  @media (min-width: 760px) {
    .mbar,
    .sheet,
    .backdrop {
      display: none;
    }
  }
</style>
