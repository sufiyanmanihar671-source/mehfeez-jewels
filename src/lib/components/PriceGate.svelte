<script lang="ts">
  import { page } from '$app/state';
  import Icon from './Icon.svelte';
  import { formatPrice } from '$lib/format';
  import type { Price } from '$lib/types';

  /**
   * Displays the wholesale price ONLY if the server sent one. The server only
   * sends prices to approved customers (enforced by Supabase RLS), so for
   * everyone else there is no price anywhere in the HTML or JSON payload.
   */
  let {
    price,
    loggedIn,
    status,
    compact = false
  }: {
    price: Price | null | undefined;
    loggedIn: boolean;
    status: 'pending' | 'approved' | 'rejected' | null | undefined;
    compact?: boolean;
  } = $props();

  let revealed = $state(false);
  const next = $derived(encodeURIComponent(page.url.pathname));
</script>

{#if price}
  <div class="price" class:compact>
    <span class="label">Wholesale price</span>
    <span class="amount">{formatPrice(price.price, price.currency)}</span>
    {#if price.price_note && !compact}<span class="note">{price.price_note}</span>{/if}
  </div>
{:else if loggedIn && status === 'pending'}
  <div class="gate" class:compact>
    <Icon name="lock" size={16} />
    <span>Prices visible after account approval</span>
  </div>
{:else if loggedIn && status === 'rejected'}
  <div class="gate" class:compact>
    <Icon name="lock" size={16} />
    <span>Price access unavailable — please contact us</span>
  </div>
{:else if loggedIn && status === 'approved'}
  <div class="gate" class:compact><span>Price on request</span></div>
{:else}
  <button type="button" class="gate gate--btn" class:compact onclick={() => (revealed = !revealed)} aria-expanded={revealed}>
    <Icon name="lock" size={16} />
    <span>Login or Register to View Wholesale Prices</span>
  </button>
  {#if revealed}
    <div class="prompt" role="status">
      <p>Wholesale prices are available to approved business customers.</p>
      <div class="row">
        <a class="btn btn--sm" href={`/login?next=${next}`}>Login</a>
        <a class="btn btn--sm btn--outline" href="/register">Register</a>
      </div>
    </div>
  {/if}
{/if}

<style>
  .price {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .label {
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--charcoal-50);
  }
  .amount {
    font-family: var(--font-display);
    font-size: 1.9rem;
    font-weight: 700;
    color: var(--burgundy);
    line-height: 1.1;
  }
  .compact .amount {
    font-size: 1.25rem;
  }
  .note {
    font-size: 0.85rem;
    color: var(--charcoal-70);
  }
  .gate {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border: 1px dashed var(--burgundy-30);
    border-radius: var(--radius);
    background: var(--burgundy-08);
    color: var(--burgundy);
    font: inherit;
    font-size: 0.85rem;
    font-weight: 500;
    text-align: left;
    width: 100%;
  }
  .gate.compact {
    font-size: 0.74rem;
    padding: 8px 10px;
  }
  .gate--btn {
    cursor: pointer;
  }
  .gate--btn:hover {
    background: var(--burgundy);
    color: var(--white);
    border-style: solid;
  }
  .prompt {
    margin-top: 10px;
    padding: 14px;
    border: 1px solid var(--charcoal-15);
    border-radius: var(--radius);
    background: var(--white);
    font-size: 0.88rem;
  }
  .prompt p {
    margin-bottom: 10px;
  }
  .row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
</style>
