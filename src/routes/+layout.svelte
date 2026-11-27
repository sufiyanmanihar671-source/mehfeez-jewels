<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import FloatingActions from '$lib/components/FloatingActions.svelte';
  import MobileBar from '$lib/components/MobileBar.svelte';

  let { data, children } = $props();
  const isAdmin = $derived(page.url.pathname.startsWith('/admin'));
</script>

<a class="skip" href="#main">Skip to content</a>

{#if !data.configured}
  <div class="setup-banner" role="status">
    Setup required: Supabase is not connected yet (PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY). Catalogue, login and forms are disabled until it is.
  </div>
{/if}

<Header settings={data.settings} categories={data.categories} profile={data.profile} loggedIn={!!data.user} />

<main id="main">
  {@render children()}
</main>

{#if !isAdmin}
  <Footer settings={data.settings} categories={data.categories} />
  <FloatingActions settings={data.settings} />
  <MobileBar settings={data.settings} />
{/if}

<style>
  .skip {
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 100;
    background: var(--burgundy);
    color: var(--white);
    padding: 10px 16px;
  }
  .skip:focus {
    left: 10px;
    top: 10px;
  }
  .setup-banner {
    background: var(--charcoal);
    color: var(--white);
    font-size: 0.85rem;
    padding: 8px var(--gutter);
    text-align: center;
  }
  main {
    min-height: 60vh;
  }
</style>
