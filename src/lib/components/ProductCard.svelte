<script lang="ts">
  import { page } from '$app/state';
  import JewelPlaceholder from './JewelPlaceholder.svelte';
  import Icon from './Icon.svelte';
  import { imageUrl, srcset } from '$lib/image';
  import { formatPrice } from '$lib/format';
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
  const img2 = $derived(product.images?.[1]);
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
      <a class="btn btn--sm login" href={`/login?next=${encodeURIComponent(page.url.pathname)}`}><Icon name="lock" size={13} /> Login to see price</a>
    {/if}
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
  .login {
    margin-top: auto;
    width: 100%;
    min-height: 38px;
    padding: 0 8px;
    gap: 6px;
    font-size: 0.62rem;
    letter-spacing: 0.12em;
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
    .login {
      min-height: 36px;
      font-size: 0.56rem;
      letter-spacing: 0.08em;
    }
      }
</style>
