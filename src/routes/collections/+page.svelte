<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import ProductListing from '$lib/components/ProductListing.svelte';
  let { data } = $props();
  const titles: Record<string, string> = {
    featured: 'Featured Wholesale Products',
    new: 'New Arrivals',
    bestsellers: 'Bestselling Collections',
    trending: 'Trending Designs',
    premium: 'Premium Collection',
    exclusive: 'Exclusive Designs',
    traditional: 'Traditional Collection'
  };
  const title = $derived(titles[data.show] ?? 'All Designs');
</script>

<Seo
  title={`${title} — Wholesale Artificial Jewellery`}
  description="Browse the Mehfeez Jewels wholesale catalogue: American Diamond, Victorian, Heritage, South Indian, Bridal jewellery, necklace sets, earrings and bangles."
  noindex={!!data.q || data.page > 1}
/>

<section class="page-hero page-hero--compact">
  <div class="container">
    <h1>{title}</h1>
  </div>
</section>

<section class="section">
  <div class="container">
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
      minimal
      loggedIn={!!data.user}
      status={data.profile?.status}
    />
  </div>
</section>
