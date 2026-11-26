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

<!-- New Arrivals: always shown above Shop by Category -->
<section class="dark" id="new-arrivals">
  <div class="container">
    <SectionHead eyebrow="Just added" title="New" accent="Arrivals" light />
    {#if data.arrivals.length}
      <div class="six six--products">
        {#each data.arrivals as p (p.id)}
          <ProductCard product={p} price={data.prices[p.id]} {loggedIn} {status} />
        {/each}
      </div>
      <div class="center"><a class="btn btn--light" href={data.arrivalsAreNew ? '/collections?show=new' : '/collections'}>View All New Arrivals</a></div>
    {:else}
      <p class="soon">Ask us for this week's new designs on WhatsApp.</p>
      <div class="btn-row">
        <a class="btn btn--light" href={waLink(s.whatsapp_number, 'Hello Mehfeez Jewels, please share your latest new arrival designs for wholesale.')} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={16} /> Get New Arrivals</a>
      </div>
    {/if}
  </div>
</section>

<!-- Shop by Category: 6 boxes (2 per row on phones, 3 on desktop) + View All -->
{#if shopCategories.length}
  <section class="light">
    <div class="container">
      <SectionHead eyebrow="Browse by category" title="Shop by" accent="Category" />
      <div class="six">
        {#each shopCategories.slice(0, 6) as c (c.id)}
          {@const src = photo(c)}
          <a class="catcard" href={`/categories/${c.slug}`}>
            <span class="cc-frame" class:noimg={!src}>
              {#if src}
                <img src={imageUrl(src, 520)} alt={c.name} loading="lazy" decoding="async" width="320" height="400" />
              {:else}
                <span class="cc-name">{c.name.replace(/ Jewellery$/, '')}</span>
              {/if}
            </span>
            <strong>{c.name}</strong>
          </a>
        {/each}
      </div>
      <div class="center"><a class="btn" href="/categories">View All Categories</a></div>
    </div>
  </section>
{/if}

<!-- 10. Why Mehfeez (ivory) -->
<section class="white" id="why-mehfeez">
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
  <section class="light">
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
  .soon {
    text-align: center;
    color: var(--ivory-70);
    margin: -6px 0 18px;
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

  /* 6-box grids: 2 per row on phones, 3 per row from tablets up */
  .six {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(12px, 2vw, 24px);
  }
  @media (min-width: 760px) {
    .six {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media (min-width: 1100px) {
    .six:not(.six--products) {
      max-width: 1020px;
      margin: 0 auto;
    }
  }
  .catcard {
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
