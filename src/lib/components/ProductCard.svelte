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
    {#if product.is_bestseller || product.is_new_arrival}
      <span class="tag" class:tag--dark={product.is_bestseller}>{product.is_bestseller ? 'Bestseller' : 'New'}</span>
    {/if}
  </a>
  <div class="body">
    <h3><a href={`/products/${product.slug}`}>{product.name}</a></h3>
    {#if price}
      <p class="price">{formatPrice(price.price, price.currency)} <span>wholesale</span></p>
    {:else if loggedIn && status === 'approved'}
      <p class="note">Price on request</p>
    {:else if loggedIn}
      <p class="note"><Icon name="lock" size={11} /> Price after approval</p>
    {:else}
      <a class="note note--link" href={`/login?next=${encodeURIComponent(page.url.pathname)}`}><Icon name="lock" size={11} /> Login to view price</a>
    {/if}
    <div class="actions">
      <a class="btn btn--sm view" href={`/products/${product.slug}`}>View Details</a>
      <a class="wa" href={wa} target="_blank" rel="noopener noreferrer" aria-label={`Wholesale enquiry for ${product.name} on WhatsApp`} title="Enquire on WhatsApp">
        <Icon name="whatsapp" size={17} />
      </a>
    </div>
  </div>
</article>

<style>
  .pc {
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: var(--white);
    border: 1px solid var(--burgundy-15);
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
  .tag {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 3px 8px;
    font-size: 0.56rem;
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
    padding: 12px 10px 10px;
    flex: 1;
  }
  h3 {
    font-size: 1.05rem;
    font-weight: 600;
    line-height: 1.25;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
  }
  h3 a {
    color: var(--charcoal);
  }
  h3 a:hover {
    color: var(--burgundy);
    text-decoration: none;
  }
  .price {
    margin: 2px 0 0;
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--burgundy);
  }
  .price span {
    font-family: var(--font-body);
    font-size: 0.62rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .note {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin: 2px 0 0;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    color: var(--muted);
  }
  .note--link {
    color: var(--burgundy);
    font-weight: 500;
  }
  .actions {
    margin-top: auto;
    padding-top: 10px;
    width: 100%;
    display: flex;
    gap: 6px;
  }
  .view {
    flex: 1;
    min-width: 0;
    min-height: 36px;
    padding: 0 8px;
    font-size: 0.62rem;
    letter-spacing: 0.12em;
  }
  .wa {
    flex: none;
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--burgundy-30);
    color: var(--burgundy);
    background: var(--white);
    text-decoration: none !important;
    transition: background 0.2s, color 0.2s;
  }
  .wa:hover {
    background: var(--burgundy);
    color: var(--white);
  }
  @media (max-width: 480px) {
    .body {
      padding: 10px 7px 8px;
    }
    h3 {
      font-size: 0.92rem;
    }
    .note {
      font-size: 0.66rem;
    }
    .view {
      min-height: 34px;
      font-size: 0.58rem;
      letter-spacing: 0.08em;
    }
    .wa {
      width: 34px;
      height: 34px;
    }
  }
</style>
