<script lang="ts">
  import LegalPage from '$lib/components/LegalPage.svelte';
  import { waLink } from '$lib/whatsapp';
  let { data } = $props();
  const s = $derived(data.settings);
</script>

<LegalPage
  title="Shipping Policy"
  description="How shipping works for Mehfeez Jewels wholesale orders in India and internationally."
  updated="24 November 2026"
>
  <p>
    Mehfeez Jewels supplies artificial jewellery on a wholesale (B2B) basis. Because every bulk order is different, shipping
    is arranged individually with each buyer after the order is confirmed.
  </p>

  <h2>Where we ship</h2>
  <p>We supply buyers across India and work with international wholesale buyers. Ask our team about shipping to your country.</p>

  <h2>How shipping is arranged</h2>
  <ul>
    <li>Shipping method, packing and the courier or freight partner are agreed with you for each order.</li>
    <li>Shipping charges depend on order size, weight, destination and the chosen service, and are confirmed before dispatch.</li>
    <li>Dispatch timelines depend on stock availability and whether designs are made to order; we share the expected timeline when confirming your order.</li>
  </ul>

  <h2>International orders</h2>
  <p>
    For international orders, any customs duties, import taxes and clearance requirements in the destination country are
    discussed before dispatch. Please check your country's import rules for artificial jewellery.
  </p>

  <h2>Tracking and delivery issues</h2>
  <p>Once your order is dispatched we share the tracking details. If a parcel arrives damaged or incomplete, please contact us as soon as possible with photos so we can help.</p>

  <h2>Contact us</h2>
  <p>
    For shipping questions on a current or planned order, message us on
    <a href={waLink(s.whatsapp_number, 'Hello Mehfeez Jewels, I have a question about shipping for a wholesale order.')} target="_blank" rel="noopener noreferrer">WhatsApp ({s.contact_phone})</a>{#if s.contact_email}
      or email <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a>{/if}.
  </p>
</LegalPage>
