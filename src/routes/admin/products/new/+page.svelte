<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/Seo.svelte';
  import ProductFields from '$lib/components/admin/ProductFields.svelte';
  let { data, form } = $props();
</script>

<Seo title="New product — Admin" noindex />

<p><a href="/admin/products">← All products</a></p>
<h1>Add product</h1>
<p class="muted">Fill the details and tap <b>Save</b>. On the next screen you can add photos.</p>
{#if form?.message}<div class="alert alert--error">{form.message}</div>{/if}

<form class="card" method="POST" novalidate use:enhance={() => async ({ update }) => update({ reset: false })}>
  <ProductFields categories={data.allCategories} values={(form?.values as Record<string, unknown>) ?? null} errors={form?.errors ?? {}} />
  <div class="savebar"><button class="btn" type="submit">Save &amp; add photos →</button></div>
</form>

<style>
  .savebar { display: flex; justify-content: flex-end; margin-top: 18px; }
  @media (max-width: 959px) {
    .savebar { position: sticky; bottom: calc(64px + env(safe-area-inset-bottom)); z-index: 5; margin: 18px -16px -16px; padding: 10px 16px; background: var(--white); border-top: 1px solid var(--burgundy-15); box-shadow: 0 -8px 20px -14px rgba(0,0,0,0.35); }
    .savebar .btn { flex: 1; }
  }
</style>
