<script lang="ts">
  import { page } from '$app/state';
  import { env } from '$env/dynamic/public';
  import Seo from '$lib/components/Seo.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import PriceGate from '$lib/components/PriceGate.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import EnquiryForm from '$lib/components/EnquiryForm.svelte';
  import JewelPlaceholder from '$lib/components/JewelPlaceholder.svelte';
  import { imageUrl, srcset } from '$lib/image';
  import { STOCK_LABELS } from '$lib/format';
  import { productEnquiryMessage, waLink } from '$lib/whatsapp';

  let { data, form } = $props();
  const p = $derived(data.product);
  const images = $derived(p.images ?? []);
  let active = $state(0);
  let variantId = $state<string | null>(null);
  let showForm = $state(false);

  $effect(() => {
    p.id;
    active = 0;
    variantId = null;
  });

  const variant = $derived(p.variants?.find((v) => v.id === variantId) ?? null);
  const price = $derived(
    (variantId && data.prices.find((x) => x.variant_id === variantId)) || data.prices.find((x) => x.variant_id === null) || null
  );
  const site = $derived((env.PUBLIC_SITE_URL || page.url.origin).replace(/\/$/, ''));
  const productUrl = $derived(`${site}/products/${p.slug}`);
  const waMessage = $derived(
    productEnquiryMessage({ name: variant ? `${p.name} — ${variant.name}` : p.name, sku: variant?.sku || p.sku }, productUrl)
  );

  // Structured data deliberately contains NO price (prices are private to approved buyers).
  const ld = $derived({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: p.sku,
    description: p.meta_description || p.description.slice(0, 300),
    image: images.map((i) => i.url),
    brand: { '@type': 'Brand', name: 'Mehfeez Jewels' },
    category: p.category?.name
  });
</script>

<Seo
  title={p.meta_title || `${p.name} (${p.sku}) — Wholesale`}
  description={p.meta_description || p.description || `Wholesale ${p.name} from Mehfeez Jewels. MOQ ${p.moq}.`}
  image={images[0]?.url ?? null}
  type="product"
  jsonld={ld}
/>

<section class="section top">
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span>/</span><a href="/collections">Collections</a>
      {#if p.category}<span>/</span><a href={`/categories/${p.category.slug}`}>{p.category.name}</a>{/if}
      <span>/</span><span>{p.name}</span>
    </nav>

    <div class="pd">
      <div class="gallery">
        <div class="main">
          {#if images.length}
            <img
              src={imageUrl(images[active].url, 1080)}
              srcset={srcset(images[active].url, [480, 720, 1080, 1440])}
              sizes="(min-width: 1000px) 50vw, 100vw"
              alt={images[active].alt || p.name}
              width="900"
              height="1125"
              fetchpriority="high"
            />
          {:else}
            <JewelPlaceholder label={p.name} />
          {/if}
        </div>
        {#if images.length > 1}
          <div class="thumbs" role="tablist" aria-label="Product images">
            {#each images as img, i (img.id)}
              <button
                type="button"
                role="tab"
                aria-selected={i === active}
                class:on={i === active}
                onclick={() => (active = i)}
                aria-label={`Show image ${i + 1}`}
              >
                <img src={imageUrl(img.url, 160)} alt="" loading="lazy" width="80" height="100" />
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="info">
        {#if p.category}<a class="eyebrow" href={`/categories/${p.category.slug}`}>{p.category.name}</a>{/if}
        <h1>{p.name}</h1>
        <div class="tags">
          {#if p.is_new_arrival}<span class="badge badge--solid">New arrival</span>{/if}
          {#if p.is_bestseller}<span class="badge badge--dark">Bestseller</span>{/if}
          <span class="badge badge--muted">{STOCK_LABELS[variant?.stock_status ?? p.stock_status]}</span>
        </div>

        <dl class="facts">
          <div><dt>SKU</dt><dd>{variant?.sku || p.sku}</dd></div>
          <div><dt>Minimum order (MOQ)</dt><dd>{p.moq} {p.moq === 1 ? 'piece/set' : 'pieces/sets'}</dd></div>
          <div>
            <dt>Availability</dt>
            <dd>
              {STOCK_LABELS[variant?.stock_status ?? p.stock_status]}{#if !variant && p.stock_quantity !== null && p.stock_status !== 'out_of_stock'}{` · ${p.stock_quantity} available`}{/if}
            </dd>
          </div>
        </dl>

        {#if p.variants?.length}
          <fieldset class="variants">
            <legend class="label">Variations</legend>
            <div class="chip-group">
              <label><input type="radio" name="variant" value="" checked={variantId === null} onchange={() => (variantId = null)} /> Standard</label>
              {#each p.variants as v (v.id)}
                <label><input type="radio" name="variant" value={v.id} checked={variantId === v.id} onchange={() => (variantId = v.id)} /> {v.name}</label>
              {/each}
            </div>
          </fieldset>
        {/if}

        <div class="price-box">
          <PriceGate {price} loggedIn={!!data.user} status={data.profile?.status} />
        </div>

        <div class="ctas">
          <a class="btn" href={waLink(data.settings.whatsapp_number, waMessage)} target="_blank" rel="noopener noreferrer"
            ><Icon name="whatsapp" size={18} /> Enquire on WhatsApp</a
          >
          <button class="btn btn--outline" type="button" onclick={() => (showForm = !showForm)} aria-expanded={showForm}>
            Product enquiry
          </button>
        </div>

        {#if showForm || form?.errors || form?.message || form?.success}
          <div class="card form-card">
            <EnquiryForm
              categories={data.categories}
              {form}
              action="?/enquiry"
              productId={p.id}
              productLabel={`${p.name} (SKU ${p.sku})`}
              compact
              defaults={{
                full_name: data.profile?.full_name ?? '',
                business_name: data.profile?.company_name ?? '',
                email: data.profile?.email ?? '',
                whatsapp: data.profile?.whatsapp ?? '',
                country: data.profile?.country ?? '',
                message: `I am interested in ${p.name} (SKU ${p.sku}). Please share wholesale pricing and availability.`
              }}
            />
          </div>
        {/if}

        {#if p.description}
          <div class="desc">
            <h2>Description</h2>
            {#each p.description.split(/\n{2,}/) as para}<p>{para}</p>{/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

{#if data.related.length}
  <section class="section section--white">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">You may also like</span>
        <h2>More from {p.category?.name}</h2>
      </div>
      <div class="grid grid--products">
        {#each data.related as r (r.id)}
          <ProductCard product={r} price={data.relatedPrices[r.id]} loggedIn={!!data.user} status={data.profile?.status} />
        {/each}
      </div>
    </div>
  </section>
{/if}

<style>
  .top {
    padding-top: 28px;
  }
  .pd {
    display: grid;
    gap: 32px;
  }
  @media (min-width: 1000px) {
    .pd {
      grid-template-columns: 1.05fr 0.95fr;
      gap: 56px;
      align-items: start;
    }
    .gallery {
      position: sticky;
      top: calc(var(--header-h) + 20px);
    }
  }
  .main {
    aspect-ratio: 4 / 5;
    background: var(--white);
    border: 1px solid var(--charcoal-08);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .main img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .thumbs {
    display: flex;
    gap: 10px;
    margin-top: 12px;
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .thumbs button {
    flex: 0 0 72px;
    height: 90px;
    border: 1px solid var(--charcoal-15);
    border-radius: var(--radius);
    padding: 0;
    overflow: hidden;
    cursor: pointer;
    background: var(--white);
  }
  .thumbs button.on {
    border: 2px solid var(--burgundy);
  }
  .thumbs img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .info h1 {
    font-size: clamp(2rem, 4vw, 3rem);
    margin-bottom: 12px;
  }
  .tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 22px;
  }
  .facts {
    display: grid;
    gap: 0;
    margin: 0 0 22px;
    border-top: 1px solid var(--charcoal-08);
  }
  .facts div {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--charcoal-08);
  }
  dt {
    color: var(--charcoal-70);
    font-size: 0.9rem;
  }
  dd {
    margin: 0;
    font-weight: 500;
    text-align: right;
  }
  .variants {
    border: 0;
    padding: 0;
    margin: 0 0 22px;
  }
  .variants legend {
    margin-bottom: 10px;
  }
  .price-box {
    padding: 20px;
    background: var(--white);
    border: 1px solid var(--charcoal-08);
    border-radius: var(--radius-lg);
    margin-bottom: 20px;
  }
  .ctas {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr;
  }
  @media (min-width: 520px) {
    .ctas {
      grid-template-columns: 1fr 1fr;
    }
  }
  .form-card {
    margin-top: 20px;
  }
  .desc {
    margin-top: 32px;
  }
  .desc h2 {
    font-size: 1.5rem;
  }
  .desc p {
    color: var(--charcoal-70);
    white-space: pre-line;
  }
</style>
