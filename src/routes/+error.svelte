<script lang="ts">
  import { page } from '$app/state';
  import Seo from '$lib/components/Seo.svelte';
</script>

<Seo title={page.status === 404 ? 'Page not found' : 'Something went wrong'} noindex />

<section class="section">
  <div class="container err">
    <span class="eyebrow">Error {page.status}</span>
    <h1>{page.status === 404 ? 'This page could not be found' : 'Something went wrong'}</h1>
    <p class="muted">{page.status === 404 ? 'The page may have moved or the design may no longer be available.' : page.error?.message}</p>
    <div class="row">
      <a class="btn" href="/collections">Browse collections</a>
      <a class="btn btn--outline" href="/contact">Contact us</a>
    </div>
  </div>
</section>

<style>
  .err {
    text-align: center;
    max-width: 640px;
  }
  .row {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 24px;
  }
</style>
