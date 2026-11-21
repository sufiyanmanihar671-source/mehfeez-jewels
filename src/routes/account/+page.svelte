<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  import Seo from '$lib/components/Seo.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import BusinessFields from '$lib/components/BusinessFields.svelte';
  import { formatDate } from '$lib/format';
  import { waLink } from '$lib/whatsapp';

  let { data, form } = $props();
  const p = $derived(data.profile!);
  let editing = $state(false);
  let busy = $state(false);

  const statusInfo = {
    pending: { title: 'Pending approval', text: 'Thank you for registering. Our team is reviewing your business details. Wholesale prices will become visible as soon as your account is approved.' },
    approved: { title: 'Approved', text: 'Your wholesale account is active. You can view wholesale prices across the catalogue.' },
    rejected: { title: 'Not approved', text: 'We were unable to approve this account for wholesale pricing. Please contact us on WhatsApp if you believe this is a mistake or to share more details.' }
  } as const;
  const info = $derived(statusInfo[p.status]);
  const ENQ: Record<string, string> = { new: 'Received', in_progress: 'In progress', responded: 'Responded', closed: 'Closed' };
</script>

<Seo title="My Account" noindex />

<section class="page-hero">
  <div class="container">
    <span class="eyebrow">Customer dashboard</span>
    <h1>Welcome, {p.full_name || 'wholesale partner'}</h1>
    <p>{p.company_name}</p>
  </div>
</section>

<section class="section">
  <div class="container dash">
    {#if page.url.searchParams.get('verified')}<div class="alert alert--success span">Your email address has been verified.</div>{/if}
    {#if page.url.searchParams.get('password')}<div class="alert alert--success span">Your password has been updated.</div>{/if}

    <div class="card status status--{p.status}">
      <span class="label">Registration status</span>
      <h2>{info.title}</h2>
      <p>{info.text}</p>
      {#if p.role === 'admin'}<a class="btn btn--sm" href="/admin">Open admin dashboard</a>{/if}
      {#if p.status === 'approved'}
        <a class="btn btn--sm" href="/collections">Browse with wholesale prices</a>
      {:else}
        <a class="btn btn--sm btn--outline" href={waLink(data.settings.whatsapp_number, `Hello Mehfeez Jewels, I registered as ${p.company_name} (${p.email}). Could you please review my wholesale account?`)} target="_blank" rel="noopener noreferrer"
          ><Icon name="whatsapp" size={16} /> Contact us on WhatsApp</a
        >
      {/if}
      {#if !data.emailConfirmed}<p class="muted small">Your email address is not verified yet — please use the link we emailed you.</p>{/if}
    </div>

    <div class="card">
      <div class="head">
        <h2>Business information</h2>
        {#if !editing}<button class="btn btn--sm btn--outline" type="button" onclick={() => (editing = true)}>Edit</button>{/if}
      </div>
      {#if form?.saved && !editing}<div class="alert alert--success">Your business details were saved.</div>{/if}
      {#if editing || form?.errors || form?.message}
        {#if form?.message}<div class="alert alert--error">{form.message}</div>{/if}
        <form
          method="POST"
          action="?/update"
          novalidate
          use:enhance={() => {
            busy = true;
            return async ({ result, update }) => {
              await update({ reset: false });
              busy = false;
              if (result.type === 'success') editing = false;
            };
          }}
        >
          <BusinessFields values={(form?.values as Record<string, string>) ?? p} errors={form?.errors ?? {}} />
          <div class="row">
            <button class="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
            <button class="btn btn--outline" type="button" onclick={() => (editing = false)}>Cancel</button>
          </div>
        </form>
      {:else}
        <dl class="details">
          <div><dt>Full name</dt><dd>{p.full_name}</dd></div>
          <div><dt>Company</dt><dd>{p.company_name}</dd></div>
          <div><dt>Email</dt><dd>{p.email}</dd></div>
          <div><dt>WhatsApp</dt><dd>{p.whatsapp}</dd></div>
          <div><dt>Business type</dt><dd>{p.business_type}</dd></div>
          <div><dt>Location</dt><dd>{p.city}, {p.country}</dd></div>
          <div><dt>Address</dt><dd>{p.address}</dd></div>
          <div><dt>GST number</dt><dd>{p.gst_number ?? '—'}</dd></div>
          <div><dt>Website / Instagram</dt><dd>{p.website ?? '—'}</dd></div>
          <div><dt>Registered</dt><dd>{formatDate(p.created_at)}</dd></div>
        </dl>
      {/if}
    </div>

    <div class="card">
      <h2>My enquiries</h2>
      {#if data.enquiries.length}
        <ul class="enq">
          {#each data.enquiries as e (e.id)}
            <li>
              <div>
                <strong>{(e.product as any)?.name ?? 'General wholesale enquiry'}</strong>
                <span class="muted small">{formatDate(e.created_at)}</span>
              </div>
              <span class="badge">{ENQ[e.status]}</span>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="muted">You have not sent any enquiries yet. <a href="/wholesale-enquiry">Send a wholesale enquiry</a></p>
      {/if}
    </div>

    <div class="card links">
      <h2>Account</h2>
      <a href="/forgot-password">Change password</a>
      <form method="POST" action="/logout"><button class="btn btn--sm btn--outline" type="submit">Logout</button></form>
    </div>
  </div>
</section>

<style>
  .dash {
    display: grid;
    gap: 22px;
  }
  @media (min-width: 1000px) {
    .dash {
      grid-template-columns: 1fr 1.6fr;
      align-items: start;
    }
    .span {
      grid-column: span 2;
    }
  }
  .status {
    border-top: 4px solid var(--burgundy);
  }
  .status--pending {
    border-top-color: var(--charcoal-50);
  }
  .status--rejected {
    border-top-color: var(--charcoal);
  }
  .status h2 {
    margin: 6px 0 10px;
  }
  .status p {
    color: var(--charcoal-70);
  }
  .status .btn {
    margin: 4px 8px 4px 0;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .head h2 {
    margin: 0;
  }
  .details {
    margin: 0;
    display: grid;
  }
  .details div {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--charcoal-08);
  }
  dt {
    color: var(--charcoal-50);
    font-size: 0.85rem;
  }
  dd {
    margin: 0;
    word-break: break-word;
  }
  .row {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    flex-wrap: wrap;
  }
  .enq {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .enq li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--charcoal-08);
  }
  .enq li div {
    display: flex;
    flex-direction: column;
  }
  .small {
    font-size: 0.82rem;
  }
  .links {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  @media (max-width: 520px) {
    .details div {
      grid-template-columns: 1fr;
      gap: 2px;
    }
  }
</style>
