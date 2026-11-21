<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { waLink } from '$lib/whatsapp';
  import { imageUrl } from '$lib/image';

  let { data } = $props();
  const s = $derived(data.settings);
  const loggedIn = $derived(!!data.user);
  const status = $derived(data.profile?.status);

  // Factual, verifiable statements only (no invented numbers or awards).
  const features = [
    { icon: 'factory', label: 'Direct from\nmanufacturer' },
    { icon: 'diamond', label: 'New designs\nadded regularly' },
    { icon: 'globe', label: 'India &\ninternational buyers' },
    { icon: 'box', label: 'Bulk orders\nMOQ per design' }
  ] as const;

  const trust = [
    { icon: 'check', title: 'Wholesale only', text: 'B2B supply' },
    { icon: 'lock', title: 'Approved buyers', text: 'See wholesale prices' },
    { icon: 'whatsapp', title: 'Order on WhatsApp', text: 'Direct with our team' },
    { icon: 'video', title: 'Video call', text: 'View designs live' }
  ] as const;

  const reasons = [
    { icon: 'factory', title: 'Manufacturer pricing', text: 'Buy at source from our Mumbai unit.' },
    { icon: 'diamond', title: 'Consistent finishing', text: 'Every batch checked before dispatch.' },
    { icon: 'handshake', title: 'Repeatable designs', text: 'Reorder your best sellers with ease.' },
    { icon: 'globe', title: 'Worldwide buyers', text: 'Support for India and overseas.' }
  ] as const;

  const orgLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mehfeez Jewels',
    description: 'Artificial jewellery manufacturer and wholesaler',
    telephone: s.contact_phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.address,
      addressLocality: 'Mumbai',
      postalCode: '400064',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN'
    }
  });
</script>

<Seo
  title="Mehfeez Jewels — Artificial Jewellery Manufacturer & Wholesaler"
  description="Wholesale artificial jewellery direct from the manufacturer in Mumbai. American Diamond, Victorian, Heritage, South Indian and Bridal jewellery for retailers, distributors and resellers worldwide."
  jsonld={orgLd}
/>

<!-- ================= HERO (fits one screen) ================= -->
<section class="hero">
  <div class="hero-grid">
    <!-- Lifestyle image with the brand's curved ivory sweep -->
    <div class="visual">
      <div class="sweep" aria-hidden="true"></div>
      {#if s.hero_image_url}
        <img class="model" src={imageUrl(s.hero_image_url, 1000)} alt="Mehfeez Jewels jewellery" width="760" height="900" fetchpriority="high" />
      {:else}
        <svg class="ornament" viewBox="0 0 400 460" aria-hidden="true">
          <g fill="none" stroke="currentColor" stroke-width="1.3">
            <path d="M60 120c40 150 240 150 280 0" />
            <path d="M82 150c40 110 196 110 236 0" opacity=".7" />
            <path d="M104 178c35 70 157 70 192 0" opacity=".5" />
            {#each Array(11) as _, i}
              {@const t = i / 10}
              <circle cx={60 + 280 * t} cy={120 + 112.5 * 4 * t * (1 - t)} r={i % 2 ? 4 : 6.5} fill="currentColor" opacity=".85" />
            {/each}
            <path d="M200 262 236 300 200 360 164 300Z" />
            <path d="M164 300h72M184 300l16-38 16 38-16 60z" opacity=".8" />
          </g>
        </svg>
      {/if}

      <!-- Product showcase tiles -->
      <div class="tiles">
        {#each [0, 1, 2] as i}
          {@const item = data.showcase[i]}
          {#if item}
            <a class="tile" href={`/products/${item.slug}`} aria-label={item.name}>
              <img src={imageUrl(item.url, 360)} alt={item.name} width="180" height="180" loading={i === 0 ? 'eager' : 'lazy'} />
            </a>
          {:else}
            <div class="tile tile--empty" aria-hidden="true"><Icon name="diamond" size={30} /></div>
          {/if}
        {/each}
      </div>
    </div>

    <!-- Message -->
    <div class="copy">
      <span class="kicker"><span class="line"></span>Mehfeez Jewels<span class="line"></span></span>
      <h1 class:long={s.hero_title.length > 24}>{s.hero_title}</h1>
      <p class="sub">Wholesale Manufacturer &amp; Supplier</p>
      <ul class="features">
        {#each features as f}
          <li>
            <span class="fi"><Icon name={f.icon} size={26} /></span>
            <span class="fl">{f.label}</span>
          </li>
        {/each}
      </ul>
      {#if loggedIn}
        <a class="cta" href="/collections">Browse collections <Icon name="arrow" size={20} /></a>
      {:else}
        <a class="cta" href="/register"><Icon name="user" size={22} /> Open a wholesale account <Icon name="arrow" size={20} /></a>
      {/if}
      <p class="only"><span></span>Wholesale only<span></span></p>
    </div>
  </div>

  <!-- Trust strip -->
  <div class="trust">
    {#each trust as t}
      <div class="ti">
        <Icon name={t.icon} size={24} />
        <div><strong>{t.title}</strong><span>{t.text}</span></div>
      </div>
    {/each}
  </div>
</section>

<!-- ================= SHOP BY CATEGORY ================= -->
<section class="block block--white">
  <div class="container">
    <div class="head">
      <div>
        <span class="eyebrow">Explore</span>
        <h2>Shop by category</h2>
      </div>
      <a class="more" href="/categories">All categories <Icon name="arrow" size={16} /></a>
    </div>
    <div class="cats">
      {#each data.categories as c (c.id)}
        <a class="cat" href={`/categories/${c.slug}`}>
          <span class="ring">
            {#if c.image_url}
              <img src={imageUrl(c.image_url, 240)} alt={c.name} width="120" height="120" loading="lazy" decoding="async" />
            {:else}
              <span class="mono" aria-hidden="true"><Icon name="diamond" size={30} /></span>
            {/if}
          </span>
          <span class="cn">{c.name}</span>
        </a>
      {/each}
    </div>
  </div>
</section>

<!-- ================= NEW ARRIVALS ================= -->
<section class="block">
  <div class="container">
    <div class="head">
      <div>
        <span class="eyebrow">Just added</span>
        <h2>New arrivals</h2>
      </div>
      <a class="more" href="/collections?show=new">View all <Icon name="arrow" size={16} /></a>
    </div>
    {#if data.arrivals.length}
      <div class="row">
        {#each data.arrivals as p (p.id)}
          <ProductCard product={p} price={data.prices[p.id]} {loggedIn} {status} />
        {/each}
      </div>
    {:else}
      <div class="empty">New designs are being added. <a href="/collections">Browse the catalogue</a> or <a href="/wholesale-enquiry">send an enquiry</a>.</div>
    {/if}
  </div>
</section>

<!-- ================= WHY US + ENQUIRY (one compact band) ================= -->
<section class="band">
  <div class="container band-grid">
    <div class="reasons">
      {#each reasons as r}
        <div class="reason">
          <span class="ri"><Icon name={r.icon} size={22} /></span>
          <div><strong>{r.title}</strong><span>{r.text}</span></div>
        </div>
      {/each}
    </div>
    <div class="enq">
      <h2>Planning a bulk order?</h2>
      <p>Share your requirements and get catalogues, pricing and MOQ details.</p>
      <div class="enq-btns">
        <a class="btn btn--light" href="/wholesale-enquiry">Wholesale enquiry</a>
        <a class="btn btn--ghost-light" href={waLink(s.whatsapp_number, s.whatsapp_message)} target="_blank" rel="noopener noreferrer"
          ><Icon name="whatsapp" size={18} /> WhatsApp</a
        >
      </div>
    </div>
  </div>
</section>

<style>
  /* ---------- HERO ---------- */
  .hero {
    background: var(--white);
    border-bottom: 1px solid var(--charcoal-08);
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1fr;
    max-width: 1440px;
    margin: 0 auto;
  }
  @media (min-width: 1000px) {
    .hero-grid {
      grid-template-columns: 1.05fr 1fr;
      min-height: min(640px, calc(100vh - var(--header-h) - 96px));
    }
  }
  .visual {
    position: relative;
    background: var(--burgundy);
    overflow: hidden;
    min-height: 340px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
  }
  /* curved ivory sweep inspired by the brand colour board */
  .sweep {
    position: absolute;
    right: -32%;
    top: -20%;
    width: 75%;
    height: 150%;
    border-radius: 50%;
    border-left: clamp(26px, 4vw, 56px) solid var(--ivory);
    transform: rotate(-12deg);
    opacity: 0.95;
  }
  .model {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }
  .ornament {
    position: absolute;
    left: 6%;
    top: 50%;
    transform: translateY(-50%);
    width: min(360px, 62%);
    color: var(--ivory);
    opacity: 0.9;
  }
  .tiles {
    position: absolute;
    right: clamp(14px, 4%, 48px);
    top: 50%;
    transform: translateY(-50%);
    display: grid;
    gap: clamp(10px, 1.4vw, 18px);
    z-index: 2;
  }
  .tile {
    display: block;
    width: clamp(92px, 11vw, 168px);
    aspect-ratio: 1;
    border-radius: 18px;
    overflow: hidden;
    background: var(--white);
    border: 3px solid var(--white);
    box-shadow: 0 18px 40px -14px rgba(48, 43, 43, 0.45);
  }
  .tile:nth-child(2) {
    transform: translateX(-28%);
  }
  .tile img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .tile--empty {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--burgundy-30);
    background: var(--ivory);
  }

  .copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: clamp(28px, 4vw, 56px) var(--gutter);
    background: var(--ivory);
  }
  .kicker {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--burgundy);
  }
  .kicker .line {
    width: 44px;
    height: 1px;
    background: var(--burgundy);
  }
  .copy h1 {
    font-size: clamp(2.2rem, 4.4vw, 3.9rem);
    font-weight: 700;
    color: var(--burgundy);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1.05;
    margin: 16px 0 10px;
    max-width: 14ch;
  }
  .copy h1.long {
    font-size: clamp(1.9rem, 3.2vw, 3rem);
    max-width: 18ch;
    letter-spacing: 0.02em;
  }
  .sub {
    font-size: clamp(0.8rem, 1.2vw, 1rem);
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: var(--charcoal);
    margin: 0 0 clamp(18px, 2.6vw, 30px);
  }
  .features {
    list-style: none;
    padding: 0;
    margin: 0 0 clamp(20px, 2.6vw, 30px);
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    width: 100%;
    max-width: 560px;
  }
  .features li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 0 6px;
    border-left: 1px solid var(--charcoal-15);
  }
  .features li:first-child {
    border-left: 0;
  }
  .fi {
    width: clamp(50px, 5vw, 64px);
    height: clamp(50px, 5vw, 64px);
    border-radius: 50%;
    background: var(--burgundy);
    color: var(--white);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 4px var(--white), 0 0 0 5px var(--burgundy-30);
  }
  .fl {
    white-space: pre-line;
    font-size: clamp(0.66rem, 0.85vw, 0.78rem);
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1.35;
    color: var(--charcoal);
  }
  .cta {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 16px clamp(22px, 3vw, 40px);
    border-radius: 10px;
    background: var(--burgundy);
    color: var(--white);
    font-family: var(--font-display);
    font-size: clamp(1.1rem, 1.7vw, 1.55rem);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none !important;
    box-shadow: var(--shadow-lg);
    transition: background 0.2s, transform 0.2s;
  }
  .cta:hover {
    background: var(--charcoal);
    transform: translateY(-2px);
  }
  .only {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 18px 0 0;
    font-family: var(--font-display);
    font-size: clamp(1rem, 1.5vw, 1.3rem);
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--burgundy);
  }
  .only span {
    width: 40px;
    height: 1px;
    background: var(--burgundy);
  }

  .trust {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    background: var(--burgundy);
    color: var(--white);
  }
  @media (min-width: 900px) {
    .trust {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  .ti {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 14px 12px;
    border-right: 1px solid var(--ivory-20);
  }
  .ti div {
    display: flex;
    flex-direction: column;
    line-height: 1.25;
  }
  .ti strong {
    font-size: 0.78rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .ti span {
    font-size: 0.78rem;
    color: var(--ivory-70);
  }

  /* ---------- Sections ---------- */
  .block {
    padding: clamp(36px, 5vw, 64px) 0;
  }
  .block--white {
    background: var(--white);
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 12px;
    margin-bottom: 22px;
  }
  .head h2 {
    margin: 0;
    color: var(--burgundy);
  }
  .head .eyebrow {
    margin-bottom: 4px;
  }
  .more {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .cats {
    display: flex;
    gap: clamp(14px, 2vw, 26px);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 6px;
    scrollbar-width: thin;
  }
  @media (min-width: 1100px) {
    .cats {
      display: grid;
      grid-template-columns: repeat(9, 1fr);
      overflow: visible;
    }
  }
  .cat {
    flex: 0 0 104px;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    text-align: center;
    color: var(--charcoal);
    text-decoration: none !important;
  }
  .ring {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    padding: 4px;
    border: 1.5px solid var(--burgundy-30);
    transition: border-color 0.2s, transform 0.2s;
  }
  .ring img,
  .mono {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
  .mono {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--burgundy);
    color: var(--ivory);
  }
  .cat:hover .ring {
    border-color: var(--burgundy);
    transform: translateY(-3px);
  }
  .cn {
    font-size: 0.84rem;
    font-weight: 500;
    line-height: 1.25;
  }

  .row {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(200px, 46%);
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 6px;
  }
  .row > :global(*) {
    scroll-snap-align: start;
  }
  @media (min-width: 760px) {
    .row {
      grid-auto-columns: calc((100% - 48px) / 4);
    }
  }

  .band {
    background: var(--burgundy);
    color: var(--white);
    padding: clamp(32px, 4vw, 52px) 0;
  }
  .band-grid {
    display: grid;
    gap: 28px;
    align-items: center;
  }
  @media (min-width: 1000px) {
    .band-grid {
      grid-template-columns: 1.4fr 1fr;
      gap: 56px;
    }
  }
  .reasons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px 24px;
  }
  .reason {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .reason div {
    display: flex;
    flex-direction: column;
  }
  .reason strong {
    font-size: 0.95rem;
  }
  .reason span {
    font-size: 0.86rem;
    color: var(--ivory-70);
  }
  .ri {
    flex: 0 0 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--ivory-20);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .enq h2 {
    color: var(--white);
    margin-bottom: 6px;
  }
  .enq p {
    color: var(--ivory-70);
  }
  .enq-btns {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  /* ---------- Mobile hero ---------- */
  @media (max-width: 999px) {
    .visual {
      min-height: 260px;
      order: 2;
    }
    .copy {
      order: 1;
    }
    .features li {
      padding: 0 3px;
      gap: 6px;
    }
    .fi {
      width: 44px;
      height: 44px;
    }
    .fl {
      font-size: 0.6rem;
      letter-spacing: 0.02em;
    }
  }
  @media (max-width: 520px) {
    .reasons {
      grid-template-columns: 1fr;
    }
    .cta {
      width: 100%;
      justify-content: center;
      font-size: 1.05rem;
      padding: 14px 16px;
    }
    .cta :global(svg:first-child) {
      display: none;
    }
  }
</style>
