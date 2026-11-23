<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import HeroSlider from '$lib/components/home/HeroSlider.svelte';
  import SectionHead from '$lib/components/home/SectionHead.svelte';
  import JewelPlaceholder from '$lib/components/JewelPlaceholder.svelte';
  import { waLink } from '$lib/whatsapp';
  import { imageUrl } from '$lib/image';
  import type { Category } from '$lib/types';

  let { data } = $props();
  const s = $derived(data.settings);
  const loggedIn = $derived(!!data.user);
  const status = $derived(data.profile?.status);
  const wa = $derived(waLink(s.whatsapp_number, s.whatsapp_message));
  const videoCall = $derived(waLink(s.video_call_number, s.video_call_message));

  const bySlug = (slug: string) => data.categories.find((c) => c.slug === slug);
  const photo = (c: Category | undefined) => (c ? c.image_url || data.categoryPhoto[c.id] || null : null);

  // D. Explore Our Collections — the four signature styles (from the brief).
  const signature = $derived(
    ['american-diamond-jewellery', 'heritage-jewellery', 'victorian-jewellery', 'south-indian-jewellery']
      .map(bySlug)
      .filter((c): c is Category => !!c)
  );
  // F. Shop by Category (product types) and G. Shop by Jewellery Style.
  const types = $derived(data.categories.filter((c) => c.category_group === 'type' && c.slug !== 'latest-designs'));
  const styles = $derived(data.categories.filter((c) => c.category_group === 'style'));

  const usps = [
    { icon: 'factory', label: 'Direct Manufacturer' },
    { icon: 'tag', label: 'Competitive Wholesale Pricing' },
    { icon: 'diamond', label: 'Premium Quality' },
    { icon: 'globe', label: 'Worldwide Supply' }
  ] as const;

  const simple = [
    { icon: 'factory', title: 'Manufacturer-direct sourcing', text: 'Buy at source from our Mumbai manufacturing unit.' },
    { icon: 'box', title: 'Bulk order assistance', text: 'Help with quantities, assortments and repeat orders.' },
    { icon: 'check', title: 'Consistent quality', text: 'Finishing and fittings checked before dispatch.' },
    { icon: 'sparkle', title: 'New design availability', text: 'Fresh designs added to the catalogue regularly.' },
    { icon: 'globe', title: 'Domestic & international supply', text: 'Supplying buyers across India and overseas.' }
  ] as const;

  const why = [
    { icon: 'factory', title: 'Manufacturer Direct', text: 'No middlemen — designs come straight from our own production.' },
    { icon: 'tag', title: 'Competitive Wholesale Rates', text: 'Pricing built for retailers, wholesalers and resellers.' },
    { icon: 'grid', title: 'Wide Range of Designs', text: 'American Diamond, Victorian, Heritage, South Indian, bridal and more.' },
    { icon: 'diamond', title: 'Quality Craftsmanship', text: 'Careful stone setting, polishing and finishing on every piece.' },
    { icon: 'handshake', title: 'Reliable Business Support', text: 'Direct communication with our team on WhatsApp and video call.' },
    { icon: 'truck', title: 'Worldwide Shipping', text: 'Orders packed and shipped to buyers in India and abroad.' }
  ] as const;

  const orgLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mehfeez Jewels',
    description: 'Premium artificial jewellery manufacturer and wholesale supplier',
    telephone: s.contact_phone,
    address: { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: 'Mumbai', postalCode: '400064', addressRegion: 'Maharashtra', addressCountry: 'IN' }
  });
</script>

<Seo
  title="Mehfeez Jewels — Premium Artificial Jewellery Manufacturer & Wholesale Supplier"
  description="Premium artificial jewellery manufacturer and wholesale supplier in Mumbai. American Diamond, Heritage, Victorian, South Indian and bridal jewellery for retailers, wholesalers and resellers worldwide."
  jsonld={orgLd}
/>

<!-- B. Hero slider -->
<HeroSlider slides={data.slides} fallback={{ images: data.gallery.map((g) => g.url) }} />

<!-- C. Business trust strip -->
<section class="trust" aria-label="Why buy from us">
  <div class="container trust-row">
    {#each usps as u}
      <div class="ti"><Icon name={u.icon} size={20} /><span>{u.label}</span></div>
    {/each}
  </div>
</section>

<!-- D. Explore Our Collections (arched cards) -->
{#if signature.length}
  <section class="block">
    <div class="container">
      <SectionHead eyebrow="Signature styles" title="Explore Our" accent="Collections" />
      <div class="arches">
        {#each signature as c (c.id)}
          {@const src = photo(c)}
          <a class="arch" href={`/categories/${c.slug}`}>
            <span class="arch-frame">
              {#if src}
                <img src={imageUrl(src, 600)} alt={c.name} loading="lazy" decoding="async" width="400" height="560" />
              {:else}
                <JewelPlaceholder label={c.name} />
              {/if}
            </span>
            <span class="arch-label">
              <strong>{c.name}</strong>
              <small>Explore Collection →</small>
            </span>
          </a>
        {/each}
      </div>
    </div>
  </section>
{/if}

<!-- E. Our Featured Designs -->
<section class="block block--cream" id="featured">
  <div class="container">
    <SectionHead eyebrow="Handpicked for your store" title="Our Featured" accent="Designs" />
    {#if data.designs.length}
      <div class="grid grid--products">
        {#each data.designs as p (p.id)}
          <ProductCard product={p} price={data.prices[p.id]} {loggedIn} {status} />
        {/each}
      </div>
      <div class="center"><a class="btn btn--outline" href="/collections">View All Designs</a></div>
    {:else}
      <div class="empty">
        <p>Our latest designs are being added to the online catalogue.</p>
        <a class="btn" href="/wholesale-enquiry?type=catalogue">Request Wholesale Catalogue</a>
      </div>
    {/if}
  </div>
</section>

<!-- F. Shop by Category (horizontal scroller) -->
{#if types.length}
  <section class="block">
    <div class="container">
      <SectionHead eyebrow="Browse by category" title="Shop by" accent="Category" />
      <div class="scroller">
        {#each types as c (c.id)}
          {@const src = photo(c)}
          <a class="catcard" href={`/categories/${c.slug}`}>
            <span class="cc-img">
              {#if src}
                <img src={imageUrl(src, 500)} alt={c.name} loading="lazy" decoding="async" width="320" height="400" />
              {:else}
                <JewelPlaceholder label={c.name} />
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

<!-- G. Shop by Jewellery Style -->
{#if styles.length}
  <section class="block block--cream">
    <div class="container">
      <SectionHead eyebrow="Find your style" title="Shop by Jewellery" accent="Style" />
      <div class="styles">
        {#each styles as c (c.id)}
          {@const src = photo(c)}
          <a class="style" href={`/categories/${c.slug}`}>
            {#if src}
              <img src={imageUrl(src, 600)} alt="" loading="lazy" decoding="async" width="600" height="450" />
            {/if}
            <span class="style-label">
              <strong>{c.name.replace(/ Jewellery$/, '')}</strong>
              <small>View designs →</small>
            </span>
          </a>
        {/each}
      </div>
    </div>
  </section>
{/if}

<!-- H. Wholesale Jewellery Made Simple (one of the few burgundy sections) -->
<section class="simple">
  <div class="container simple-grid">
    <div>
      <SectionHead eyebrow="For retailers & wholesalers" title="Wholesale Jewellery Made" accent="Simple" light />
      <ul class="simple-list">
        {#each simple as it}
          <li><span class="si"><Icon name={it.icon} size={20} /></span><div><strong>{it.title}</strong><span>{it.text}</span></div></li>
        {/each}
      </ul>
    </div>
    <div class="simple-card">
      <h3>Start a wholesale enquiry</h3>
      <p>Tell us what you are looking for and we will share designs, MOQs and wholesale pricing on WhatsApp.</p>
      <a class="btn btn--light btn--block" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} /> Enquire on WhatsApp</a>
      <a class="btn btn--ghost-light btn--block" href="/wholesale-enquiry">Send a B2B Enquiry</a>
    </div>
  </div>
</section>

<!-- I. Why Choose Mehfeez -->
<section class="block" id="why-mehfeez">
  <div class="container">
    <SectionHead eyebrow="The Mehfeez promise" title="Why Choose" accent="Mehfeez Jewels?" />
    <div class="why">
      {#each why as w}
        <div class="why-item">
          <span class="wi"><Icon name={w.icon} size={24} /></span>
          <h3>{w.title}</h3>
          <p>{w.text}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- J. Jewellery showcase (real product photos only) -->
{#if data.gallery.length >= 4}
  <section class="block block--cream">
    <div class="container">
      <SectionHead eyebrow="Our latest work" title="Follow" accent="Mehfeez Jewels" />
      <div class="gallery">
        {#each data.gallery.slice(0, 8) as g}
          <a href={`/products/${g.slug}`} class="gi" aria-label={g.name}>
            <img src={imageUrl(g.url, 500)} alt={g.name} loading="lazy" decoding="async" width="400" height="400" />
          </a>
        {/each}
      </div>
      {#if s.instagram_url}
        <div class="center"><a class="btn" href={s.instagram_url} target="_blank" rel="noopener noreferrer"><Icon name="instagram" size={17} /> Follow on Instagram</a></div>
      {/if}
    </div>
  </section>
{/if}

<!-- K. Our Story -->
<section class="block story">
  <div class="container story-grid">
    <div class="story-media">
      {#if data.gallery[0]}
        <img src={imageUrl(data.gallery[0].url, 900)} alt="Mehfeez Jewels craftsmanship" loading="lazy" decoding="async" width="700" height="800" />
      {:else}
        <div class="story-brand" aria-hidden="true"><img src="/brand/mehfeez-white.png" alt="" width="1104" height="418" /></div>
      {/if}
    </div>
    <div class="story-copy">
      <SectionHead eyebrow="About us" title="Our" accent="Story" />
      <p>
        Mehfeez Jewels designs and manufactures artificial jewellery in Mumbai for the wholesale trade. From American
        Diamond to Victorian, Heritage and South Indian designs, our focus is careful craftsmanship and a wide variety of
        designs that sell well on retail counters.
      </p>
      <p>
        We work with jewellery retailers, wholesalers, boutique owners and resellers in India and internationally,
        building long-term relationships through consistent quality and direct, dependable communication.
      </p>
      <a class="btn btn--outline" href="/about">Read Our Story</a>
    </div>
  </div>
</section>

<!-- L. Wholesale CTA -->
<section class="cta">
  <div class="container cta-inner">
    <h2>Let's Build a Successful Business <em>Together</em></h2>
    <p>Partner with Mehfeez Jewels for premium artificial jewellery collections and reliable wholesale supply.</p>
    <div class="cta-btns">
      <a class="btn btn--light" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} /> Enquire on WhatsApp</a>
      <a class="btn btn--ghost-light" href="/wholesale-enquiry?type=catalogue">Request Catalogue</a>
      <a class="btn btn--ghost-light" href={videoCall} target="_blank" rel="noopener noreferrer"><Icon name="video" size={18} /> Book a Video Call</a>
    </div>
  </div>
</section>

<style>
  .block {
    padding: clamp(52px, 7vw, 96px) 0;
    background: var(--ivory);
  }
  .block--cream {
    background: var(--cream);
  }
  .center {
    display: flex;
    justify-content: center;
    margin-top: clamp(28px, 4vw, 44px);
  }
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  /* C. trust strip */
  .trust {
    background: var(--cream);
    border-bottom: 1px solid var(--burgundy-15);
  }
  .trust-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  .ti {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 8px;
    color: var(--charcoal);
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 600;
    text-align: center;
  }
  .ti :global(svg) {
    color: var(--burgundy);
    flex: 0 0 auto;
  }
  @media (min-width: 900px) {
    .trust-row {
      grid-template-columns: repeat(4, 1fr);
    }
    .ti + .ti {
      border-left: 1px solid var(--burgundy-15);
    }
  }

  .cta h2 em {
    color: var(--burgundy);
  }
  .cta-btns {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* D. arches */
  .arches {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(14px, 2.4vw, 30px);
  }
  @media (min-width: 900px) {
    .arches {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  .arch {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none !important;
  }
  .arch-frame {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: 5 / 7;
    border-radius: 999px 999px 4px 4px;
    overflow: hidden;
    border: 1px solid var(--burgundy-30);
    outline: 1px solid var(--burgundy-15);
    outline-offset: 5px;
    background: var(--cream);
  }
  .arch-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s ease;
  }
  .arch:hover .arch-frame img {
    transform: scale(1.05);
  }
  .arch-label {
    position: relative;
    margin-top: -36px;
    width: 84%;
    padding: 12px 8px;
    text-align: center;
    background: var(--white);
    border: 1px solid var(--burgundy-30);
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .arch-label strong {
    font-family: var(--font-display);
    font-size: clamp(1rem, 1.5vw, 1.25rem);
    font-weight: 600;
    color: var(--charcoal);
    line-height: 1.2;
  }
  .arch-label small,
  .catcard small,
  .style-label small {
    font-size: 0.66rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--burgundy);
  }

  /* F. category scroller */
  .scroller {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(170px, 44%);
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
    gap: 6px;
    text-align: center;
    text-decoration: none !important;
  }
  .cc-img {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    border: 1px solid var(--burgundy-15);
    padding: 6px;
    background: var(--white);
    margin-bottom: 8px;
  }
  .cc-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.7s ease;
  }
  .catcard:hover .cc-img img {
    transform: scale(1.05);
  }
  .catcard strong {
    font-family: var(--font-display);
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--charcoal);
  }

  /* G. styles */
  .styles {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(10px, 1.6vw, 18px);
  }
  @media (min-width: 900px) {
    .styles {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  .style {
    position: relative;
    display: flex;
    align-items: flex-end;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--burgundy);
    text-decoration: none !important;
  }
  .style img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s ease;
  }
  .style::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 45%, rgba(72, 8, 25, 0.82));
  }
  .style:hover img {
    transform: scale(1.06);
  }
  .style-label {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: clamp(12px, 2vw, 22px);
  }
  .style-label strong {
    font-family: var(--font-display);
    font-size: clamp(1.2rem, 2.2vw, 1.7rem);
    font-weight: 600;
    color: var(--white);
  }
  .style-label small {
    color: var(--ivory);
  }

  /* H. simple */
  .simple {
    background: var(--burgundy);
    color: var(--ivory);
    padding: clamp(52px, 7vw, 96px) 0;
  }
  .simple-grid {
    display: grid;
    gap: 36px;
    align-items: center;
  }
  @media (min-width: 1000px) {
    .simple-grid {
      grid-template-columns: 1.3fr 0.9fr;
      gap: 64px;
    }
    .simple-grid :global(.sh) {
      text-align: left;
      margin-left: 0;
    }
  }
  .simple-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 18px;
  }
  .simple-list li {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .simple-list div {
    display: flex;
    flex-direction: column;
  }
  .simple-list strong {
    color: var(--white);
    font-size: 1rem;
  }
  .simple-list span {
    color: var(--ivory-70);
    font-size: 0.92rem;
  }
  .si {
    flex: 0 0 42px;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--ivory-20);
    color: var(--white);
  }
  .simple-card {
    background: var(--burgundy-deep);
    border: 1px solid var(--ivory-20);
    padding: clamp(24px, 3vw, 36px);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .simple-card h3 {
    color: var(--white);
    font-size: 1.6rem;
    margin: 0;
  }
  .simple-card p {
    color: var(--ivory-70);
    margin: 0 0 6px;
  }

  /* I. why */
  .why {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1px;
    background: var(--burgundy-15);
    border: 1px solid var(--burgundy-15);
  }
  @media (min-width: 640px) {
    .why {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 1000px) {
    .why {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  .why-item {
    background: var(--white);
    padding: clamp(24px, 3vw, 38px);
    text-align: center;
  }
  .wi {
    display: inline-flex;
    width: 58px;
    height: 58px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: var(--burgundy);
    border: 1px solid var(--burgundy-30);
    outline: 1px solid var(--burgundy-15);
    outline-offset: 4px;
    margin-bottom: 16px;
  }
  .why-item h3 {
    font-size: 1.35rem;
    margin-bottom: 6px;
  }
  .why-item p {
    color: var(--muted);
    margin: 0;
    font-size: 0.94rem;
  }

  /* J. gallery */
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
    aspect-ratio: 1;
    overflow: hidden;
    background: var(--white);
  }
  .gi img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.7s ease, opacity 0.3s;
  }
  .gi:hover img {
    transform: scale(1.05);
    opacity: 0.92;
  }

  /* K. story */
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
    .story-copy :global(.sh) {
      text-align: left;
      margin-left: 0;
    }
  }
  .story-media {
    aspect-ratio: 7 / 8;
    overflow: hidden;
    border: 1px solid var(--burgundy-15);
    padding: 10px;
    background: var(--white);
  }
  .story-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .story-brand {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--burgundy);
  }
  .story-brand img {
    width: 62%;
    height: auto;
    object-fit: contain;
  }
  .story-copy p {
    color: var(--muted);
    font-size: 1.04rem;
  }

  /* L. CTA */
  .cta {
    background: var(--burgundy);
    padding: clamp(56px, 8vw, 104px) 0;
    text-align: center;
  }
  .cta h2 {
    color: var(--white);
    font-size: clamp(1.9rem, 3.6vw, 3rem);
    font-weight: 500;
    margin-bottom: 12px;
  }
  .cta h2 em {
    color: var(--ivory);
  }
  .cta p {
    color: var(--ivory-70);
    max-width: 56ch;
    margin: 0 auto 26px;
  }
</style>
