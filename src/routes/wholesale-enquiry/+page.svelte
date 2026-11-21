<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import EnquiryForm from '$lib/components/EnquiryForm.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { waLink } from '$lib/whatsapp';

  let { data, form } = $props();
</script>

<Seo
  title="Wholesale Enquiry"
  description="Send a wholesale or bulk order enquiry to Mehfeez Jewels, artificial jewellery manufacturer in Mumbai. We serve retailers, distributors and resellers in India and worldwide."
/>

<section class="page-hero">
  <div class="container">
    <span class="eyebrow">Business to business</span>
    <h1>Wholesale Enquiry</h1>
    <p>Tell us what you are looking for — categories, quantities and destination country — and our team will get back to you.</p>
  </div>
</section>

<section class="section">
  <div class="container layout">
    <div class="card">
      <EnquiryForm
        categories={data.categories}
        {form}
        action="?"
        defaults={data.defaults}
        productId={data.product?.id ?? null}
        productLabel={data.product ? `${data.product.name} (SKU ${data.product.sku})` : null}
      />
    </div>
    <aside class="side">
      <h3>Prefer WhatsApp?</h3>
      <p class="muted">Most of our wholesale discussions happen on WhatsApp. Message us directly for a faster reply.</p>
      <a class="btn btn--block" href={waLink(data.settings.whatsapp_number, data.settings.whatsapp_message)} target="_blank" rel="noopener noreferrer"
        ><Icon name="whatsapp" size={18} /> Chat on WhatsApp</a
      >
      {#if data.settings.video_call_enabled}
        <a
          class="btn btn--outline btn--block"
          href={waLink(data.settings.video_call_number, data.settings.video_call_message)}
          target="_blank"
          rel="noopener noreferrer"><Icon name="video" size={18} /> Request a video call</a
        >
        <p class="muted small">Sends a WhatsApp message asking to arrange a video call.</p>
      {/if}
      <hr />
      <h4>What to include</h4>
      <ul>
        <li>Your business type and city/country</li>
        <li>Categories and designs of interest</li>
        <li>Approximate quantity per design</li>
        <li>Delivery timeline</li>
      </ul>
    </aside>
  </div>
</section>

<style>
  .layout {
    display: grid;
    gap: 28px;
  }
  @media (min-width: 960px) {
    .layout {
      grid-template-columns: 1.6fr 0.9fr;
      align-items: start;
    }
  }
  .side {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 28px;
    border: 1px solid var(--charcoal-08);
    border-radius: var(--radius-lg);
    background: var(--white);
  }
  .side h3,
  .side h4 {
    margin: 0;
  }
  .side ul {
    margin: 0;
    padding-left: 18px;
    color: var(--charcoal-70);
  }
  hr {
    border: 0;
    border-top: 1px solid var(--charcoal-08);
    width: 100%;
    margin: 8px 0;
  }
  .small {
    font-size: 0.82rem;
    margin: 0;
  }
</style>
