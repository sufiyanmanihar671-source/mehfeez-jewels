<script lang="ts">
  import { page } from '$app/state';
  import Icon from './Icon.svelte';
  import { waLink } from '$lib/whatsapp';
  import type { SiteSettings } from '$lib/types';

  /** App-style bottom bar on phones with the key B2B actions. */
  let { settings }: { settings: SiteSettings } = $props();
  const path = $derived(page.url.pathname);
</script>

<nav class="mbar" aria-label="Quick actions">
  <a href="/" class:on={path === '/'}>
    <Icon name="gem" size={20} stroke={1.4} /><span>Home</span>
  </a>
  <a href="/collections" class:on={path.startsWith('/collections') || path.startsWith('/categories') || path.startsWith('/products')}>
    <Icon name="designs" size={20} stroke={1.4} /><span>Designs</span>
  </a>
  <a href="/wholesale-enquiry" class:on={path.startsWith('/wholesale-enquiry')}>
    <Icon name="mail" size={20} stroke={1.4} /><span>Enquiry</span>
  </a>
  {#if settings.video_call_enabled}
    <a href={waLink(settings.video_call_number, settings.video_call_message)} target="_blank" rel="noopener noreferrer">
      <Icon name="video" size={20} stroke={1.4} /><span>Video</span>
    </a>
  {/if}
  <a class="wa" href={waLink(settings.whatsapp_number, settings.whatsapp_message)} target="_blank" rel="noopener noreferrer">
    <span class="wa-ic"><Icon name="whatsapp" size={22} /></span><span>WhatsApp</span>
  </a>
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
  a {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
    padding: 4px 2px;
    color: var(--ivory-70);
    font-size: 0.6rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    text-decoration: none !important;
  }
  a.on {
    color: var(--white);
  }
  a.on span:last-child {
    border-bottom: 1px solid var(--ivory);
  }
  .wa {
    color: var(--white);
  }
  .wa-ic {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    margin-top: -18px;
    border-radius: 50%;
    background: var(--ivory);
    color: var(--burgundy);
    box-shadow: 0 0 0 3px var(--burgundy-deep);
  }
  @media (min-width: 760px) {
    .mbar {
      display: none;
    }
  }
</style>
