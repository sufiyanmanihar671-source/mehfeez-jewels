<script lang="ts">
  import PriceGate from './PriceGate.svelte';
  import JewelPlaceholder from './JewelPlaceholder.svelte';
  import { imageUrl, srcset } from '$lib/image';
  import { STOCK_LABELS } from '$lib/format';
  import type { Price, Product } from '$lib/types';

  let {
    product,
    price = null,
    loggedIn,
    status
  }: {
    product: Product;
    price?: Price | null;
    loggedIn: boolean;
    status: 'pending' | 'approved' | 'rejected' | null | undefined;
  } = $props();

  const img = $derived(product.images?.[0]);
</script>

<article class="pc">
  <a class="media" href={`/products/${product.slug}`} aria-label={product.name}>
    {#if img}
      <img
        src={imageUrl(img.url, 480)}
        srcset={srcset(img.url)}
        sizes="(min-width: 1100px) 25vw, (min-width: 760px) 33vw, 50vw"
        alt={img.alt || product.name}
        loading="lazy"
        decoding="async"
        width="480"
        height="600"
      />
    {:else}
      <JewelPlaceholder label={product.name} />
    {/if}
    <div class="tags">
      {#if product.is_new_arrival}<span class="badge badge--solid">New</span>{/if}
      {#if product.is_bestseller}<span class="badge badge--dark">Bestseller</span>{/if}
    </div>
  </a>
  <div class="body">
    {#if product.category}<a class="cat" href={`/categories/${product.category.slug}`}>{product.category.name}</a>{/if}
    <h3><a href={`/products/${product.slug}`}>{product.name}</a></h3>
    <div class="meta">
      <span>SKU {product.sku}</span>
      <span>MOQ {product.moq}</span>
    </div>
    <div class="stock">{STOCK_LABELS[product.stock_status]}</div>
    <PriceGate {price} {loggedIn} {status} compact />
  </div>
</article>

<style>
  .pc {
    background: var(--white);
    border: 1px solid var(--charcoal-08);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.25s, transform 0.25s;
  }
  .pc:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-3px);
  }
  .media {
    position: relative;
    display: block;
    aspect-ratio: 4 / 5;
    background: var(--ivory);
    overflow: hidden;
  }
  .media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }
  .pc:hover .media img {
    transform: scale(1.04);
  }
  .tags {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .body {
    padding: 14px 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }
  .cat {
    font-size: 0.68rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--burgundy);
  }
  h3 {
    font-size: 1.12rem;
    margin: 0;
  }
  h3 a {
    color: var(--charcoal);
  }
  .meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    font-size: 0.78rem;
    color: var(--charcoal-70);
  }
  .stock {
    font-size: 0.76rem;
    color: var(--charcoal-50);
    margin-bottom: 4px;
  }
  .body :global(.gate),
  .body :global(.price) {
    margin-top: auto;
  }
  @media (max-width: 480px) {
    .body {
      padding: 12px 10px 14px;
    }
    h3 {
      font-size: 1rem;
    }
  }
</style>
