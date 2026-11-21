<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/Seo.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { formatDate } from '$lib/format';
  import { waLink } from '$lib/whatsapp';
  let { data, form } = $props();
  const e = $derived(data.enquiry);
  const reply = $derived(
    `Hello ${e.full_name}, thank you for your wholesale enquiry to Mehfeez Jewels${e.product ? ` about ${e.product.name} (SKU ${e.product.sku})` : ''}. `
  );
</script>

<Seo title={`Enquiry from ${e.business_name}`} noindex />

<p><a href="/admin/enquiries">← All enquiries</a></p>
<h1>{e.business_name}</h1>
<p class="muted">Received {formatDate(e.created_at)}</p>
{#if form?.message}<div class="alert alert--error">{form.message}</div>{/if}
{#if form?.saved}<div class="alert alert--success">Enquiry updated.</div>{/if}

<div class="grid2">
  <section class="card">
    <h2>Enquiry</h2>
    <dl class="details">
      <div><dt>Name</dt><dd>{e.full_name}</dd></div>
      <div><dt>Business</dt><dd>{e.business_name}</dd></div>
      <div><dt>Email</dt><dd><a href={`mailto:${e.email}`}>{e.email}</a></dd></div>
      <div><dt>WhatsApp</dt><dd>{e.whatsapp}</dd></div>
      <div><dt>Country</dt><dd>{e.country}</dd></div>
      {#if e.product}<div><dt>Product</dt><dd><a href={`/products/${e.product.slug}`} target="_blank">{e.product.name} ({e.product.sku})</a></dd></div>{/if}
      <div><dt>Categories</dt><dd>{e.categories?.join(', ') || '—'}</dd></div>
      <div><dt>Quantity</dt><dd>{e.estimated_quantity ?? '—'}</dd></div>
      <div><dt>Registered customer</dt><dd>{e.user_id ? 'Yes' : 'No (guest)'}</dd></div>
    </dl>
    <h3 style="margin-top: 20px">Message</h3>
    <p class="msg">{e.message}</p>
  </section>

  <section class="card">
    <h2>Respond</h2>
    <div class="row">
      <a class="btn" href={waLink(e.whatsapp, reply)} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={18} /> Reply on WhatsApp</a>
      <a class="btn btn--outline" href={`mailto:${e.email}?subject=${encodeURIComponent('Your wholesale enquiry — Mehfeez Jewels')}&body=${encodeURIComponent(reply)}`}><Icon name="mail" size={18} /> Reply by email</a>
    </div>
    <form method="POST" action="?/update" use:enhance={() => async ({ update }) => update({ reset: false })}>
      <div class="field" style="margin-top: 20px">
        <label for="status">Status</label>
        <select id="status" name="status">
          <option value="new" selected={e.status === 'new'}>New</option>
          <option value="in_progress" selected={e.status === 'in_progress'}>In progress</option>
          <option value="responded" selected={e.status === 'responded'}>Responded</option>
          <option value="closed" selected={e.status === 'closed'}>Closed</option>
        </select>
      </div>
      <div class="field" style="margin-top: 12px">
        <label for="notes">Internal notes</label>
        <textarea id="notes" name="admin_notes" rows="5">{e.admin_notes ?? ''}</textarea>
      </div>
      <button class="btn" type="submit" style="margin-top: 14px">Save</button>
    </form>
    <hr />
    <form method="POST" action="?/delete" use:enhance={({ cancel }) => { if (!confirm('Delete this enquiry permanently?')) cancel(); }}>
      <button class="btn btn--sm btn--danger" type="submit">Delete enquiry</button>
    </form>
  </section>
</div>

<style>
  .grid2 { display: grid; gap: 20px; }
  @media (min-width: 1100px) { .grid2 { grid-template-columns: 1.2fr 1fr; align-items: start; } }
  h2 { font-size: 1.4rem; margin: 0 0 12px; }
  .details { margin: 0; }
  .details div { display: grid; grid-template-columns: 160px 1fr; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--charcoal-08); }
  dt { color: var(--charcoal-50); font-size: 0.85rem; }
  dd { margin: 0; word-break: break-word; }
  .msg { white-space: pre-line; background: var(--ivory); padding: 14px; border-radius: var(--radius); }
  .row { display: flex; gap: 8px; flex-wrap: wrap; }
  hr { border: 0; border-top: 1px solid var(--charcoal-08); margin: 22px 0; }
</style>
