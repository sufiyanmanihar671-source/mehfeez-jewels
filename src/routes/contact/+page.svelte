<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { waLink } from '$lib/whatsapp';
  let { data } = $props();
  const s = $derived(data.settings);
  // Map pin from the address in Admin > Settings (no API key needed for the embed).
  const mapQuery = $derived(encodeURIComponent(s.address));
  const mapEmbed = $derived(`https://www.google.com/maps?q=${mapQuery}&z=16&output=embed`);
  const directions = $derived(`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`);
</script>

<Seo
  title="Contact Us"
  description="Contact Mehfeez Jewels, artificial jewellery wholesaler in Malad West, Mumbai. WhatsApp +91 93212 45814 for wholesale and bulk enquiries."
/>

<section class="page-hero">
  <div class="container">
    <span class="eyebrow">Get in touch</span>
    <h1>Contact Us</h1>
    <p>For wholesale pricing, catalogues and bulk orders, reach us on WhatsApp or send an enquiry.</p>
  </div>
</section>

<section class="section">
  <div class="container grid2">
    <div class="card info">
      <div class="item">
        <span class="ic"><Icon name="pin" /></span>
        <div>
          <h3>Address</h3>
          <p>{s.address}</p>
          <a href={directions} target="_blank" rel="noopener noreferrer">Get directions ↗</a>
        </div>
      </div>
      <div class="item">
        <span class="ic"><Icon name="whatsapp" /></span>
        <div>
          <h3>WhatsApp / Phone</h3>
          <p><a href={waLink(s.whatsapp_number, s.whatsapp_message)} target="_blank" rel="noopener noreferrer">{s.contact_phone}</a></p>
        </div>
      </div>
      {#if s.contact_email}
        <div class="item">
          <span class="ic"><Icon name="mail" /></span>
          <div>
            <h3>Email</h3>
            <p><a href={`mailto:${s.contact_email}`}>{s.contact_email}</a></p>
          </div>
        </div>
      {/if}
      {#if s.business_hours}
        <div class="item">
          <span class="ic"><Icon name="clock" /></span>
          <div>
            <h3>Business hours</h3>
            <p>{s.business_hours}</p>
          </div>
        </div>
      {/if}
    </div>
    <div class="card actions">
      <h2>Talk to our wholesale team</h2>
      <p class="muted">We work with wholesale buyers in India and abroad. International buyers can message us on WhatsApp at any time.</p>
      <a class="btn btn--block" href={waLink(s.whatsapp_number, s.whatsapp_message)} target="_blank" rel="noopener noreferrer"
        ><Icon name="whatsapp" size={18} /> Chat on WhatsApp</a
      >
      {#if s.video_call_enabled}
        <a class="btn btn--outline btn--block" href={waLink(s.video_call_number, s.video_call_message)} target="_blank" rel="noopener noreferrer"
          ><Icon name="video" size={18} /> Schedule a video call</a
        >
        <p class="muted small">Opens WhatsApp with a message requesting a call. We will confirm a suitable time with you.</p>
      {/if}
      <a class="btn btn--outline btn--block" href="/wholesale-enquiry">Send a written enquiry</a>
    </div>
  </div>
</section>

<section class="section section--white mapsec">
  <div class="container">
    <h2 class="maph">Find us</h2>
    <div class="map">
      <iframe title="Mehfeez Jewels location on Google Maps" src={mapEmbed} loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
    </div>
    <a class="btn btn--block dir" href={directions} target="_blank" rel="noopener noreferrer"><Icon name="pin" size={17} /> Get directions</a>
  </div>
</section>

<style>
  .grid2 {
    display: grid;
    gap: 24px;
  }
  @media (min-width: 900px) {
    .grid2 {
      grid-template-columns: 1.1fr 0.9fr;
    }
  }
  .info {
    display: grid;
    gap: 26px;
  }
  .item {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 16px;
  }
  .item h3 {
    margin: 0 0 4px;
    font-size: 1.2rem;
  }
  .item p {
    margin: 0 0 4px;
    color: var(--charcoal-70);
  }
  .ic {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--burgundy);
    color: var(--white);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .small {
    font-size: 0.82rem;
    margin: 0;
  }
  .mapsec {
    padding-top: 0;
  }
  .maph {
    text-align: center;
    margin-bottom: 16px;
  }
  .map {
    position: relative;
    aspect-ratio: 16 / 9;
    min-height: 280px;
    overflow: hidden;
    border: 1px solid var(--burgundy-15);
    background: var(--ivory);
  }
  .map iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
  .dir {
    max-width: 360px;
    margin: 14px auto 0;
  }
  @media (max-width: 759px) {
    .map {
      aspect-ratio: 4 / 5;
    }
  }
</style>
