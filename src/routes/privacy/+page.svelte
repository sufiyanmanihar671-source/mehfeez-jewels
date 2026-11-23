<script lang="ts">
  import LegalPage from '$lib/components/LegalPage.svelte';
  let { data } = $props();
  const s = $derived(data.settings);
</script>

<LegalPage
  title="Privacy Policy"
  description="How Mehfeez Jewels collects, uses and protects the information of wholesale buyers who use mehfeezjewels.com."
  updated="23 November 2026"
>
  <p>
    This Privacy Policy explains how Mehfeez Jewels (“we”, “us”), an artificial jewellery manufacturer and wholesaler based in
    Mumbai, India, handles information when you use <strong>mehfeezjewels.com</strong>. The website is a wholesale (B2B)
    catalogue; we do not sell to retail consumers or take online payments.
  </p>

  <h2>Information we collect</h2>
  <ul>
    <li>
      <strong>Wholesale account details</strong> you provide when registering: full name, business/company name, email
      address, WhatsApp number, country, city, business address, business type, GST number (optional), website or
      Instagram (optional) and any additional business information.
    </li>
    <li>
      <strong>Sign in with Google:</strong> if you choose “Continue with Google”, Google shares your name, email address and
      profile picture with us. We do not receive your Google password or access to your Google account data beyond this.
    </li>
    <li><strong>Enquiries</strong> you send us: your contact details, interested categories, estimated quantity and message.</li>
    <li>
      <strong>Technical information</strong> needed to run the website securely, such as login session cookies and a one-way
      (hashed) form of your IP address used only to prevent spam.
    </li>
  </ul>

  <h2>How we use your information</h2>
  <ul>
    <li>To create and manage your wholesale account and review it for approval.</li>
    <li>To show wholesale prices to approved business customers.</li>
    <li>To respond to your enquiries and discuss orders, including on WhatsApp, phone or email.</li>
    <li>To keep the website secure and prevent spam and misuse.</li>
  </ul>
  <p>We do not sell or rent your personal information, and we do not use it for third-party advertising.</p>

  <h2>Cookies</h2>
  <p>
    We use only essential cookies that keep you signed in and protect forms. We do not use advertising or tracking cookies.
  </p>

  <h2>Service providers</h2>
  <p>We use trusted providers to operate the website, who process data on our behalf:</p>
  <ul>
    <li><strong>Supabase</strong> — database, user accounts and image storage.</li>
    <li><strong>Cloudflare</strong> — website hosting, security and domain services.</li>
    <li><strong>Google</strong> — optional “Continue with Google” sign-in.</li>
    <li><strong>WhatsApp (Meta)</strong> — only when you choose to contact us on WhatsApp.</li>
  </ul>
  <p>These providers may store data on servers outside India.</p>

  <h2>Data retention</h2>
  <p>
    We keep your account and enquiry information for as long as your account is active or as needed for our business
    relationship and legal obligations. You can ask us to delete your account at any time.
  </p>

  <h2>Your choices and rights</h2>
  <ul>
    <li>You can view and update your business details from your account dashboard.</li>
    <li>You can ask us for a copy of your data, or to correct or delete it, by contacting us below.</li>
    <li>If you signed in with Google, you can also remove our access from your Google Account settings.</li>
  </ul>

  <h2>Security</h2>
  <p>
    Access to account data and wholesale prices is restricted at the database level, and the website uses encrypted (HTTPS)
    connections. No method of transmission or storage is completely secure, but we take reasonable measures to protect your
    information.
  </p>

  <h2>Changes to this policy</h2>
  <p>We may update this policy from time to time. The “Last updated” date above shows when it was last changed.</p>

  <h2>Contact us</h2>
  <p>
    Mehfeez Jewels<br />
    {s.address}<br />
    WhatsApp / Phone: {s.contact_phone}{#if s.contact_email}<br />Email: <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a>{/if}
  </p>
</LegalPage>
