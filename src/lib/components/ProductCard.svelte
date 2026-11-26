<script lang="ts">
  import { page } from '$app/state';
  import JewelPlaceholder from './JewelPlaceholder.svelte';
  import Icon from './Icon.svelte';
  import { imageUrl, srcset } from '$lib/image';
  import { formatPrice } from '$lib/format';
  import { productEnquiryMessage, waLink } from '$lib/whatsapp';
  import type { Price, Product, SiteSettings } from '$lib/types';

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
  const img2 = $derived(product.images?.[1]);
  const settings = $derived(page.data.settings as SiteSettings);
  const wa = $derived(
    waLink(settings?.whatsapp_number ?? '', productEnquiryMessage({ name: product.name, sku: product.sku }, `${page.url.origin}/products/${product.slug}`))
  );
</script>

<article class="pc">
  <a class="media" href={`/products/${product.slug}`} aria-label={product.name}>
    {#if img}
      <img
        class="main"
        src={imageUrl(img.url, 600)}
        srcset={srcset(img.url)}
        sizes="(min-width: 1100px) 25vw, (min-width: 760px) 33vw, 50vw"
        alt={img.alt || product.name}
        loading="lazy"
        decoding="async"
        width="480"
        height="600"
      />
      {#if img2}<img class="alt" src={imageUrl(img2.url, 600)} alt="" loading="lazy" decoding="async" width="480" height="600" />{/if}
    {:else}
      <JewelPlaceholder label={product.name} />
    {/if}
    <span class="tags">
      {#if product.is_new_arrival}<span class="tag">New</span>{/if}
      {#if product.is_bestseller}<span class="tag tag--dark">Bestseller</span>{/if}
    </span>
  </a>
  <div class="body">
    <h3><a href={`/products/${product.slug}`}>{product.name}</a></h3>
    <p class="meta"><span class="nw">SKU {product.sku}</span><span class="dot">·</span><span class="nw">MOQ {product.moq}</span></p>
    {#if price}
      <p class="price">{formatPrice(price.price, price.currency)} <span>wholesale</span></p>
    {:else if loggedIn && status === 'approved'}
      <p class="note">Price on request</p>
    {:else if loggedIn}
      <p class="note"><Icon name="lock" size={12} /> Price visible after approval</p>
    {:else}
      <a class="note note--link" href={`/login?next=${encodeURIComponent(page.url.pathname)}`}><Icon name="lock" size={12} /> Login to view price</a>
    {/if}
    <div class="actions">
      <a class="btn btn--sm" href={`/products/${product.slug}`}>View Details</a>
      <a class="btn btn--sm btn--outline" href={wa} target="_blank" rel="noopener noreferrer" aria-label={`Wholesale enquiry for ${product.name} on WhatsApp`}>
        <Icon name="whatsapp" size={14} /> Enquiry
      </a>
    </div>
  </div>
</article>

<style>
  .pc {
    display: flex;
    flex-direction: column;
    background: var(--white);
    border: 1px solid var(--burgundy-15);
    padding: 8px;
    transition: box-shadow 0.3s, transform 0.3s;
  }
  .pc:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-3px);
  }
  .media {
    position: relative;
    display: block;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    background: var(--cream);
  }
  .media img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.5s ease, transform 0.8s ease;
  }
  .media .alt {
    opacity: 0;
  }
  .pc:hover .media .alt {
    opacity: 1;
  }
  .pc:hover .media .main {
    transform: scale(1.04);
  }
  .tags {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    gap: 6px;
  }
  .tag {
    padding: 4px 10px;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    background: var(--burgundy);
    color: var(--white);
  }
  .tag--dark {
    background: var(--charcoal);
  }
  .body {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;
    padding: 14px 8px 8px;
    flex: 1;
  }
  h3 {
    font-size: 1.12rem;
    line-height: 1.25;
    margin: 0;
  }
  h3 a {
    color: var(--charcoal);
  }
  h3 a:hover {
    color: var(--burgundy);
    text-decoration: none;
  }
  .meta {
    margin: 0;
    font-size: 0.74rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .meta .dot {
    margin: 0 6px;
  }
  .meta .nw {
    white-space: nowrap;
  }
  .price {
    margin: 4px 0 0;
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--burgundy);
  }
  .price span {
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .note {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 4px 0 0;
    font-size: 0.74rem;
    letter-spacing: 0.06em;
    color: var(--muted);
  }
  .note--link {
    color: var(--burgundy);
    font-weight: 500;
  }
  .actions {
    margin-top: auto;
    padding-top: 12px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .actions .btn {
    min-height: 38px;
    padding: 0 6px;
    font-size: 0.66rem;
    letter-spacing: 0.1em;
  }
  @media (max-width: 480px) {
    .pc {
      padding: 5px;
    }
    h3 {
      font-size: 0.98rem;
    }
    .actions {
      grid-template-columns: 1fr;
    }
  }
</style>
