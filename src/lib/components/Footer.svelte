<script lang="ts">
  import Logo from './Logo.svelte';
  import Icon from './Icon.svelte';
  import { waLink } from '$lib/whatsapp';
  import type { Category, SiteSettings } from '$lib/types';

  let { settings, categories }: { settings: SiteSettings; categories: Category[] } = $props();
  const year = new Date().getFullYear();
  const wa = $derived(waLink(settings.whatsapp_number, settings.whatsapp_message));
</script>

<footer class="footer">
  <div class="container cols">
    <div class="brand">
      <Logo light size="lg" />
      <p>
        Premium artificial jewellery manufacturer and wholesale supplier based in Mumbai, India — supplying retailers,
        wholesalers, boutiques and resellers in India and internationally.
      </p>
      <div class="social">
        <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><Icon name="whatsapp" /></a>
        {#if settings.instagram_url}
          <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Icon name="instagram" /></a>
        {/if}
        {#if settings.facebook_url}
          <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Icon name="facebook" /></a>
        {/if}
        {#if settings.contact_email}
          <a href={`mailto:${settings.contact_email}`} aria-label="Email"><Icon name="mail" /></a>
        {/if}
      </div>
    </div>

    <div>
      <h4>Product Categories</h4>
      <ul>
        <li><a href="/collections">All Designs</a></li>
        {#each categories.slice(0, 8) as c}
          <li><a href={`/categories/${c.slug}`}>{c.name}</a></li>
        {/each}
      </ul>
    </div>

    <div>
      <h4>Wholesale</h4>
      <ul>
        <li><a href="/wholesale-enquiry">B2B Enquiry</a></li>
        <li><a href="/wholesale-enquiry?type=catalogue">Request Catalogue</a></li>
        <li><a href={waLink(settings.video_call_number, settings.video_call_message)} target="_blank" rel="noopener noreferrer">Book a Video Call</a></li>
        <li><a href="/register">Open a Wholesale Account</a></li>
        <li><a href="/about">About Us</a></li>
        <li><a href="/contact">Contact Us</a></li>
        {#if settings.instagram_url}<li><a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">Instagram</a></li>{/if}
      </ul>
    </div>

    <div>
      <h4>Contact</h4>
      <ul class="contact">
        <li><Icon name="pin" size={17} /><span>{settings.address}</span></li>
        <li><Icon name="whatsapp" size={17} /><a href={wa} target="_blank" rel="noopener noreferrer">{settings.contact_phone}</a></li>
        {#if settings.contact_email}
          <li><Icon name="mail" size={17} /><a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></li>
        {/if}
        {#if settings.business_hours}
          <li><Icon name="clock" size={17} /><span>{settings.business_hours}</span></li>
        {/if}
      </ul>
    </div>
  </div>

  <div class="bottom">
    <div class="container bottom-inner">
      <span>© {year} Mehfeez Jewels. All rights reserved.</span>
      <nav aria-label="Legal">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms &amp; Conditions</a>
        <a href="/shipping-policy">Shipping Policy</a>
        <a href="/return-policy">Return Policy</a>
      </nav>
    </div>
  </div>
</footer>

<style>
  .footer {
    background: var(--burgundy-deep);
    border-top: 1px solid var(--ivory-20);
    color: var(--ivory-70);
    padding-top: clamp(48px, 7vw, 84px);
    font-size: 0.92rem;
  }
  .cols {
    display: grid;
    gap: 34px 20px;
    grid-template-columns: 1fr 1fr;
  }
  .brand,
  .cols > div:last-child {
    grid-column: 1 / -1;
  }
  @media (min-width: 1024px) {
    .cols {
      grid-template-columns: 1.5fr 1fr 1fr 1.3fr;
      gap: 48px;
    }
    .brand,
    .cols > div:last-child {
      grid-column: auto;
    }
  }
  .brand p {
    margin: 20px 0 18px;
    max-width: 380px;
    line-height: 1.7;
  }
  h4 {
    color: var(--white);
    font-family: var(--font-body);
    font-size: 0.74rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 18px;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
  }
  a {
    color: var(--ivory);
  }
  .contact li {
    display: grid;
    grid-template-columns: 20px 1fr;
    gap: 12px;
    align-items: start;
  }
  .contact :global(svg) {
    margin-top: 3px;
    color: var(--white);
  }
  .social {
    display: flex;
    gap: 10px;
  }
  .social a {
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--ivory-20);
  }
  .social a:hover {
    background: var(--burgundy);
    border-color: var(--burgundy);
    text-decoration: none;
  }
  .bottom {
    margin-top: 56px;
    border-top: 1px solid var(--ivory-20);
    padding: 20px 0 96px;
    font-size: 0.82rem;
  }
  .bottom-inner {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 24px;
    justify-content: space-between;
    align-items: center;
  }
  .bottom nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 22px;
  }
  @media (min-width: 760px) {
    .bottom {
      padding-bottom: 24px;
    }
  }
</style>
