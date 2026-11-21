<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import EnquiryForm from '$lib/components/EnquiryForm.svelte';
  import { waLink } from '$lib/whatsapp';
  import { imageUrl } from '$lib/image';
  import type { Product } from '$lib/types';

  let { data, form } = $props();
  const s = $derived(data.settings);
  const loggedIn = $derived(!!data.user);
  const status = $derived(data.profile?.status);

  const reasons = [
    { icon: 'factory', title: 'Direct manufacturer', text: 'Designs are produced in-house in Mumbai, so you buy at source without middlemen.' },
    { icon: 'diamond', title: 'Consistent finishing', text: 'Every batch is checked for stone setting, plating finish and clasp strength before dispatch.' },
    { icon: 'box', title: 'Bulk-ready supply', text: 'Clear minimum order quantities and repeatable designs that suit retail shelves and resale.' },
    { icon: 'globe', title: 'India & international', text: 'We work with buyers across India and overseas, with communication over WhatsApp and email.' },
    { icon: 'handshake', title: 'Long-term partnerships', text: 'Dedicated support for retailers and distributors who reorder regularly.' },
    { icon: 'video', title: 'Live video walkthroughs', text: 'Request a scheduled video call to view designs before you place a bulk order.' }
  ] as const;

  const orgLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mehfeez Jewels',
    description: 'Artificial jewellery manufacturer and wholesaler',
    telephone: s.contact_phone,
    address: { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: 'Mumbai', postalCode: '400064', addressRegion: 'Maharashtra', addressCountry: 'IN' }
  });
</script>

<Seo
  title="Mehfeez Jewels — Artificial Jewellery Manufacturer & Wholesaler"
  description="Wholesale artificial jewellery direct from the manufacturer in Mumbai. American Diamond, Victorian, Heritage, South Indian and Bridal jewellery for retailers, distributors and resellers worldwide."
  jsonld={orgLd}
/>

{#snippet productRow(title: string, eyebrow: string, items: Product[], href: string)}
  <section class="section">
    <div class="container">
      <div class="row-head">
        <div>
          <span class="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <a class="btn btn--outline btn--sm" href={href}>View all <Icon name="arrow" size={16} /></a>
      </div>
      {#if items.length}
        <div class="grid grid--products">
          {#each items as p (p.id)}
            <ProductCard product={p} price={data.prices[p.id]} {loggedIn} {status} />
          {/each}
        </div>
      {:else}
        <div class="empty">New designs are being added to the catalogue. Please check back soon or <a href="/wholesale-enquiry">send an enquiry</a>.</div>
      {/if}
    </div>
  </section>
{/snippet}

<!-- HERO -->
<section class="hero">
  <div class="pattern" aria-hidden="true"></div>
  <div class="container hero-inner">
    <div class="hero-copy">
      <span class="eyebrow">Manufacturer · Wholesaler · Mumbai</span>
      <h1>{s.hero_title}</h1>
      <p>{s.hero_subtitle}</p>
      <div class="cta">
        <a class="btn btn--light" href="/collections">Explore collections</a>
        {#if !loggedIn}
          <a class="btn btn--ghost-light" href="/register">Register for wholesale prices</a>
        {:else}
          <a class="btn btn--ghost-light" href="/wholesale-enquiry">Wholesale enquiry</a>
        {/if}
      </div>
      <ul class="hero-points">
        <li><Icon name="check" size={16} /> B2B wholesale only</li>
        <li><Icon name="check" size={16} /> Prices for approved buyers</li>
        <li><Icon name="check" size={16} /> Enquiries on WhatsApp</li>
      </ul>
    </div>
    <div class="hero-art" aria-hidden={!s.hero_image_url}>
      {#if s.hero_image_url}
        <img src={imageUrl(s.hero_image_url, 900)} alt="Mehfeez Jewels collection" width="720" height="860" fetchpriority="high" />
      {:else}
        <svg viewBox="0 0 400 460" class="ornament">
          <g fill="none" stroke="currentColor" stroke-width="1.2">
            <circle cx="200" cy="200" r="170" opacity=".25" />
            <circle cx="200" cy="200" r="140" opacity=".18" />
            <path d="M60 120c40 150 240 150 280 0" />
            <path d="M80 150c40 110 200 110 240 0" opacity=".7" />
            <path d="M100 178c35 70 165 70 200 0" opacity=".5" />
            {#each Array(11) as _, i}
              {@const t = i / 10}
              {@const x = 60 + 280 * t}
              {@const y = 120 + 150 * 4 * t * (1 - t) * 0.75}
              <circle cx={x} cy={y} r={i % 2 ? 4 : 6} fill="currentColor" opacity=".8" />
            {/each}
            <path d="M200 262 236 300 200 360 164 300Z" />
            <path d="M164 300h72M184 300l16-38 16 38-16 60z" opacity=".8" />
            <path d="M200 360v40M190 410h20" opacity=".5" />
          </g>
        </svg>
      {/if}
    </div>
  </div>
</section>

<!-- INTRO -->
<section class="section section--white">
  <div class="container intro">
    <div>
      <span class="eyebrow">About the manufacturer</span>
      <h2>Crafted in Mumbai, supplied to businesses worldwide</h2>
      <div class="divider" style="margin-left:0"></div>
    </div>
    <div>
      <p>
        Mehfeez Jewels manufactures and supplies artificial jewellery for wholesale buyers. From American Diamond sets to
        Victorian, Heritage, South Indian and bridal designs, our collections are made for retailers, distributors,
        boutiques and resellers who need dependable quality in bulk.
      </p>
      <p>
        Browse the catalogue freely. Register your business to unlock wholesale prices once your account is approved, then
        discuss quantities and orders directly with our team on WhatsApp.
      </p>
      <a class="btn btn--outline" href="/about">Our story</a>
    </div>
  </div>
</section>

{@render productRow('Featured collections', 'Curated for retailers', data.featured, '/collections?show=featured')}

<!-- CATEGORIES -->
<section class="section section--white">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Shop by category</span>
      <h2>Jewellery categories</h2>
      <div class="divider"></div>
    </div>
    <div class="cats">
      {#each data.categories as c, i (c.id)}
        <a class="cat" href={`/categories/${c.slug}`}>
          {#if c.image_url}
            <img src={imageUrl(c.image_url, 480)} alt={c.name} loading="lazy" decoding="async" width="400" height="400" />
          {:else}
            <span class="num">{String(i + 1).padStart(2, '0')}</span>
          {/if}
          <span class="cat-name">{c.name}</span>
          <span class="cat-link">View designs <Icon name="arrow" size={14} /></span>
        </a>
      {/each}
    </div>
  </div>
</section>

{@render productRow('New arrivals', 'Just added', data.arrivals, '/collections?show=new')}
{@render productRow('Bestselling designs', 'Most reordered', data.bestsellers, '/collections?show=bestsellers')}

<!-- WHY US -->
<section class="section section--burgundy">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Why choose us</span>
      <h2>Why choose Mehfeez Jewels</h2>
    </div>
    <div class="reasons">
      {#each reasons as r}
        <div class="reason">
          <span class="ri"><Icon name={r.icon} size={26} /></span>
          <h3>{r.title}</h3>
          <p>{r.text}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ENQUIRY -->
<section class="section" id="enquiry">
  <div class="container enquiry">
    <div class="enquiry-copy">
      <span class="eyebrow">Wholesale business enquiry</span>
      <h2>Planning a bulk order?</h2>
      <p class="muted">Share your requirements and our team will respond with catalogues, pricing and MOQ details.</p>
      <div class="quick">
        <a class="btn" href={waLink(s.whatsapp_number, s.whatsapp_message)} target="_blank" rel="noopener noreferrer"
          ><Icon name="whatsapp" size={18} /> Chat on WhatsApp</a
        >
        {#if s.video_call_enabled}
          <a class="btn btn--outline" href={waLink(s.video_call_number, s.video_call_message)} target="_blank" rel="noopener noreferrer"
            ><Icon name="video" size={18} /> Request a video call</a
          >
        {/if}
      </div>
      <p class="small muted">The video call button sends a WhatsApp message asking to arrange a call at a convenient time.</p>
    </div>
    <div class="card">
      <EnquiryForm categories={data.categories} {form} action="?/enquiry" />
    </div>
  </div>
</section>

<!-- CONTACT -->
<section class="section section--white">
  <div class="container contact">
    <div class="ci"><Icon name="pin" size={26} /><h3>Visit us</h3><p>{s.address}</p></div>
    <div class="ci">
      <Icon name="whatsapp" size={26} /><h3>WhatsApp / Call</h3>
      <p><a href={waLink(s.whatsapp_number, s.whatsapp_message)} target="_blank" rel="noopener noreferrer">{s.contact_phone}</a></p>
    </div>
    <div class="ci">
      <Icon name="mail" size={26} /><h3>Email</h3>
      <p>{#if s.contact_email}<a href={`mailto:${s.contact_email}`}>{s.contact_email}</a>{:else}<a href="/contact">Send us a message</a>{/if}</p>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    background: radial-gradient(120% 90% at 85% 10%, rgba(255, 255, 255, 0.08) 0%, transparent 55%), var(--burgundy);
    color: var(--ivory);
    overflow: hidden;
  }
  .pattern {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(var(--ivory-20) 1px, transparent 1px);
    background-size: 26px 26px;
    mask-image: linear-gradient(90deg, transparent, #000 60%);
    opacity: 0.5;
  }
  .hero-inner {
    position: relative;
    display: grid;
    gap: 40px;
    align-items: center;
    padding-top: clamp(56px, 9vw, 120px);
    padding-bottom: clamp(56px, 9vw, 120px);
  }
  @media (min-width: 960px) {
    .hero-inner {
      grid-template-columns: 1.15fr 0.85fr;
    }
  }
  .hero h1 {
    color: var(--white);
    font-size: clamp(2.5rem, 6vw, 4.6rem);
    font-weight: 600;
    margin-bottom: 20px;
  }
  .hero .eyebrow {
    color: var(--ivory-70);
  }
  .hero-copy p {
    font-size: 1.1rem;
    max-width: 560px;
    color: var(--ivory-70);
    font-weight: 300;
  }
  .cta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 30px 0 28px;
  }
  .hero-points {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px 26px;
    font-size: 0.88rem;
    color: var(--ivory);
  }
  .hero-points li {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hero-art {
    display: flex;
    justify-content: center;
  }
  .hero-art img {
    border-radius: 200px 200px 12px 12px;
    max-height: 560px;
    object-fit: cover;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--ivory-20);
  }
  .ornament {
    width: min(420px, 80vw);
    color: var(--ivory);
  }
  .intro {
    display: grid;
    gap: 28px;
  }
  @media (min-width: 900px) {
    .intro {
      grid-template-columns: 0.9fr 1.1fr;
      gap: 80px;
    }
  }
  .intro p {
    color: var(--charcoal-70);
    font-size: 1.05rem;
  }
  .row-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 32px;
  }
  .row-head h2 {
    margin: 0;
  }
  .cats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  @media (min-width: 760px) {
    .cats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  .cat {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 6px;
    min-height: 170px;
    padding: 20px;
    border: 1px solid var(--charcoal-08);
    border-radius: var(--radius-lg);
    background: var(--ivory);
    color: var(--charcoal);
    overflow: hidden;
    text-decoration: none !important;
    transition: background 0.25s, color 0.25s;
  }
  .cat img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.22;
  }
  .num {
    position: absolute;
    top: 14px;
    right: 18px;
    font-family: var(--font-display);
    font-size: 2.6rem;
    color: var(--burgundy-15);
    font-weight: 700;
  }
  .cat-name {
    position: relative;
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 600;
    line-height: 1.2;
  }
  .cat-link {
    position: relative;
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--burgundy);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .cat:hover {
    background: var(--burgundy);
    color: var(--white);
  }
  .cat:hover .cat-link,
  .cat:hover .num {
    color: var(--ivory-70);
  }
  .reasons {
    display: grid;
    gap: 1px;
    background: var(--ivory-20);
    border: 1px solid var(--ivory-20);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  @media (min-width: 700px) {
    .reasons {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 1024px) {
    .reasons {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  .reason {
    background: var(--burgundy);
    padding: 32px 28px;
  }
  .reason p {
    color: var(--ivory-70);
    margin: 0;
  }
  .ri {
    display: inline-flex;
    width: 54px;
    height: 54px;
    border-radius: 50%;
    border: 1px solid var(--ivory-20);
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    color: var(--white);
  }
  .enquiry {
    display: grid;
    gap: 36px;
  }
  @media (min-width: 960px) {
    .enquiry {
      grid-template-columns: 0.8fr 1.2fr;
      gap: 60px;
      align-items: start;
    }
    .enquiry-copy {
      position: sticky;
      top: calc(var(--header-h) + 24px);
    }
  }
  .quick {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 22px 0 12px;
  }
  .small {
    font-size: 0.85rem;
  }
  .contact {
    display: grid;
    gap: 20px;
  }
  @media (min-width: 800px) {
    .contact {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  .ci {
    text-align: center;
    padding: 28px 20px;
    border: 1px solid var(--charcoal-08);
    border-radius: var(--radius-lg);
    color: var(--burgundy);
  }
  .ci h3 {
    margin: 12px 0 8px;
  }
  .ci p {
    color: var(--charcoal-70);
    margin: 0;
  }
</style>
