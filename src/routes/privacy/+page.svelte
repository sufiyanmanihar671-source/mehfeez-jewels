<script lang="ts">
  import LegalPage from '$lib/components/LegalPage.svelte';
  let { data } = $props();
  const s = $derived(data.settings);

  // Itemised notice: what we collect and why (DPDP Act 2023, s.5).
  const items = [
    {
      data: 'Name, business / company name, email, WhatsApp number, country, city, business address, business type, GST number (optional), website or Instagram (optional), additional business information',
      purpose: 'Create your wholesale account, verify that you are a business buyer, approve the account, show wholesale prices, and contact you about your account and orders',
      basis: 'Your consent (given when you register)'
    },
    {
      data: 'Account status (pending / approved / rejected) and internal notes our team adds while reviewing your account',
      purpose: 'Decide and record whether your business account is approved for wholesale prices',
      basis: 'Your consent (part of the registration you asked for)'
    },
    {
      data: 'Password',
      purpose: 'Secure login. Stored only in encrypted (hashed) form by our authentication provider; we cannot see it',
      basis: 'Your consent'
    },
    {
      data: 'Name, email and profile picture shared by Google (only if you use “Continue with Google”)',
      purpose: 'Sign you in without a separate password',
      basis: 'Your consent'
    },
    {
      data: 'Enquiry details: name, business name, email, WhatsApp number, country, categories, estimated quantity, message, design you asked about',
      purpose: 'Reply to your wholesale enquiry and discuss pricing, MOQ and availability',
      basis: 'Your consent / data you voluntarily provide for this purpose'
    },
    {
      data: 'Login session cookies and a one-way (hashed) form of your IP address',
      purpose: 'Keep you signed in, keep the site secure and prevent spam and misuse',
      basis: 'Legitimate use for security, and to comply with law'
    }
  ];
</script>

<LegalPage
  title="Privacy Policy"
  description="How Mehfeez Jewels handles personal data under India's Digital Personal Data Protection Act, 2023: what we collect, why, your rights and how to contact our Grievance Officer."
  updated="28 November 2026"
>
  <p>
    This Privacy Policy is our notice under the <strong>Digital Personal Data Protection Act, 2023</strong> (“DPDP Act”) and the
    Digital Personal Data Protection Rules, 2025. It explains how <strong>Mehfeez Jewels</strong> (“we”, “us”), an artificial
    jewellery manufacturer and wholesaler based in Mumbai, India, processes your personal data when you use
    <strong>mehfeezjewels.com</strong>. Under the DPDP Act we are the <strong>Data Fiduciary</strong> and you are the
    <strong>Data Principal</strong>.
  </p>
  <p>
    The website is a wholesale (B2B) catalogue for businesses. We do not sell to retail consumers and we do not take online
    payments; orders are discussed on WhatsApp, phone or email.
  </p>

  <h2>1. Personal data we collect and why</h2>
  <p>We collect only the data needed for the purposes below. We do not ask for more than we need.</p>
  <div class="tablewrap">
    <table>
      <thead><tr><th>Personal data</th><th>Purpose</th><th>Basis</th></tr></thead>
      <tbody>
        {#each items as i}
          <tr><td>{i.data}</td><td>{i.purpose}</td><td>{i.basis}</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p>
    <strong>What we do not do:</strong> we do not sell or rent your personal data, we do not use it for third-party
    advertising, and we do not use advertising or tracking cookies or analytics that profile you.
  </p>
  <p>
    <strong>Enquiry Cart:</strong> designs you add to the Enquiry Cart are saved only in your own browser (local storage) and are
    not sent to us until you choose to send the list on WhatsApp. You can clear it at any time from the cart page.
  </p>

  <h2>2. Consent and how to withdraw it</h2>
  <ul>
    <li>We ask for your consent when you register, sign in with Google or send an enquiry. Your consent is for the specific purposes listed above only.</li>
    <li>
      You can <strong>withdraw your consent at any time</strong>, as easily as you gave it, by writing to our Grievance Officer
      (section 10) from your registered email or WhatsApp number.
    </li>
    <li>
      After withdrawal we will stop processing your data and erase it (unless the law requires us to keep it), and ask our
      service providers to do the same. Processing done before withdrawal remains lawful. Withdrawing consent means we can no
      longer keep your wholesale account or show you wholesale prices.
    </li>
  </ul>

  <h2>3. Your rights as a Data Principal</h2>
  <ul>
    <li><strong>Right to information:</strong> ask for a summary of the personal data we hold about you, how we process it, and the service providers we have shared it with.</li>
    <li><strong>Right to correction and erasure:</strong> ask us to correct, complete or update your data, or to erase data no longer needed. You can also edit most business details yourself from your account page.</li>
    <li><strong>Right to grievance redressal:</strong> raise a complaint with our Grievance Officer about how we handle your data.</li>
    <li><strong>Right to nominate:</strong> nominate another person to exercise your rights if you die or become unable to do so.</li>
  </ul>
  <p>
    To use any of these rights, contact our Grievance Officer (section 10). We may ask you to confirm your identity before acting
    on a request, and we will respond within the time required under the DPDP Rules.
  </p>
  <p>
    If you are not satisfied with our response, you can complain to the <strong>Data Protection Board of India</strong> after
    first using our grievance redressal process, as provided in the DPDP Act.
  </p>

  <h2>4. Who we share data with</h2>
  <p>We use the following service providers (Data Processors), who process data only on our instructions and for these purposes:</p>
  <ul>
    <li><strong>Supabase</strong> — database, user accounts, login and image storage.</li>
    <li><strong>Cloudflare</strong> — website hosting, security and domain services.</li>
    <li><strong>Resend</strong> — sending account emails such as email verification and password reset.</li>
    <li><strong>Google</strong> — optional “Continue with Google” sign-in, and the map on our Contact page (loaded from Google Maps when you open that page).</li>
    <li><strong>WhatsApp (Meta)</strong> — only when you choose to contact us on WhatsApp; your chat is then also subject to WhatsApp’s own privacy policy.</li>
  </ul>
  <p>We may also disclose data where required by law or by a lawful order of a court or government authority.</p>

  <h2>5. Transfer outside India</h2>
  <p>
    Some of our service providers may store or process data on servers outside India. Such transfers are made only as
    permitted under the DPDP Act and will not be made to any country the Government of India restricts.
  </p>

  <h2>6. How long we keep your data</h2>
  <ul>
    <li><strong>Account data:</strong> while your wholesale account is active, and erased when you ask us to delete it or withdraw consent, or once it is no longer needed for the purpose it was collected for.</li>
    <li><strong>Enquiries:</strong> for as long as needed to respond to and follow up on your enquiry and our business relationship with you.</li>
    <li><strong>Security records:</strong> session data and hashed IP records are kept only as long as needed for security and to meet legal requirements.</li>
  </ul>
  <p>Where Indian law (for example tax or accounting rules) requires us to keep certain records for longer, we keep only what is required, for the required period.</p>

  <h2>7. How we protect your data</h2>
  <ul>
    <li>Encrypted (HTTPS) connections for the whole website.</li>
    <li>Database-level access controls: customers can only see their own account; wholesale prices are visible only to approved buyers.</li>
    <li>Only authorised staff can access the admin panel; passwords are stored in hashed form and IP addresses only in one-way hashed form.</li>
  </ul>
  <p>
    If a personal data breach happens, we will take steps to contain it and will inform the Data Protection Board of India and
    the affected users, as required under the DPDP Act and Rules.
  </p>

  <h2>8. Children</h2>
  <p>
    This website is meant for businesses only and is not intended for anyone under 18 years of age. We do not knowingly collect
    personal data of children. If you believe a child has given us personal data, contact us and we will erase it.
  </p>

  <h2>9. Cookies</h2>
  <p>
    We use only essential cookies: to keep you signed in and to protect sign-in and forms from misuse. These are needed for the
    website to work. We do not use advertising, tracking or analytics cookies.
  </p>

  <h2>10. Grievance Officer and contact</h2>
  <p>For questions, requests to use your rights, withdrawal of consent or complaints, contact:</p>
  <p class="contact">
    <strong>Grievance Officer, Mehfeez Jewels</strong><br />
    {s.address}<br />
    WhatsApp / Phone: {s.contact_phone}{#if s.contact_email}<br />Email: <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a>{/if}
  </p>

  <h2>11. Your duties</h2>
  <p>
    Under the DPDP Act you must provide accurate, genuine information, must not impersonate another person, and must not file
    false or frivolous complaints.
  </p>

  <h2>12. Language and changes</h2>
  <p>
    On request, we will provide this notice in any language listed in the Eighth Schedule to the Constitution of India. We may
    update this policy from time to time; the “Last updated” date above shows the latest version, and we will inform
    registered users of important changes.
  </p>
</LegalPage>

<style>
  .tablewrap {
    overflow-x: auto;
    margin: 10px 0 16px;
  }
  table {
    width: 100%;
    min-width: 560px;
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  th,
  td {
    text-align: left;
    vertical-align: top;
    padding: 10px 12px;
    border: 1px solid var(--burgundy-15);
  }
  th {
    background: var(--cream);
    color: var(--burgundy);
    font-size: 0.74rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .contact {
    padding: 14px 16px;
    background: var(--ivory);
    border-left: 3px solid var(--burgundy);
  }
</style>
