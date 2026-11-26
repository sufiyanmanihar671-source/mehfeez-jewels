<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import HeroSlider from '$lib/components/home/HeroSlider.svelte';
  import SectionHead from '$lib/components/home/SectionHead.svelte';
  import { waLink } from '$lib/whatsapp';
  import { imageUrl } from '$lib/image';
  import type { Category } from '$lib/types';

  let { data } = $props();
  const s = $derived(data.settings);
  const loggedIn = $derived(!!data.user);
  const status = $derived(data.profile?.status);
  const wa = $derived(waLink(s.whatsapp_number, s.whatsapp_message));

  let tab = $state(0);
  const current = $derived(data.tabs[Math.min(tab, data.tabs.length - 1)]);

  const bySlug = (slug: string) => data.categories.find((c) => c.slug === slug);
  const photo = (c: Category | undefined) => (c ? c.image_url || data.categoryPhoto[c.id] || null : null);

  // 8. Shop by Category — order from the brief; only categories that exist.
  const shopCategories = $derived(
    [
      'earrings',
      'necklace-sets',
      'choker-sets',
      'bridal-jewellery',
      'american-diamond-jewellery',
      'victorian-jewellery',
      'south-indian-jewellery',
      'bangles'
    ]
      .map(bySlug)
      .filter((c): c is Category => !!c)
  );

  // 9. Shop by Collection.
  const collections = $derived([
    { label: 'Latest Arrivals', href: '/collections?show=new', img: data.collectionPhoto.new },
    { label: 'Trending Designs', href: '/collections?show=trending', img: data.collectionPhoto.trending },
    { label: 'Premium Collection', href: '/collections?show=premium', img: data.collectionPhoto.premium },
    { label: 'Bridal Collection', href: '/categories/bridal-jewellery', img: photo(bySlug('bridal-jewellery')) },
    { label: 'Traditional Collection', href: '/collections?show=traditional', img: data.collectionPhoto.traditional },
    { label: 'Exclusive Designs', href: '/collections?show=exclusive', img: data.collectionPhoto.exclusive }
  ]);

  // 5. Trust highlights.
  const trust = [
    { icon: 'gem', label: 'Direct Manufacturer' },
    { icon: 'sparkle', label: 'Exclusive Designs' },
    { icon: 'boxes', label: 'Wholesale Supply' },
    { icon: 'plane', label: 'Worldwide Shipping' },
    { icon: 'headset', label: 'Personalised Enquiries' }
  ] as const;

  // 10. Why Mehfeez.
  const why = [
    { icon: 'gem', title: 'Direct Manufacturer & Wholesale Supplier' },
    { icon: 'sparkle', title: 'Exclusive Jewellery Designs' },
    { icon: 'designs', title: 'Wide Variety of Collections' },
    { icon: 'boxes', title: 'Wholesale Business Support' },
    { icon: 'plane', title: 'International Shipping' },
    { icon: 'headset', title: 'Personalised Customer Assistance' }
  ] as const;

  const orgLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mehfeez Jewels',
    url: 'https://mehfeezjewels.com',
    description: 'Artificial jewellery manufacturer and wholesale supplier',
    telephone: s.contact_phone,
    address: { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: 'Mumbai', postalCode: '400064', addressRegion: 'Maharashtra', addressCountry: 'IN' }
  });
</script>

<Seo
  title="Mehfeez Jewels — Premium Artificial Jewellery, Direct from Manufacturers"
  description="Wholesale artificial jewellery direct from the manufacturer in Mumbai — earrings, necklace sets, chokers, bangles, bridal, American Diamond, Victorian and South Indian designs for retailers and boutiques worldwide."
  jsonld={orgLd}
/>

<!-- 4. Hero (dark, like the reference) -->
<HeroSlider slides={data.slides} fallback={{ images: data.gallery.map((g) => g.url) }} />

<!-- 5. Trust highlights (ivory strip) -->
<section class="trust" aria-label="Highlights">
  <div class="container trust-row">
    {#each trust as t}
      <div class="ti"><span class="ti-ic"><Icon name={t.icon} size={21} stroke={1.3} /></span><span class="ti-l">{t.label}</span></div>
    {/each}
  </div>
</section>

<!-- 7. Featured products with tabs (dark section) -->
<section class="dark" id="featured">
  <div class="container">
    <SectionHead eyebrow="Handpicked for you" title="Featured" accent="Products" light />
    {#if data.tabs.length}
      {#if data.tabs.length > 1}
        <div class="tabs" role="tablist" aria-label="Product groups">
          {#each data.tabs as t, i (t.key)}
            <button type="button" role="tab" aria-selected={current.key === t.key} class:on={current.key === t.key} onclick={() => (tab = i)}>{t.label}</button>
          {/each}
        </div>
      {/if}
      <div class="grid grid--products" role="tabpanel">
        {#each current.products as p (p.id)}
          <ProductCard product={p} price={data.prices[p.id]} {loggedIn} {status} />
        {/each}
      </div>
      <div class="center"><a class="btn btn--light" href={current.href}>View all {current.label}</a></div>
    {:else}
      <div class="empty-dark">
        <p>New designs are being added to the catalogue.</p>
        <a class="btn btn--light" href="/wholesale-enquiry?type=catalogue">Request Wholesale Catalogue</a>
      </div>
    {/if}
  </div>
</section>

<!-- 8. Shop by Category (ivory, horizontal cards) -->
{#if shopCategories.length}
  <section class="light">
    <div class="container">
      <SectionHead eyebrow="Browse by category" title="Shop by" accent="Category" />
      <div class="scroller">
        {#each shopCategories as c (c.id)}
          {@const src = photo(c)}
          <a class="catcard" href={`/categories/${c.slug}`}>
            <span class="cc-frame" class:noimg={!src}>
              {#if src}
                <img src={imageUrl(src, 520)} alt={c.name} loading="lazy" decoding="async" width="320" height="420" />
              {:else}
                <span class="cc-name">{c.name.replace(/ Jewellery$/, '')}</span>
              {/if}
            </span>
            <strong>{c.name}</strong>
            <small>Explore →</small>
          </a>
        {/each}
      </div>
    </div>
  </section>
{/if}

<!-- 9. Shop by Collection (dark tiles) -->
<section class="dark">
  <div class="container">
    <SectionHead eyebrow="Curated edits" title="Shop by" accent="Collection" light />
    <div class="coll">
      {#each collections as c}
        <a class="tile" class:noimg={!c.img} href={c.href}>
          {#if c.img}<img src={imageUrl(c.img, 700)} alt="" loading="lazy" decoding="async" width="600" height="450" />{/if}
          <span class="tile-label">
            <strong>{c.label}</strong>
            <small>Explore →</small>
          </span>
        </a>
      {/each}
    </div>
  </div>
</section>

<!-- 10. Why Mehfeez (ivory) -->
<section class="light" id="why-mehfeez">
  <div class="container">
    <SectionHead eyebrow="The Mehfeez promise" title="Why Choose" accent="Mehfeez Jewels?" />
    <div class="why">
      {#each why as w}
        <div class="why-item">
          <span class="wi"><Icon name={w.icon} size={26} stroke={1.25} /></span>
          <h3>{w.title}</h3>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- 11. Instagram-style gallery (real photos only) -->
{#if data.gallery.length >= 4 || s.instagram_url}
  <section class="white">
    <div class="container">
      <SectionHead eyebrow="New collection previews" title="Follow" accent="Mehfeez Jewels" />
      {#if data.gallery.length >= 4}
        <div class="gallery">
          {#each data.gallery.slice(0, 8) as g}
            <a href={`/products/${g.slug}`} class="gi" aria-label={g.name}>
              <img src={imageUrl(g.url, 500)} alt={g.name} loading="lazy" decoding="async" width="400" height="500" />
            </a>
          {/each}
        </div>
      {/if}
      {#if s.instagram_url}
        <div class="center"><a class="btn" href={s.instagram_url} target="_blank" rel="noopener noreferrer"><Icon name="instagram" size={16} /> Follow on Instagram</a></div>
      {/if}
    </div>
  </section>
{/if}

<!-- 12. Brand story (dark) -->
<section class="dark story">
  <div class="container story-grid" class:solo={!data.gallery[0]}>
    {#if data.gallery[0]}
      <div class="story-media">
        <img src={imageUrl(data.gallery[0].url, 900)} alt="Mehfeez Jewels design" loading="lazy" decoding="async" width="700" height="820" />
      </div>
    {/if}
    <div class="story-copy">
      <span class="eb-light"><span></span>Our story<span></span></span>
      <h2>Crafting Jewellery. <em>Building Partnerships.</em></h2>
      <p>
        Mehfeez Jewels brings together distinctive artificial jewellery designs and wholesale expertise. We work with retailers,
        boutiques and jewellery businesses to help them discover collections suited to their customers.
      </p>
      <div class="btn-row">
        <a class="btn btn--light" href="/about">About Us</a>
        <a class="btn btn--ghost-light" href="/wholesale-enquiry">Wholesale Enquiry</a>
      </div>
    </div>
  </div>
</section>

<style>
  .light,
  .dark,
  .white {
    padding: clamp(52px, 7vw, 92px) 0;
  }
  .light {
    background: var(--ivory);
  }
  .white {
    background: var(--white);
  }
  .dark {
    background: var(--burgundy-deep);
    color: var(--ivory);
  }
  .center {
    display: flex;
    justify-content: center;
    margin-top: clamp(28px, 4vw, 44px);
  }
  .btn-row {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .eb-light {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-size: 0.68rem;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--ivory-70);
  }
  .eb-light span {
    width: 32px;
    height: 1px;
    background: var(--ivory-20);
  }
  .empty-dark {
    text-align: center;
    color: var(--ivory-70);
  }

  /* trust strip */
  .trust {
    background: var(--ivory);
    border-bottom: 1px solid var(--burgundy-15);
  }
  .trust-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
  }
  .ti {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px 2px;
    text-align: center;
  }
  .ti + .ti {
    border-left: 1px solid var(--burgundy-15);
  }
  .ti-ic {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    color: var(--burgundy);
    background: var(--white);
    border: 1px solid var(--burgundy-30);
  }
  .ti-l {
    font-size: 0.62rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--charcoal);
    line-height: 1.3;
  }
  @media (min-width: 900px) {
    .ti {
      flex-direction: row;
      gap: 12px;
      padding: 18px 6px;
    }
    .ti-l {
      font-size: 0.72rem;
      text-align: left;
    }
  }
  @media (max-width: 420px) {
    .ti-ic {
      width: 36px;
      height: 36px;
    }
    .ti-l {
      font-size: 0.52rem;
      letter-spacing: 0.04em;
    }
  }

  h2 em {
    font-style: italic;
    color: var(--ivory);
  }

  /* tabs */
  .tabs {
    display: flex;
    justify-content: center;
    gap: 6px 26px;
    flex-wrap: wrap;
    margin: -10px 0 28px;
  }
  .tabs button {
    padding: 8px 0;
    background: none;
    border: 0;
    border-bottom: 1px solid transparent;
    color: var(--ivory-70);
    font: inherit;
    font-size: 0.72rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .tabs button.on {
    color: var(--white);
    border-bottom-color: var(--ivory);
  }

  /* category scroller */
  .scroller {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(160px, 44%);
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 10px;
    scrollbar-width: thin;
  }
  @media (min-width: 760px) {
    .scroller {
      grid-auto-columns: calc((100% - 64px) / 5);
    }
  }
  .catcard {
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
    text-decoration: none !important;
  }
  .cc-frame {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    padding: 6px;
    background: var(--white);
    border: 1px solid var(--burgundy-15);
    margin-bottom: 10px;
  }
  .cc-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.7s ease;
  }
  .catcard:hover .cc-frame img {
    transform: scale(1.05);
  }
  .cc-frame.noimg {
    background: var(--burgundy-deep);
    outline: 1px solid var(--ivory-20);
    outline-offset: -10px;
  }
  .cc-name {
    font-family: var(--font-display);
    font-size: clamp(1.3rem, 2vw, 1.7rem);
    color: var(--ivory);
    padding: 0 12px;
    line-height: 1.15;
  }
  .catcard strong {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--charcoal);
  }
  .catcard small,
  .tile small {
    font-size: 0.64rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--burgundy);
  }

  /* collection tiles */
  .coll {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(10px, 1.6vw, 18px);
  }
  @media (min-width: 900px) {
    .coll {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  .tile {
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    text-decoration: none !important;
    outline: 1px solid var(--ivory-20);
    outline-offset: -8px;
  }
  .tile img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s ease;
  }
  .tile:hover img {
    transform: scale(1.06);
  }
  .tile::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(69, 16, 32, 0.85));
  }
  .tile.noimg {
    align-items: center;
    background: var(--burgundy);
  }
  .tile.noimg::after {
    display: none;
  }
  .tile-label {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 18px 12px;
    text-align: center;
  }
  .tile-label strong {
    font-family: var(--font-display);
    font-size: clamp(1.15rem, 2.2vw, 1.7rem);
    font-weight: 500;
    color: var(--white);
    line-height: 1.15;
  }
  .tile small {
    color: var(--ivory-70);
  }

  /* why */
  .why {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
    background: var(--burgundy-15);
    border: 1px solid var(--burgundy-15);
  }
  @media (min-width: 1000px) {
    .why {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  .why-item {
    background: var(--white);
    padding: clamp(22px, 3vw, 40px) 12px;
    text-align: center;
  }
  .wi {
    display: inline-flex;
    width: 62px;
    height: 62px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--burgundy);
    border: 1px solid var(--burgundy-30);
    outline: 1px solid var(--burgundy-15);
    outline-offset: 4px;
    margin-bottom: 14px;
  }
  .why-item h3 {
    font-size: clamp(1rem, 1.7vw, 1.3rem);
    margin: 0;
  }

  /* gallery */
  .gallery {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  @media (min-width: 760px) {
    .gallery {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  .gi {
    display: block;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    background: var(--ivory);
  }
  .gi img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.7s ease;
  }
  .gi:hover img {
    transform: scale(1.05);
  }

  /* story */
  .story-grid {
    display: grid;
    gap: 32px;
    align-items: center;
  }
  @media (min-width: 1000px) {
    .story-grid {
      grid-template-columns: 1fr 1.1fr;
      gap: 72px;
    }
    .story-grid.solo {
      grid-template-columns: 1fr;
    }
  }
  .story-media {
    aspect-ratio: 7 / 8;
    overflow: hidden;
    outline: 1px solid var(--ivory-20);
    outline-offset: 8px;
  }
  .story-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .story-copy {
    text-align: center;
  }
  @media (min-width: 1000px) {
    .story-grid:not(.solo) .story-copy {
      text-align: left;
    }
    .story-grid:not(.solo) .btn-row {
      justify-content: flex-start;
    }
  }
  .story-copy h2 {
    color: var(--white);
    font-size: clamp(1.9rem, 3.4vw, 2.9rem);
    font-weight: 500;
    margin: 14px 0 14px;
  }
  .story-copy p {
    color: var(--ivory-70);
    max-width: 60ch;
    margin: 0 auto 24px;
    font-size: 1.02rem;
  }
</style>
