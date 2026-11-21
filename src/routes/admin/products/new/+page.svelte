<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/Seo.svelte';
  import ProductFields from '$lib/components/admin/ProductFields.svelte';
  let { data, form } = $props();
</script>

<Seo title="New product — Admin" noindex />

<p><a href="/admin/products">← All products</a></p>
<h1>Add product</h1>
<p class="muted">Save the product first, then add images and variations on the next screen.</p>
{#if form?.message}<div class="alert alert--error">{form.message}</div>{/if}

<form class="card" method="POST" novalidate use:enhance={() => async ({ update }) => update({ reset: false })}>
  <ProductFields categories={data.allCategories} values={(form?.values as Record<string, unknown>) ?? null} errors={form?.errors ?? {}} />
  <button class="btn" type="submit" style="margin-top: 22px">Save product</button>
</form>
