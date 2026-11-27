<script lang="ts">
  import { page } from '$app/state';
  import { env } from '$env/dynamic/public';
  import Seo from '$lib/components/Seo.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import EnquiryForm from '$lib/components/EnquiryForm.svelte';
  import JewelleryArt from '$lib/components/home/JewelleryArt.svelte';
  import { imageUrl, srcset } from '$lib/image';
  import { STOCK_LABELS, formatPrice } from '$lib/format';
  import { waLink } from '$lib/whatsapp';

  let { data, form } = $props();
  const p = $derived(data.product);
  const s = $derived(data.settings);
  const images = $derived(p.images ?? []);
  const loggedIn = $derived(!!data.user);
  const status = $derived(data.profile?.status);

  let active = $state(0);
  let variantId = $state<string | null>(null);
  let color = $state<string | null>(null);
  let size = $state<string | null>(null);
  let qty = $state(1);
  let showForm = $state(false);
  let touchX = 0;

  $effect(() => {
    p.id;
    active = 0;
    variantId = null;
    color = p.colors?.[0] ?? null;
    size = p.sizes?.[0] ?? null;
    qty = Math.max(1, p.moq);
  });

  const go = (i: number) => (active = (i + images.length) % images.length);
  const variant = $derived(p.variants?.find((v) => v.id === variantId) ?? null);
  const price = $derived(
    (variantId && data.prices.find((x) => x.variant_id === variantId)) || data.prices.find((x) => x.variant_id === null) || null
  );
  const site = $derived((env.PUBLIC_SITE_URL || page.url.origin).replace(/\/$/, ''));
  const productUrl = $derived(`${site}/products/${p.slug}`);
  const sku = $derived(variant?.sku || p.sku);
  const stock = $derived(STOCK_LABELS[variant?.stock_status ?? p.stock_status]);

  // Selection summary sent with every enquiry.
  const selection = $derived(
    [variant && `Variation: ${variant.name}`, color && `Colour: ${color}`, size && `Size: ${size}`, `Quantity: ${qty}`].filter(Boolean).join('\n')
  );
  const chatLink = $derived(
    waLink(
      s.whatsapp_number,
      `Hello Mehfeez Jewels, I am interested in this design for wholesale:\nProduct: ${p.name}\nSKU: ${sku}\n${selection}\nLink: ${productUrl}\nPlease share wholesale price, MOQ and availability.`
    )
  );
  const videoLink = $derived(
    waLink(
      s.video_call_number,
      `Hello Mehfeez Jewels, I would like to schedule a video call to see this design:\n${p.name} (SKU ${sku})\n${productUrl}`
    )
  );

  /** Minimum order value for every wholesale order (set by the business). */
  const MIN_ORDER = '₹1,000';

  // Structured data deliberately contains NO price (prices are private to approved buyers).
  const ld = $derived({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: p.sku,
    description: p.meta_description || p.description.slice(0, 300),
    image: images.map((i) => i.url),
    brand: { '@type': 'Brand', name: 'Mehfeez Jewels' },
    category: p.category?.name,
    color: p.colors?.join(', ') || undefined
  });
</script>

<Seo
  title={p.meta_title || `${p.name} (${p.sku}) — Wholesale`}
  description={p.meta_description || p.description || `Wholesale ${p.name} from Mehfeez Jewels. MOQ ${p.moq}.`}
  image={images[0]?.url ?? null}
  type="product"
  jsonld={ld}
/>

<section class="pdp">
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span>/</span><a href="/collections">All Designs</a>
      {#if p.category}<span>/</span><a href={`/categories/${p.category.slug}`}>{p.category.name}</a>{/if}
    </nav>

    <div class="grid2">
      <!-- Gallery -->
      <div class="gallery">
        <div
          class="main"
          role="region"
          aria-label="Product images"
          ontouchstart={(e) => (touchX = e.touches[0].clientX)}
          ontouchend={(e) => {
            const dx = e.changedTouches[0].clientX - touchX;
            if (images.length > 1 && Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
          }}
        >
          {#if images.length}
            {#key active}
              <img
                src={imageUrl(images[active].url, 1200)}
                srcset={srcset(images[active].url, [480, 720, 1080, 1440])}
                sizes="(min-width: 1000px) 52vw, 100vw"
                alt={images[active].alt || p.name}
                width="900"
                height="1125"
                fetchpriority={active === 0 ? 'high' : 'auto'}
              />
            {/key}
            {#if images.length > 1}
              <button class="nav prev" type="button" onclick={() => go(active - 1)} aria-label="Previous image"><Icon name="arrow" size={18} /></button>
              <button class="nav next" type="button" onclick={() => go(active + 1)} aria-label="Next image"><Icon name="arrow" size={18} /></button>
              <span class="count">{active + 1} / {images.length}</span>
            {/if}
          {:else}
            <div class="art"><JewelleryArt /><span>Photos coming soon</span></div>
          {/if}
          <span class="tags">
            {#if p.is_new_arrival}<span class="tag">New</span>{/if}
            {#if p.is_bestseller}<span class="tag tag--dark">Bestseller</span>{/if}
          </span>
        </div>
        {#if images.length > 1}
          <div class="thumbs" role="tablist" aria-label="Choose image">
            {#each images as img, i (img.id)}
              <button type="button" role="tab" aria-selected={i === active} class:on={i === active} onclick={() => (active = i)} aria-label={`Image ${i + 1}`}>
                <img src={imageUrl(img.url, 200)} alt="" loading="lazy" width="80" height="100" />
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Info -->
      <div class="info">
        {#if p.category}<a class="cat" href={`/categories/${p.category.slug}`}>{p.category.name}</a>{/if}
        <h1>{p.name}</h1>
        <p class="meta">
          <span class:out={p.stock_status === 'out_of_stock'} class:ok={p.stock_status !== 'out_of_stock'}>{stock}</span>
          {#if p.material}<i></i><span>{p.material}</span>{/if}
          <i></i><span>Min. order {MIN_ORDER}</span>
          <i></i><span class="sku">SKU {sku}</span>
        </p>
        {#if p.video_url}
          <a class="video" href={p.video_url} target="_blank" rel="noopener noreferrer"><Icon name="video" size={15} /> Watch product video ↗</a>
        {/if}

        <!-- Price -->
        <div class="pricebox">
          {#if price}
            <span class="pl">Wholesale price</span>
            <span class="amount">{formatPrice(price.price, price.currency)}</span>
            {#if price.price_note}<span class="pnote">{price.price_note}</span>{/if}
          {:else if loggedIn && status === 'approved'}
            <span class="pl">Wholesale price</span>
            <span class="pmsg">Price on request — chat with us on WhatsApp.</span>
          {:else if loggedIn}
            <span class="pl"><Icon name="lock" size={13} /> Wholesale price</span>
            <span class="pmsg">Prices visible after account approval.</span>
          {:else}
            <span class="pl"><Icon name="lock" size={13} /> Wholesale price</span>
            <a class="btn btn--sm loginbtn" href={`/login?next=${encodeURIComponent(page.url.pathname)}`}><Icon name="lock" size={14} /> Login to see price</a>
          {/if}
        </div>

        <!-- Options -->
        {#if p.variants?.length}
          <div class="opt">
            <span class="ol">Variation <b>{variant?.name ?? 'Standard'}</b></span>
            <div class="chips">
              <button type="button" class:on={!variantId} onclick={() => (variantId = null)}>Standard</button>
              {#each p.variants as v (v.id)}
                <button type="button" class:on={variantId === v.id} onclick={() => (variantId = v.id)}>{v.name}</button>
              {/each}
            </div>
          </div>
        {/if}
        {#if p.colors?.length}
          <div class="opt">
            <span class="ol">Colour <b>{color}</b></span>
            <div class="chips">
              {#each p.colors as c}
                <button type="button" class:on={color === c} onclick={() => (color = c)}>{c}</button>
              {/each}
            </div>
          </div>
        {/if}
        {#if p.sizes?.length}
          <div class="opt">
            <span class="ol">Size <b>{size}</b></span>
            <div class="chips">
              {#each p.sizes as z}
                <button type="button" class:on={size === z} onclick={() => (size = z)}>{z}</button>
              {/each}
            </div>
          </div>
        {/if}
        <div class="opt">
          <span class="ol">Quantity <small>(minimum {p.moq})</small></span>
          <div class="qty">
            <button type="button" onclick={() => (qty = Math.max(p.moq, qty - 1))} aria-label="Decrease quantity" disabled={qty <= p.moq}>−</button>
            <input type="number" min={p.moq} bind:value={qty} onblur={() => (qty = Math.max(p.moq, Math.floor(Number(qty) || p.moq)))} aria-label="Quantity" />
            <button type="button" onclick={() => (qty = qty + 1)} aria-label="Increase quantity">+</button>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <a class="btn btn--block" href={chatLink} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={17} /> Chat on WhatsApp</a>
          {#if s.video_call_enabled}
            <a class="btn btn--outline btn--block" href={videoLink} target="_blank" rel="noopener noreferrer"><Icon name="video" size={17} /> Video Call</a>
          {/if}
        </div>
        <button type="button" class="textlink" onclick={() => (showForm = !showForm)} aria-expanded={showForm}>
          {showForm ? 'Hide written enquiry' : 'Or send a written enquiry'}
        </button>
        {#if showForm || form?.errors || form?.message || form?.success}
          <div class="formcard">
            <EnquiryForm
              categories={data.categories}
              {form}
              action="?/enquiry"
              productId={p.id}
              productLabel={`${p.name} (SKU ${sku})`}
              compact
              defaults={{
                full_name: data.profile?.full_name ?? '',
                business_name: data.profile?.company_name ?? '',
                email: data.profile?.email ?? '',
                whatsapp: data.profile?.whatsapp ?? '',
                country: data.profile?.country ?? '',
                estimated_quantity: String(qty),
                message: `I am interested in ${p.name} (SKU ${sku}).\n${selection}\nPlease share wholesale pricing and availability.`
              }}
            />
          </div>
        {/if}

        <ul class="trust">
          <li><Icon name="gem" size={17} stroke={1.3} /> Direct from manufacturer</li>
          <li><Icon name="boxes" size={17} stroke={1.3} /> Wholesale pricing</li>
          <li><Icon name="plane" size={17} stroke={1.3} /> India &amp; worldwide</li>
        </ul>

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
  <section class="related">
    <div class="container">
      <h2>You may also like</h2>
      <div class="grid grid--products">
        {#each data.related as r (r.id)}
          <ProductCard product={r} price={data.relatedPrices[r.id]} {loggedIn} {status} />
        {/each}
      </div>
    </div>
  </section>
{/if}

<!-- Phones: product actions always at hand -->
<div class="sticky">
  {#if s.video_call_enabled}
    <a class="btn btn--ghost-light" href={videoLink} target="_blank" rel="noopener noreferrer"><Icon name="video" size={16} /> Video Call</a>
  {/if}
  <a class="btn btn--light" href={chatLink} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={16} /> Chat on WhatsApp</a>
</div>

<style>
  .pdp {
    padding: 22px 0 clamp(48px, 7vw, 88px);
    background: var(--ivory);
  }
  .grid2 {
    display: grid;
    gap: 28px;
  }
  @media (min-width: 1000px) {
    .grid2 {
      grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
      gap: 56px;
      align-items: start;
    }
    .gallery {
      position: sticky;
      top: 110px;
    }
  }

  /* gallery */
  .main {
    position: relative;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    background: var(--white);
    outline: 1px solid var(--burgundy-15);
    outline-offset: 6px;
  }
  .main img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    animation: fade 0.35s ease;
  }
  @keyframes fade {
    from {
      opacity: 0.4;
    }
    to {
      opacity: 1;
    }
  }
  .art {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 12%;
    background: var(--burgundy);
    color: var(--ivory-70);
    font-size: 0.7rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
  }
  .nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.88);
    color: var(--burgundy);
    cursor: pointer;
  }
  .nav.prev {
    left: 10px;
  }
  .nav.prev :global(svg) {
    transform: rotate(180deg);
  }
  .nav.next {
    right: 10px;
  }
  .count {
    position: absolute;
    right: 12px;
    bottom: 12px;
    padding: 3px 10px;
    font-size: 0.72rem;
    background: rgba(69, 16, 32, 0.75);
    color: var(--white);
  }
  .tags {
    position: absolute;
    top: 12px;
    left: 12px;
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
  .thumbs {
    display: flex;
    gap: 10px;
    margin-top: 16px;
    overflow-x: auto;
    padding: 2px;
  }
  .thumbs button {
    flex: 0 0 68px;
    height: 85px;
    padding: 0;
    border: 1px solid var(--burgundy-15);
    background: var(--white);
    cursor: pointer;
    opacity: 0.7;
  }
  .thumbs button.on {
    opacity: 1;
    border: 2px solid var(--burgundy);
  }
  .thumbs img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* info */
  .cat {
    font-size: 0.7rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--burgundy-accent);
  }
  h1 {
    font-size: clamp(1.7rem, 3vw, 2.5rem);
    font-weight: 600;
    color: var(--charcoal);
    margin: 8px 0 8px;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
    font-size: 0.74rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 18px;
  }
  .meta i {
    width: 4px;
    height: 4px;
    background: var(--burgundy-30);
    transform: rotate(45deg);
  }
  .meta .out {
    color: var(--burgundy);
    font-weight: 600;
  }
  .pricebox {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px 18px;
    background: var(--white);
    border: 1px solid var(--burgundy-15);
    border-left: 3px solid var(--burgundy);
    margin-bottom: 22px;
  }
  .pl {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .amount {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 700;
    color: var(--burgundy);
    line-height: 1.1;
  }
  .pnote,
  .pmsg {
    font-size: 0.9rem;
    color: var(--charcoal);
  }
  .loginbtn {
    align-self: flex-start;
    margin-top: 6px;
  }
  .opt {
    margin-bottom: 18px;
  }
  .ol {
    display: block;
    margin-bottom: 8px;
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .ol b {
    color: var(--charcoal);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: none;
    font-size: 0.85rem;
    margin-left: 6px;
  }
  .ol small {
    text-transform: none;
    letter-spacing: 0;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chips button {
    min-height: 38px;
    padding: 0 16px;
    border: 1px solid var(--burgundy-30);
    background: var(--white);
    color: var(--charcoal);
    font: inherit;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  .chips button:hover {
    border-color: var(--burgundy);
  }
  .chips button.on {
    background: var(--burgundy);
    border-color: var(--burgundy);
    color: var(--white);
  }
  .qty {
    display: inline-flex;
    align-items: stretch;
    border: 1px solid var(--burgundy-30);
    background: var(--white);
  }
  .qty button {
    width: 42px;
    border: 0;
    background: none;
    font-size: 1.2rem;
    color: var(--burgundy);
    cursor: pointer;
  }
  .qty button:disabled {
    opacity: 0.3;
    cursor: default;
  }
  .qty input {
    width: 70px;
    min-height: 42px;
    border: 0;
    border-left: 1px solid var(--burgundy-15);
    border-right: 1px solid var(--burgundy-15);
    border-radius: 0;
    text-align: center;
    padding: 0;
    -moz-appearance: textfield;
    appearance: textfield;
  }
  .qty input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  .actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 10px;
    margin-top: 6px;
  }
  .actions .btn {
    min-height: 52px;
    letter-spacing: 0.12em;
  }
  .textlink {
    display: block;
    margin: 12px auto 0;
    padding: 4px;
    border: 0;
    background: none;
    color: var(--burgundy);
    font: inherit;
    font-size: 0.85rem;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
  .formcard {
    margin-top: 16px;
    padding: 20px;
    background: var(--white);
    border: 1px solid var(--burgundy-15);
  }
  .trust {
    list-style: none;
    padding: 14px 0;
    margin: 22px 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-top: 1px solid var(--burgundy-15);
    border-bottom: 1px solid var(--burgundy-15);
  }
  .trust li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--charcoal);
  }
  .trust li :global(svg) {
    color: var(--burgundy);
  }
  .desc h2 {
    font-size: 1.4rem;
    margin: 0 0 10px;
  }
  .meta .ok {
    color: #2f6b3a;
    font-weight: 600;
  }
  .meta .sku {
    color: var(--muted);
    opacity: 0.8;
  }
  .video {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: -8px 0 14px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .desc {
    margin-top: 26px;
  }
  .desc p {
    color: var(--muted);
    white-space: pre-line;
  }

  .related {
    padding: clamp(44px, 6vw, 80px) 0;
    background: var(--white);
  }
  .related h2 {
    text-align: center;
    margin-bottom: 28px;
  }

  /* phones: sticky action bar replaces the site bottom bar on product pages */
  .sticky {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 70;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
    gap: 8px;
    padding: 8px 10px calc(8px + env(safe-area-inset-bottom));
    background: var(--burgundy-deep);
    border-top: 1px solid var(--ivory-20);
  }
  .sticky .btn {
    min-height: 42px;
    padding: 0 8px;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
  }
  @media (min-width: 760px) {
    .sticky {
      display: none;
    }
  }
  @media (max-width: 759px) {
    .related {
      padding-bottom: 96px;
    }
  }
  /* phones: compact layout, one set of action buttons (the sticky bar) */
  @media (max-width: 759px) {
    .pdp { padding-top: 12px; }
    .breadcrumbs { margin-bottom: 10px; }
    .grid2 { gap: 18px; }
    .main { aspect-ratio: 1 / 1; outline-offset: 4px; }
    .thumbs { margin-top: 10px; gap: 8px; }
    .thumbs button { flex-basis: 52px; height: 52px; }
    h1 { font-size: 1.45rem; margin: 4px 0 6px; }
    .meta { font-size: 0.66rem; margin-bottom: 12px; }
    .pricebox { padding: 10px 12px; margin-bottom: 14px; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 4px 10px; }
    .pricebox .pl { flex-basis: 100%; font-size: 0.62rem; }
    .pmsg { font-size: 0.82rem; flex: 1 1 auto; }
    .amount { font-size: 1.6rem; }
    .loginbtn { min-height: 34px; padding: 0 14px; font-size: 0.64rem; margin-top: 2px; }
    .opt { margin-bottom: 12px; display: flex; align-items: center; flex-wrap: wrap; gap: 6px 12px; }
    .ol { margin-bottom: 0; font-size: 0.62rem; min-width: 74px; }
    .ol b { display: none; }
    .ol small { display: none; }
    .chips { gap: 6px; }
    .chips button { min-height: 32px; padding: 0 12px; font-size: 0.78rem; }
    .qty button { width: 34px; font-size: 1rem; }
    .qty input { width: 52px; min-height: 32px; font-size: 0.9rem; }
    .actions { display: none; }
    .textlink { margin: 4px 0 0; font-size: 0.8rem; }
    .trust { margin: 14px 0; padding: 10px 0; }
    .trust li { font-size: 0.58rem; gap: 4px; }
    .desc h2 { font-size: 1.15rem; margin-bottom: 4px; }
    .desc { margin-top: 16px; }
    .desc p { font-size: 0.88rem; }
  }
</style>
