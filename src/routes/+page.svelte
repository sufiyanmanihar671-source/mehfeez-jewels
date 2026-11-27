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
  const newDesignsWa = $derived(waLink(s.whatsapp_number, 'Hello Mehfeez Jewels, please share your latest designs for wholesale.'));


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
    { icon: 'gem', title: 'Manufacturer Direct', text: 'Made in our Mumbai unit — no middlemen.' },
    { icon: 'sparkle', title: 'Exclusive Designs', text: 'Our own designs, added regularly.' },
    { icon: 'designs', title: 'Wide Variety', text: 'AD, Victorian, South Indian & bridal.' },
    { icon: 'boxes', title: 'Wholesale Support', text: 'Help with MOQs, assortments & reorders.' },
    { icon: 'plane', title: 'Worldwide Shipping', text: 'Supplying buyers in India & abroad.' },
    { icon: 'headset', title: 'Personal Assistance', text: 'Talk to us on WhatsApp or video call.' }
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

<!-- Latest Designs: always shown above Shop by Category -->
<section class="dark" id="latest-designs">
  <div class="container">
    <SectionHead eyebrow="Wholesale catalogue" title="Latest" accent="Designs" light />
    <div class="six six--products">
      {#each data.arrivals as p (p.id)}
        <ProductCard product={p} price={data.prices[p.id]} {loggedIn} {status} />
      {/each}
      <!-- Empty slots until 6 designs are online: clearly labelled, links to WhatsApp (no fake products). -->
      {#each Array(Math.max(0, 6 - data.arrivals.length)) as _, i}
        <a class="soon-card" href={newDesignsWa} target="_blank" rel="noopener noreferrer" aria-label="Ask for the latest designs on WhatsApp">
          <span class="soon-media"><Icon name="gem" size={34} stroke={1.1} /></span>
          <span class="soon-body">
            <strong>New Design</strong>
            <small>Coming soon</small>
            <span class="soon-cta"><Icon name="whatsapp" size={13} /> Ask on WhatsApp</span>
          </span>
        </a>
      {/each}
    </div>
    <div class="center"><a class="btn btn--light" href="/collections">View All Designs</a></div>
  </div>
</section>

<!-- Shop by Category: 6 boxes (2 per row on phones, 3 on desktop) + View All -->
{#if shopCategories.length}
  <section class="light">
    <div class="container">
      <SectionHead eyebrow="Our wholesale range" title="Explore by" accent="Category" />
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
    <SectionHead eyebrow="The Mehfeez promise" title="Why" accent="Mehfeez?" />
    <div class="why">
      {#each why as w}
        <div class="why-item">
          <span class="wi"><Icon name={w.icon} size={22} stroke={1.3} /></span>
          <h3>{w.title}</h3>
          <p>{w.text}</p>
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
      <img class="story-mark" src="/brand/mehfeez-jewels-white.png" alt="" aria-hidden="true" width="1184" height="536" loading="lazy" />
      <span class="eb-light"><span></span>Our story<span></span></span>
      <h2>Crafting Jewellery. <em>Building Partnerships.</em></h2>
      <p>Distinctive artificial jewellery designs with wholesale expertise — for retailers, boutiques and jewellery businesses.</p>
      <ul class="facts">
        <li><Icon name="pin" size={18} stroke={1.3} /><span>Mumbai, India</span></li>
        <li><Icon name="boxes" size={18} stroke={1.3} /><span>Wholesale only</span></li>
        <li><Icon name="world" size={18} stroke={1.3} /><span>India &amp; worldwide</span></li>
      </ul>
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
  .soon-card {
    display: flex;
    flex-direction: column;
    background: var(--white);
    border: 1px solid var(--burgundy-15);
    padding: 8px;
    text-decoration: none !important;
    transition: box-shadow 0.3s, transform 0.3s;
  }
  .soon-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
  }
  .soon-media {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 4 / 5;
    background: var(--ivory);
    color: var(--burgundy-30);
    outline: 1px solid var(--burgundy-15);
    outline-offset: -10px;
  }
  .soon-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 14px 6px 8px;
    text-align: center;
  }
  .soon-body strong {
    font-family: var(--font-display);
    font-size: 1.12rem;
    font-weight: 600;
    color: var(--charcoal);
  }
  .soon-body small {
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .soon-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--burgundy);
  }
  .center {
    display: flex;
    justify-content: center;
    margin-top: clamp(28px, 4vw, 44px);
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

  /* why — compact: 2 per row on phones, 3 on tablets, 6 in one row on desktop */
  .why {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    max-width: 1100px;
    margin: 0 auto;
  }
  @media (min-width: 640px) {
    .why {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media (min-width: 1100px) {
    .why {
      grid-template-columns: repeat(6, 1fr);
      gap: 0;
    }
    .why-item + .why-item {
      border-left: 1px solid var(--burgundy-15);
    }
    .why-item {
      background: transparent !important;
      border-top: 0 !important;
      border-bottom: 0 !important;
      border-right: 0 !important;
    }
    .why-item:first-child {
      border-left: 0 !important;
    }
  }
  .why-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px 10px;
    text-align: center;
    background: var(--ivory);
    border: 1px solid var(--burgundy-15);
  }
  .wi {
    display: inline-flex;
    width: 50px;
    height: 50px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--white);
    background: var(--burgundy);
    box-shadow: 0 0 0 4px var(--white), 0 0 0 5px var(--burgundy-30);
  }
  .why-item p {
    margin: -4px 0 0;
    font-size: 0.82rem;
    line-height: 1.45;
    color: var(--muted);
    max-width: 22ch;
  }
  .why-item h3 {
    margin: 0;
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    line-height: 1.35;
    color: var(--charcoal);
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
    position: relative;
    text-align: center;
    padding: clamp(28px, 5vw, 56px) clamp(16px, 4vw, 48px);
    outline: 1px solid var(--ivory-20);
    outline-offset: -1px;
    overflow: hidden;
    max-width: 860px;
    margin: 0 auto;
  }
  .story-copy::before {
    content: '';
    position: absolute;
    inset: 8px;
    border: 1px solid var(--ivory-20);
    pointer-events: none;
  }
  .story-mark {
    position: absolute;
    right: -8%;
    bottom: -14%;
    width: min(70%, 460px);
    height: auto;
    opacity: 0.06;
    pointer-events: none;
  }
  .story-copy > :not(.story-mark) {
    position: relative;
  }
  .story-copy h2 {
    color: var(--white);
    font-size: clamp(1.9rem, 3.4vw, 2.9rem);
    font-weight: 500;
    margin: 14px 0 12px;
  }
  .story-copy p {
    color: var(--ivory-70);
    max-width: 46ch;
    margin: 0 auto 22px;
    font-size: 1rem;
  }
  .facts {
    list-style: none;
    padding: 0;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    max-width: 520px;
    border-top: 1px solid var(--ivory-20);
    border-bottom: 1px solid var(--ivory-20);
  }
  .facts li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 4px;
    color: var(--white);
    font-size: 0.66rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .facts li + li {
    border-left: 1px solid var(--ivory-20);
  }
  @media (min-width: 1000px) {
    .story-grid:not(.solo) .story-copy {
      text-align: left;
    }
  }
</style>
