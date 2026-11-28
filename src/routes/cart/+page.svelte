<script lang="ts">
  import { page } from '$app/state';
  import { env } from '$env/dynamic/public';
  import Seo from '$lib/components/Seo.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { imageUrl } from '$lib/image';
  import { waLink } from '$lib/whatsapp';
  import { cart } from '$lib/cart.svelte';

  let { data } = $props();
  const s = $derived(data.settings);
  const site = $derived((env.PUBLIC_SITE_URL || page.url.origin).replace(/\/$/, ''));
  let note = $state('');

  const options = (i: (typeof cart.items)[number]) =>
    [i.variant && `Variation: ${i.variant}`, i.color && `Colour: ${i.color}`, i.size && `Size: ${i.size}`].filter(Boolean).join(', ');

  // One WhatsApp message with every design in the cart (no prices, no totals).
  const message = $derived(
    [
      'Hello Mehfeez Jewels, I would like wholesale details for these designs:',
      '',
      ...cart.items.map((i, n) => {
        const o = options(i);
        return `${n + 1}. ${i.name} (SKU ${i.sku})${o ? `\n   ${o}` : ''}\n   ${site}/products/${i.slug}`;
      }),
      '',
      note.trim() ? `Note: ${note.trim()}\n` : '',
      'Please share wholesale prices, MOQ and availability.'
    ]
      .filter((l, idx, a) => !(l === '' && a[idx - 1] === ''))
      .join('\n')
  );
</script>

<Seo title="Enquiry Cart" description="Your list of designs to enquire about on WhatsApp." noindex />

<section class="cartpage">
  <div class="container narrow">
    <header class="head">
      <span class="eb">Wholesale enquiry</span>
      <h1>Enquiry Cart</h1>
      <p>Add designs while you browse, then send the whole list to us on WhatsApp in one message. No payment online — we confirm prices, MOQ and availability with you.</p>
    </header>

    {#if !cart.ready}
      <p class="muted center">Loading…</p>
    {:else if !cart.count}
      <div class="empty">
        <Icon name="bag" size={40} stroke={1.2} />
        <h2>Your enquiry cart is empty</h2>
        <p>Open any design and tap <b>Add to Enquiry Cart</b>.</p>
        <a class="btn" href="/collections">Browse Designs</a>
      </div>
    {:else}
      <ul class="list">
        {#each cart.items as i (i.key)}
          <li>
            <a class="thumb" href={`/products/${i.slug}`} aria-label={i.name}>
              {#if i.image}
                <img src={imageUrl(i.image, 200)} alt="" width="80" height="100" loading="lazy" />
              {:else}
                <Icon name="gem" size={26} stroke={1.2} />
              {/if}
            </a>
            <div class="info">
              <a class="name" href={`/products/${i.slug}`}>{i.name}</a>
              <span class="sku">SKU {i.sku}</span>
              {#if options(i)}<span class="opts">{options(i)}</span>{/if}
            </div>
            <button class="rm" type="button" onclick={() => cart.remove(i.key)} aria-label={`Remove ${i.name}`}>
              <Icon name="close" size={16} />
            </button>
          </li>
        {/each}
      </ul>

      <label class="note">
        <span>Note for us (optional)</span>
        <textarea bind:value={note} rows="3" maxlength="500" placeholder="e.g. quantity per design, delivery city, preferred colours"></textarea>
      </label>

      <a class="btn btn--block send" href={waLink(s.whatsapp_number, message)} target="_blank" rel="noopener noreferrer">
        <Icon name="whatsapp" size={18} /> Send {cart.count} {cart.count === 1 ? 'design' : 'designs'} on WhatsApp
      </a>
      <div class="row">
        <a class="textlink" href="/collections">+ Add more designs</a>
        <button class="textlink" type="button" onclick={() => confirm('Remove all designs from the enquiry cart?') && cart.clear()}>Clear cart</button>
      </div>
    {/if}
  </div>
</section>

<style>
  .cartpage {
    padding: clamp(28px, 5vw, 64px) 0 clamp(48px, 7vw, 88px);
    background: var(--ivory);
    min-height: 60vh;
  }
  .narrow {
    max-width: 720px;
  }
  .head {
    text-align: center;
    margin-bottom: 22px;
  }
  .eb {
    font-size: 0.7rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--burgundy-accent);
  }
  h1 {
    margin: 6px 0 8px;
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    color: var(--burgundy);
  }
  .head p {
    color: var(--muted);
    font-size: 0.9rem;
    max-width: 46ch;
    margin: 0 auto;
  }
  .center {
    text-align: center;
  }
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 36px 20px;
    text-align: center;
    background: var(--white);
    border: 1px solid var(--burgundy-15);
    color: var(--burgundy);
  }
  .empty h2 {
    margin: 6px 0 0;
    font-size: 1.3rem;
    color: var(--charcoal);
  }
  .empty p {
    color: var(--muted);
    margin: 0 0 10px;
  }
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
  }
  .list li {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr) auto;
    align-items: center;
    gap: 14px;
    padding: 10px;
    background: var(--white);
    border: 1px solid var(--burgundy-15);
  }
  .thumb {
    width: 72px;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--burgundy-deep);
    color: var(--ivory-70);
  }
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .name {
    font-family: var(--font-display);
    font-size: 1.08rem;
    font-weight: 600;
    color: var(--charcoal);
    line-height: 1.25;
  }
  .sku {
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    color: var(--muted);
  }
  .opts {
    font-size: 0.8rem;
    color: var(--burgundy);
    font-weight: 500;
  }
  .rm {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--burgundy-15);
    border-radius: 50%;
    background: var(--ivory);
    color: var(--burgundy);
    cursor: pointer;
  }
  .note {
    display: grid;
    gap: 6px;
    margin: 18px 0 14px;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .note textarea {
    text-transform: none;
    letter-spacing: 0;
    font-size: 0.92rem;
  }
  .send {
    min-height: 52px;
    letter-spacing: 0.1em;
  }
  .row {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
  }
  .textlink {
    padding: 4px 0;
    border: 0;
    background: none;
    color: var(--burgundy);
    font: inherit;
    font-size: 0.86rem;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
</style>
