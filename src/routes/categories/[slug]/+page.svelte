<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import ProductListing from '$lib/components/ProductListing.svelte';
  let { data } = $props();
</script>

<Seo
  title={`${data.category.name} — Wholesale`}
  description={data.category.description ?? `Wholesale ${data.category.name} from Mehfeez Jewels, artificial jewellery manufacturer in Mumbai.`}
  noindex={!!data.q || data.page > 1}
/>

<section class="page-hero">
  <div class="container">
    <span class="eyebrow">Jewellery category</span>
    <h1>{data.category.name}</h1>
    {#if data.category.description}<p>{data.category.description}</p>{/if}
  </div>
</section>

<section class="section">
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span>/</span><a href="/categories">Categories</a><span>/</span><span>{data.category.name}</span>
    </nav>
    <ProductListing
      products={data.products}
      prices={data.prices}
      total={data.total}
      pageNo={data.page}
      pages={data.pages}
      q={data.q}
      show={data.show}
      sort={data.sort}
      categories={data.categories}
      activeCategory={data.category.slug}
      loggedIn={!!data.user}
      status={data.profile?.status}
    />
  </div>
</section>
