<script lang="ts">
  import type { Snippet } from 'svelte';
  import Seo from './Seo.svelte';
  let { title, description, updated, children }: { title: string; description: string; updated: string; children: Snippet } = $props();
</script>

<Seo {title} {description} />

<section class="page-hero">
  <div class="container">
    <span class="eyebrow">Legal</span>
    <h1>{title}</h1>
    <p>Last updated: {updated}</p>
  </div>
</section>

<section class="section section--white">
  <div class="container legal">
    {@render children()}
  </div>
</section>

<style>
  .legal {
    max-width: 820px;
  }
  .legal :global(h2) {
    font-size: 1.55rem;
    margin: 34px 0 10px;
    color: var(--burgundy);
  }
  .legal :global(h2:first-child) {
    margin-top: 0;
  }
  .legal :global(p),
  .legal :global(li) {
    color: var(--charcoal-70);
  }
  .legal :global(ul) {
    padding-left: 20px;
    margin: 0 0 1em;
  }
  .legal :global(li) {
    margin-bottom: 6px;
  }
</style>
