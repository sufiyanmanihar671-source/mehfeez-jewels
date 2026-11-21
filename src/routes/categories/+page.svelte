<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { imageUrl } from '$lib/image';
  let { data } = $props();
</script>

<Seo
  title="Jewellery Categories"
  description="Wholesale artificial jewellery categories: American Diamond, Victorian, Heritage, South Indian, Bridal, necklace sets, earrings, bangles and latest designs."
/>

<section class="page-hero">
  <div class="container">
    <span class="eyebrow">Explore</span>
    <h1>Jewellery Categories</h1>
    <p>Every category is available for wholesale and bulk orders.</p>
  </div>
</section>

<section class="section">
  <div class="container">
    {#if data.categories.length}
      <div class="list">
        {#each data.categories as c (c.id)}
          <a class="item" href={`/categories/${c.slug}`}>
            <div class="thumb">
              {#if c.image_url}
                <img src={imageUrl(c.image_url, 480)} alt={c.name} loading="lazy" decoding="async" width="400" height="300" />
              {:else}
                <Icon name="diamond" size={40} />
              {/if}
            </div>
            <div class="txt">
              <h2>{c.name}</h2>
              {#if c.description}<p>{c.description}</p>{/if}
              <span class="go">View designs <Icon name="arrow" size={14} /></span>
            </div>
          </a>
        {/each}
      </div>
    {:else}
      <div class="empty">Categories will appear here once the catalogue is connected.</div>
    {/if}
  </div>
</section>

<style>
  .list {
    display: grid;
    gap: 20px;
  }
  @media (min-width: 720px) {
    .list {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 1100px) {
    .list {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  .item {
    display: flex;
    flex-direction: column;
    background: var(--white);
    border: 1px solid var(--charcoal-08);
    border-radius: var(--radius-lg);
    overflow: hidden;
    color: var(--charcoal);
    text-decoration: none !important;
    transition: box-shadow 0.25s;
  }
  .item:hover {
    box-shadow: var(--shadow-lg);
  }
  .thumb {
    aspect-ratio: 4 / 3;
    background: var(--burgundy);
    color: var(--ivory-70);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .txt {
    padding: 20px;
  }
  .txt h2 {
    font-size: 1.5rem;
    margin-bottom: 6px;
  }
  .txt p {
    color: var(--charcoal-70);
    font-size: 0.94rem;
  }
  .go {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.74rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--burgundy);
  }
</style>
