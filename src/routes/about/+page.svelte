<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import Icon from '$lib/components/Icon.svelte';
  let { data } = $props();
  const pillars = [
    {
      icon: 'diamond',
      title: 'Craftsmanship',
      text: 'Our artisans work on stone setting, polishing and plating by hand, giving each design a finish that holds up on retail counters.'
    },
    {
      icon: 'factory',
      title: 'Manufacturing',
      text: 'Designs are produced at our Mumbai unit, which lets us control quality, repeat popular designs and plan production for bulk orders.'
    },
    {
      icon: 'check',
      title: 'Product quality',
      text: 'Pieces are inspected before packing for finish, stone alignment and fittings so retailers receive stock that is ready to sell.'
    },
    {
      icon: 'box',
      title: 'Wholesale & bulk supply',
      text: 'We supply in wholesale quantities with clear minimum order quantities per design, for single stores and multi-location distributors alike.'
    },
    {
      icon: 'globe',
      title: 'Collections for every market',
      text: 'American Diamond, Victorian, Heritage, South Indian, Bridal, necklace sets, earrings and bangles — with new designs added regularly.'
    },
    {
      icon: 'handshake',
      title: 'Long-term relationships',
      text: 'Many buyers reorder season after season. We focus on consistent supply and direct communication over WhatsApp.'
    }
  ] as const;
</script>

<Seo
  title="About Us"
  description="Mehfeez Jewels is an artificial jewellery manufacturer and wholesale supplier in Mumbai, India, serving retailers, distributors and resellers with bulk orders."
/>

<section class="page-hero">
  <div class="container">
    <span class="eyebrow">Our story</span>
    <h1>About Mehfeez Jewels</h1>
    <p>Artificial jewellery manufacturer and wholesale supplier based in Malad West, Mumbai.</p>
  </div>
</section>

<section class="section section--white">
  <div class="container narrow">
    <p class="lead">
      Mehfeez Jewels designs and manufactures artificial jewellery for the wholesale trade. We work with jewellery
      retailers, distributors, boutique owners, resellers and bulk buyers across India and in international markets.
    </p>
    <p>
      As the manufacturer, we are directly involved in every step — from design and stone setting to finishing and packing.
      That gives buyers consistency between orders and the ability to reorder their best-performing designs with confidence.
    </p>
    <p>
      This website is a wholesale catalogue. Anyone can browse the designs; registered and approved business customers can
      see wholesale prices. Orders, quantities and delivery are discussed directly with our team on WhatsApp — there is no
      online checkout.
    </p>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">What we focus on</span>
      <h2>Built around wholesale buyers</h2>
      <div class="divider"></div>
    </div>
    <div class="pillars">
      {#each pillars as p}
        <div class="pillar card">
          <span class="pi"><Icon name={p.icon} size={24} /></span>
          <h3>{p.title}</h3>
          <p>{p.text}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<section class="section section--burgundy">
  <div class="container cta">
    <h2>Start a wholesale relationship</h2>
    <p>Register your business to view wholesale prices, or send us an enquiry today.</p>
    <div class="row">
      {#if !data.user}<a class="btn btn--light" href="/register">Register your business</a>{/if}
      <a class="btn btn--ghost-light" href="/wholesale-enquiry">Wholesale enquiry</a>
    </div>
  </div>
</section>

<style>
  .narrow {
    max-width: 820px;
  }
  .narrow p {
    color: var(--charcoal-70);
    font-size: 1.05rem;
  }
  .narrow .lead {
    font-family: var(--font-display);
    font-size: clamp(1.35rem, 2.4vw, 1.75rem);
    line-height: 1.45;
    color: var(--charcoal);
  }
  .pillars {
    display: grid;
    gap: 20px;
  }
  @media (min-width: 720px) {
    .pillars {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 1080px) {
    .pillars {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  .pillar p {
    color: var(--charcoal-70);
    margin: 0;
  }
  .pi {
    display: inline-flex;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    background: var(--burgundy);
    color: var(--white);
    margin-bottom: 14px;
  }
  .cta {
    text-align: center;
  }
  .cta p {
    color: var(--ivory-70);
  }
  .row {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 20px;
  }
</style>
