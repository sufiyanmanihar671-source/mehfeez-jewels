<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '../Icon.svelte';
  import { imageUrl } from '$lib/image';
  import type { HeroSlide } from '$lib/types';

  type Fallback = { images: string[] };
  let { slides, fallback }: { slides: HeroSlide[]; fallback: Fallback } = $props();

  const DEFAULT = {
    eyebrow: 'Mehfeez Jewels',
    title: 'Premium Artificial Jewellery Manufacturer & Wholesale Supplier',
    subtitle:
      'Discover elegant artificial jewellery collections, exceptional craftsmanship and competitive wholesale pricing for your business.'
  };

  let index = $state(0);
  let paused = $state(false);
  let touchX = 0;
  const count = $derived(slides.length);
  const go = (i: number) => (index = (i + count) % count);

  onMount(() => {
    if (count < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => {
      if (!paused && !document.hidden) go(index + 1);
    }, 6000);
    return () => clearInterval(t);
  });
</script>

{#snippet copy(eyebrow: string, title: string, subtitle: string | null, ctaLabel: string | null, ctaHref: string | null, first: boolean)}
  <div class="copy">
    <span class="kicker"><span class="line"></span>{eyebrow}<span class="line"></span></span>
    {#if first}<h1>{title}</h1>{:else}<h2 class="h1">{title}</h2>{/if}
    {#if subtitle}<p>{subtitle}</p>{/if}
    <div class="ctas">
      <a class="btn" href={ctaHref || '/collections'}>{ctaLabel || 'Explore Collections'}</a>
      <a class="btn btn--outline" href="/wholesale-enquiry?type=catalogue">Request Wholesale Catalogue</a>
    </div>
  </div>
{/snippet}

<section
  class="hero"
  aria-roledescription="carousel"
  aria-label="Featured collections"
  onmouseenter={() => (paused = true)}
  onmouseleave={() => (paused = false)}
  ontouchstart={(e) => (touchX = e.touches[0].clientX)}
  ontouchend={(e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (count > 1 && Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
  }}
>
  {#if count}
    {#each slides as s, i (s.id)}
      <div class="slide" class:on={i === index} aria-hidden={i !== index} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`}>
        <div class="media">
          <picture>
            {#if s.mobile_image_url}<source media="(max-width: 759px)" srcset={imageUrl(s.mobile_image_url, 900)} />{/if}
            <img
              src={imageUrl(s.image_url, 1600)}
              alt={s.title}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchpriority={i === 0 ? 'high' : 'auto'}
              decoding="async"
              width="1600"
              height="1000"
            />
          </picture>
        </div>
        {@render copy(s.eyebrow || DEFAULT.eyebrow, s.title, s.subtitle, s.cta_label, s.cta_href, i === 0)}
      </div>
    {/each}
    {#if count > 1}
      <button class="arrow prev" type="button" onclick={() => go(index - 1)} aria-label="Previous slide"><Icon name="arrow" size={20} /></button>
      <button class="arrow next" type="button" onclick={() => go(index + 1)} aria-label="Next slide"><Icon name="arrow" size={20} /></button>
      <div class="dots">
        {#each slides as _, i}
          <button type="button" class:on={i === index} onclick={() => go(i)} aria-label={`Go to slide ${i + 1}`} aria-current={i === index}></button>
        {/each}
      </div>
    {/if}
  {:else}
    <!-- No slides uploaded yet: editorial hero using real product photos when available. -->
    <div class="slide on">
      <div class="media media--fallback">
        {#if fallback.images.length}
          <div class="collage n{Math.min(fallback.images.length, 3)}">
            {#each fallback.images.slice(0, 3) as src, i}
              <img src={imageUrl(src, 900)} alt="" loading={i === 0 ? 'eager' : 'lazy'} width="600" height="750" />
            {/each}
          </div>
        {:else}
          <div class="brandpanel" aria-hidden="true">
            <img src="/brand/mehfeez-white.png" alt="" width="1104" height="418" />
            <span>JEWELS</span>
          </div>
        {/if}
      </div>
      {@render copy(DEFAULT.eyebrow, DEFAULT.title, DEFAULT.subtitle, null, null, true)}
    </div>
  {/if}
</section>

<style>
  .hero {
    position: relative;
    display: grid;
    background: var(--ivory);
    border-bottom: 1px solid var(--burgundy-15);
    overflow: hidden;
  }
  .slide {
    grid-area: 1 / 1;
    display: grid;
    grid-template-columns: 1fr;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.9s ease, visibility 0.9s;
  }
  .slide.on {
    opacity: 1;
    visibility: visible;
  }
  .media {
    position: relative;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    background: var(--cream);
  }
  .media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.03);
    transition: transform 7s ease;
  }
  .slide.on .media img {
    transform: scale(1);
  }
  .copy {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: clamp(28px, 5vw, 64px) var(--gutter) clamp(40px, 5vw, 64px);
  }
  .kicker {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.34em;
    text-transform: uppercase;
    color: var(--burgundy-accent);
  }
  .kicker .line {
    width: 38px;
    height: 1px;
    background: var(--burgundy-30);
  }
  h1,
  .h1 {
    font-size: clamp(2rem, 3.6vw, 3.4rem);
    font-weight: 600;
    line-height: 1.12;
    color: var(--burgundy);
    margin: 18px 0 14px;
    max-width: 18ch;
  }
  .copy p {
    color: var(--muted);
    max-width: 46ch;
    font-size: 1.02rem;
  }
  .ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    margin-top: 10px;
  }

  .media--fallback {
    display: flex;
    align-items: stretch;
  }
  @media (max-width: 759px) {
    .media--fallback {
      aspect-ratio: 1;
    }
  }
  .collage {
    display: grid;
    gap: 6px;
    width: 100%;
    background: var(--ivory);
  }
  .collage.n2 {
    grid-template-columns: 1fr 1fr;
  }
  .collage.n3 {
    grid-template-columns: 1.3fr 1fr;
    grid-template-rows: 1fr 1fr;
  }
  .collage.n3 img:first-child {
    grid-row: span 2;
  }
  .collage img {
    transform: none !important;
  }
  .brandpanel {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    background:
      radial-gradient(90% 70% at 70% 20%, rgba(255, 255, 255, 0.07), transparent 60%),
      var(--burgundy);
    color: var(--ivory);
  }
  .brandpanel img {
    width: min(70%, 420px);
    height: auto;
    transform: none !important;
  }
  .brandpanel span {
    letter-spacing: 0.7em;
    margin-right: -0.7em;
    font-size: clamp(0.8rem, 1.4vw, 1.1rem);
  }

  .arrow {
    position: absolute;
    top: 50%;
    z-index: 3;
    width: 46px;
    height: 46px;
    display: none;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--burgundy-15);
    background: rgba(255, 249, 243, 0.92);
    color: var(--burgundy);
    cursor: pointer;
  }
  .arrow.prev {
    left: 16px;
  }
  .arrow.prev :global(svg) {
    transform: rotate(180deg);
  }
  .arrow.next {
    left: calc(62% - 62px);
  }
  .dots {
    position: absolute;
    left: 50%;
    bottom: 16px;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    z-index: 3;
  }
  .dots button {
    width: 9px;
    height: 9px;
    padding: 0;
    border: 1px solid var(--burgundy);
    background: transparent;
    transform: rotate(45deg);
    cursor: pointer;
  }
  .dots button.on {
    background: var(--burgundy);
  }

  @media (min-width: 760px) {
    .media {
      aspect-ratio: 16 / 10;
    }
  }
  @media (min-width: 1000px) {
    .slide {
      grid-template-columns: 62% 38%;
      min-height: min(640px, calc(100vh - 160px));
    }
    .media {
      aspect-ratio: auto;
      min-height: 100%;
    }
    .copy {
      align-items: flex-start;
      text-align: left;
      padding: 48px clamp(32px, 4vw, 72px);
    }
    .ctas {
      justify-content: flex-start;
    }
    .arrow {
      display: inline-flex;
    }
    .dots {
      left: 31%;
    }
  }
</style>
