<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '../Icon.svelte';
  import { imageUrl } from '$lib/image';
  import type { HeroSlide } from '$lib/types';

  let { slides }: { slides: HeroSlide[] } = $props();

  // Minimal copy: short heading, one short line.
  const DEFAULT = {
    eyebrow: 'Wholesale only',
    title: 'Premium Artificial Jewellery, Direct from Manufacturers',
    subtitle: 'Discover exclusive jewellery collections crafted for retailers, boutiques and wholesale buyers.'
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
    <!-- No admin slides yet: the brand hero photo (static/hero/), text over the curtain on desktop. -->
    <div class="slide on slide--brand">
      <div class="media media--brand">
        <picture>
          <source media="(max-width: 759px)" srcset="/hero/bridal-portrait-mobile.webp" type="image/webp" />
          <img
            src="/hero/bridal-portrait-1672.webp"
            srcset="/hero/bridal-portrait-1200.webp 1200w, /hero/bridal-portrait-1672.webp 1672w"
            sizes="100vw"
            alt="Bride wearing an American diamond choker set with matching earrings, ring and bracelet"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            width="1672"
            height="878"
          />
        </picture>
      </div>
      {@render copy(DEFAULT.eyebrow, DEFAULT.title, DEFAULT.subtitle, null, null, true)}
    </div>
  {/if}
</section>

<style>
  .hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    background: var(--burgundy-deep);
    color: var(--ivory);
    overflow: hidden;
  }
  .slide {
    grid-area: 1 / 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
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
    background: var(--burgundy);
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
    color: var(--ivory-70);
  }
  .kicker .line {
    width: 38px;
    height: 1px;
    background: var(--ivory-20);
  }
  h1,
  .h1 {
    font-size: clamp(1.45rem, 2.6vw, 2.5rem);
    font-weight: 600;
    line-height: 1.18;
    color: var(--white);
    margin: 12px 0 8px;
    max-width: 20ch;
  }
  .copy p {
    color: var(--ivory-70);
    max-width: 38ch;
    font-size: 0.84rem;
    line-height: 1.6;
    letter-spacing: 0.02em;
    margin-bottom: 0;
  }

  /* brand hero photo */
  .media--brand {
    aspect-ratio: 4 / 5;
  }
  .media--brand img {
    object-position: 50% 30%;
  }
  @media (min-width: 760px) {
    .media--brand {
      aspect-ratio: 1672 / 878;
    }
  }
  /* Desktop: full-width photo, copy over the empty curtain on the left */
  @media (min-width: 1000px) {
    .slide.slide--brand {
      grid-template-columns: minmax(0, 1fr);
      min-height: 0;
    }
    .slide--brand > * {
      grid-area: 1 / 1;
    }
    .slide--brand .media.media--brand {
      aspect-ratio: auto;
      width: 100%;
      height: clamp(460px, 46vw, min(720px, calc(100vh - 140px)));
      min-height: 0;
    }
    .slide--brand .media--brand img {
      object-position: 70% 30%;
    }
    .slide--brand .media--brand::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(46, 4, 16, 0.82) 0%, rgba(46, 4, 16, 0.55) 30%, rgba(46, 4, 16, 0) 52%);
      pointer-events: none;
    }
    .slide--brand .copy.copy {
      position: relative;
      z-index: 1;
      align-self: center;
      max-width: min(560px, 46%);
      padding: 48px clamp(40px, 5vw, 88px);
    }
    .slide--brand h1 {
      font-size: clamp(1.9rem, 2.7vw, 2.8rem);
      max-width: 15ch;
    }
    .slide--brand .copy p {
      font-size: 0.95rem;
    }
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
    border: 1px solid var(--ivory-20);
    background: rgba(69, 16, 32, 0.6);
    color: var(--ivory);
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
    border: 1px solid var(--ivory);
    background: transparent;
    transform: rotate(45deg);
    cursor: pointer;
  }
  .dots button.on {
    background: var(--ivory);
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
    .arrow {
      display: inline-flex;
    }
    .dots {
      left: 31%;
    }
  }
</style>
