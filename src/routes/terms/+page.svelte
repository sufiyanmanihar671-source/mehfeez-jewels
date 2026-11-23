<script lang="ts">
  import LegalPage from '$lib/components/LegalPage.svelte';
  let { data } = $props();
  const s = $derived(data.settings);
</script>

<LegalPage
  title="Terms of Service"
  description="Terms for using the Mehfeez Jewels wholesale catalogue website, mehfeezjewels.com."
  updated="23 November 2026"
>
  <p>
    These Terms of Service apply to your use of <strong>mehfeezjewels.com</strong>, operated by Mehfeez Jewels, an artificial
    jewellery manufacturer and wholesaler based in Mumbai, India. By using the website you agree to these terms.
  </p>

  <h2>Wholesale (B2B) use only</h2>
  <p>
    This website is a catalogue for business buyers such as retailers, distributors, resellers and boutiques. It is not a
    retail shop. No orders or payments are placed on the website; orders, quantities, prices and delivery are agreed
    directly with our team, usually on WhatsApp.
  </p>

  <h2>Wholesale accounts</h2>
  <ul>
    <li>You must provide accurate business information when registering and keep it up to date.</li>
    <li>
      Wholesale prices are visible only to accounts that we have approved. We may approve, reject or suspend any account at
      our discretion.
    </li>
    <li>You are responsible for keeping your login details secure and for activity under your account.</li>
  </ul>

  <h2>Prices and product information</h2>
  <ul>
    <li>
      Wholesale prices are confidential and shown for your business use only. Please do not share or publish them.
    </li>
    <li>
      Prices, minimum order quantities, stock availability and designs may change without notice. The website is not an
      offer to sell; a sale is confirmed only when agreed with our team.
    </li>
    <li>
      We try to show products accurately, but colours and finishes may look slightly different from photos.
    </li>
  </ul>

  <h2>Acceptable use</h2>
  <p>
    You agree not to misuse the website, including attempting to access other accounts or restricted data, sending spam,
    or copying product photos and content for your own use without our written permission.
  </p>

  <h2>Intellectual property</h2>
  <p>
    Designs, photos, text and branding on this website belong to Mehfeez Jewels. Approved customers may use product
    photos to sell our products only if we agree to it in writing.
  </p>

  <h2>Liability</h2>
  <p>
    The website is provided “as is”. To the extent permitted by law, we are not liable for indirect losses arising from use
    of the website. Nothing in these terms limits any rights you have under applicable law.
  </p>

  <h2>Governing law</h2>
  <p>These terms are governed by the laws of India, and courts in Mumbai, Maharashtra have jurisdiction.</p>

  <h2>Changes</h2>
  <p>We may update these terms from time to time. The “Last updated” date above shows when they were last changed.</p>

  <h2>Contact us</h2>
  <p>
    Mehfeez Jewels<br />
    {s.address}<br />
    WhatsApp / Phone: {s.contact_phone}{#if s.contact_email}<br />Email: <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a>{/if}
  </p>
  <p>See also our <a href="/privacy">Privacy Policy</a>.</p>
</LegalPage>
