<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/Seo.svelte';
  import BusinessFields from '$lib/components/BusinessFields.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { formatDate } from '$lib/format';
  import { waLink } from '$lib/whatsapp';
  let { data, form } = $props();
  const c = $derived(data.customer);
  let editing = $state(false);
</script>

<Seo title={`${c.company_name} — Customer`} noindex />

<p><a href="/admin/customers">← All customers</a></p>
<h1>{c.company_name || c.full_name}</h1>
{#if form?.message}<div class="alert alert--error">{form.message}</div>{/if}
{#if form?.saved}<div class="alert alert--success">Saved.</div>{/if}

<div class="grid2">
  <section class="card">
    <h2>Approval</h2>
    {#if !c.company_name || !c.whatsapp || !c.country || !c.address}
      <div class="alert">This customer has not completed their business profile yet (e.g. signed up with Google). Review carefully before approving.</div>
    {/if}
    <p>Current status: <span class="badge" class:badge--solid={c.status === 'approved'} class:badge--dark={c.status === 'rejected'}>{c.status}</span>
      {#if c.status_changed_at}<span class="muted"> since {formatDate(c.status_changed_at)}</span>{/if}</p>
    <form method="POST" action="?/status" use:enhance>
      <div class="field">
        <label for="status">Set status</label>
        <select id="status" name="status">
          <option value="pending" selected={c.status === 'pending'}>Pending</option>
          <option value="approved" selected={c.status === 'approved'}>Approved — can see wholesale prices</option>
          <option value="rejected" selected={c.status === 'rejected'}>Rejected</option>
        </select>
      </div>
      <div class="field" style="margin-top: 12px">
        <label for="admin_note">Internal note (never shown to the customer)</label>
        <textarea id="admin_note" name="admin_note" rows="3">{c.admin_note ?? ''}</textarea>
      </div>
      <button class="btn" type="submit" style="margin-top: 14px">Save status</button>
    </form>
    <hr />
    <div class="contact">
      <a class="btn btn--outline btn--sm" href={waLink(c.whatsapp, `Hello ${c.full_name}, this is Mehfeez Jewels regarding your wholesale account.`)} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={16} /> WhatsApp</a>
      <a class="btn btn--outline btn--sm" href={`mailto:${c.email}`}><Icon name="mail" size={16} /> Email</a>
    </div>
  </section>

  <section class="card">
    <div class="toolbar"><h2>Business details</h2>{#if !editing}<button class="btn btn--sm btn--outline" onclick={() => (editing = true)}>Edit</button>{/if}</div>
    {#if editing || form?.errors}
      <form method="POST" action="?/details" novalidate use:enhance={() => async ({ result, update }) => { await update({ reset: false }); if (result.type === 'success') editing = false; }}>
        <BusinessFields values={(form?.values as Record<string, string>) ?? c} errors={form?.errors ?? {}} />
        <div class="row"><button class="btn" type="submit">Save</button><button class="btn btn--outline" type="button" onclick={() => (editing = false)}>Cancel</button></div>
      </form>
    {:else}
      <dl class="details">
        <div><dt>Name</dt><dd>{c.full_name}</dd></div>
        <div><dt>Email</dt><dd>{c.email}</dd></div>
        <div><dt>WhatsApp</dt><dd>{c.whatsapp}</dd></div>
        <div><dt>Business type</dt><dd>{c.business_type}</dd></div>
        <div><dt>Country / City</dt><dd>{c.country} / {c.city}</dd></div>
        <div><dt>Address</dt><dd>{c.address}</dd></div>
        <div><dt>GST</dt><dd>{c.gst_number ?? '—'}</dd></div>
        <div><dt>Website / Instagram</dt><dd>{c.website ?? '—'}</dd></div>
        <div><dt>Additional info</dt><dd>{c.additional_info ?? '—'}</dd></div>
        <div><dt>Registered</dt><dd>{formatDate(c.created_at)}</dd></div>
      </dl>
    {/if}
  </section>

  <section class="card">
    <h2>Enquiries from this customer</h2>
    {#if data.enquiries.length}
      <ul class="list">{#each data.enquiries as e (e.id)}<li><a href={`/admin/enquiries/${e.id}`}>{formatDate(e.created_at)} — {e.message.slice(0, 80)}</a> <span class="badge">{e.status}</span></li>{/each}</ul>
    {:else}<p class="muted">None yet.</p>{/if}
  </section>

  <section class="card">
    <h2>Remove customer</h2>
    <p class="muted">Deletes this business profile and removes all price access. This cannot be undone.</p>
    <form method="POST" action="?/delete" use:enhance={({ cancel }) => { if (!confirm('Delete this customer profile permanently?')) cancel(); }}>
      <button class="btn btn--danger btn--sm" type="submit">Delete customer</button>
    </form>
  </section>
</div>

<style>
  .grid2 { display: grid; gap: 20px; }
  @media (min-width: 1100px) { .grid2 { grid-template-columns: 1fr 1.4fr; align-items: start; } }
  h2 { font-size: 1.4rem; margin: 0 0 12px; }
  hr { border: 0; border-top: 1px solid var(--charcoal-08); margin: 20px 0; }
  .contact, .row { display: flex; gap: 8px; flex-wrap: wrap; }
  .row { margin-top: 16px; }
  .details { margin: 0; }
  .details div { display: grid; grid-template-columns: 150px 1fr; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--charcoal-08); }
  dt { color: var(--charcoal-50); font-size: 0.85rem; }
  dd { margin: 0; word-break: break-word; white-space: pre-line; }
  .list { list-style: none; padding: 0; margin: 0; }
  .list li { padding: 8px 0; border-bottom: 1px solid var(--charcoal-08); font-size: 0.92rem; }
</style>
