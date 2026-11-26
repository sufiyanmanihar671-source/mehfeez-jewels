<script lang="ts">
  import LegalPage from '$lib/components/LegalPage.svelte';
  import { waLink } from '$lib/whatsapp';
  let { data } = $props();
  const s = $derived(data.settings);
</script>

<LegalPage
  title="Return Policy"
  description="How returns, exchanges and damage claims work for Mehfeez Jewels wholesale orders."
  updated="26 November 2026"
>
  <p>
    Mehfeez Jewels supplies artificial jewellery on a wholesale (B2B) basis. Designs, quantities and terms are confirmed with
    each buyer before dispatch, so returns and exchanges are handled case by case and agreed in writing with our team.
  </p>

  <h2>Damaged or incorrect items</h2>
  <ul>
    <li>Please check your parcel as soon as it arrives.</li>
    <li>If anything is damaged, missing or different from what was confirmed, contact us promptly with your order details and clear photos or an unboxing video.</li>
    <li>Once we have reviewed it, we will agree a resolution with you — such as a replacement, an exchange or an adjustment on a future order.</li>
  </ul>

  <h2>Other returns and exchanges</h2>
  <p>
    Because wholesale orders are prepared to each buyer's requirements, returns for reasons other than damage or an incorrect
    supply are not guaranteed. Any return or exchange must be agreed with our team before items are sent back.
  </p>

  <h2>Contact us</h2>
  <p>
    Message us on
    <a href={waLink(s.whatsapp_number, 'Hello Mehfeez Jewels, I have a question about a return or exchange for my wholesale order.')} target="_blank" rel="noopener noreferrer">WhatsApp ({s.contact_phone})</a>{#if s.contact_email}
      or email <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a>{/if}.
  </p>
  <p>See also our <a href="/shipping-policy">Shipping Policy</a> and <a href="/terms">Terms &amp; Conditions</a>.</p>
</LegalPage>
