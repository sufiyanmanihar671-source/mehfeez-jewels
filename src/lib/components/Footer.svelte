<script lang="ts">
  import Logo from './Logo.svelte';
  import Icon from './Icon.svelte';
  import { waLink } from '$lib/whatsapp';
  import type { Category, SiteSettings } from '$lib/types';

  let { settings, categories }: { settings: SiteSettings; categories: Category[] } = $props();
  const year = new Date().getFullYear();
</script>

<footer class="footer">
  <div class="container cols">
    <div class="brand">
      <Logo src={settings.logo_url} light />
      <p>
        Artificial jewellery manufacturer and wholesale supplier based in Mumbai, India — serving retailers, distributors,
        boutiques and resellers in India and internationally.
      </p>
      <div class="social">
        {#if settings.instagram_url}
          <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
            ><Icon name="instagram" /></a
          >
        {/if}
        {#if settings.facebook_url}
          <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
            ><Icon name="facebook" /></a
          >
        {/if}
        <a href={waLink(settings.whatsapp_number, settings.whatsapp_message)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
          ><Icon name="whatsapp" /></a
        >
      </div>
    </div>

    <div>
      <h4>Explore</h4>
      <ul>
        <li><a href="/about">About Us</a></li>
        <li><a href="/collections">Collections</a></li>
        <li><a href="/categories">Jewellery Categories</a></li>
        <li><a href="/wholesale-enquiry">Wholesale Enquiry</a></li>
        <li><a href="/contact">Contact Us</a></li>
        <li><a href="/register">Register as Wholesale Buyer</a></li>
      </ul>
    </div>

    <div>
      <h4>Categories</h4>
      <ul>
        {#each categories.slice(0, 9) as c}
          <li><a href={`/categories/${c.slug}`}>{c.name}</a></li>
        {/each}
      </ul>
    </div>

    <div>
      <h4>Contact</h4>
      <ul class="contact">
        <li><Icon name="pin" size={18} /><span>{settings.address}</span></li>
        <li>
          <Icon name="whatsapp" size={18} /><a href={waLink(settings.whatsapp_number, settings.whatsapp_message)} target="_blank" rel="noopener noreferrer"
            >{settings.contact_phone}</a
          >
        </li>
        {#if settings.contact_email}
          <li><Icon name="mail" size={18} /><a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></li>
        {/if}
        {#if settings.business_hours}
          <li><Icon name="clock" size={18} /><span>{settings.business_hours}</span></li>
        {/if}
      </ul>
    </div>
  </div>
  <div class="bottom">
    <div class="container bottom-inner">
      <span>© {year} Mehfeez Jewels. All rights reserved.</span>
      <span><a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Service</a> · Wholesale only</span>
    </div>
  </div>
</footer>

<style>
  .footer {
    background: var(--charcoal);
    color: var(--ivory-70);
    padding-top: clamp(48px, 7vw, 80px);
    font-size: 0.93rem;
  }
  .cols {
    display: grid;
    gap: 28px 20px;
    grid-template-columns: 1fr 1fr;
  }
  .brand,
  .cols > div:last-child {
    grid-column: 1 / -1;
  }
  @media (min-width: 1024px) {
    .brand,
    .cols > div:last-child {
      grid-column: auto;
    }
  }
  @media (min-width: 1024px) {
    .cols {
      grid-template-columns: 1.4fr 0.8fr 1fr 1.3fr;
    }
  }
  .brand p {
    margin-top: 16px;
    max-width: 360px;
  }
  h4 {
    color: var(--white);
    font-family: var(--font-body);
    font-size: 0.78rem;
    letter-spacing: 0.22em;
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
    border-radius: 50%;
  }
  .social a:hover {
    background: var(--burgundy);
    border-color: var(--burgundy);
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
    gap: 8px 24px;
    justify-content: space-between;
  }
  @media (min-width: 760px) {
    .bottom {
      padding-bottom: 24px;
    }
  }
</style>
