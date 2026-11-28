<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/Seo.svelte';
  import { compressImages } from '$lib/compress';
  import { waLink } from '$lib/whatsapp';
  let { data, form } = $props();
  const s = $derived(data.current);
  const v = $derived((form?.values as Record<string, any>) ?? s);
  const e = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<Seo title="Settings — Admin" noindex />

<h1>Website settings</h1>
{#if form?.message}<div class="alert alert--error">{form.message}</div>{/if}
{#if form?.saved}<div class="alert alert--success">Settings saved. Changes are live on the website.</div>{/if}

<div class="layout">
  <form class="card" method="POST" action="?/save" novalidate use:enhance={() => async ({ update }) => update({ reset: false })}>
    <h2>WhatsApp chat button</h2>
    <div class="form-grid">
      <div class="field">
        <label for="wa">Business WhatsApp number (with country code)</label>
        <input id="wa" name="whatsapp_number" type="tel" value={v.whatsapp_number} aria-invalid={!!e.whatsapp_number} />
        {#if e.whatsapp_number}<span class="field-error">{e.whatsapp_number}</span>{/if}
      </div>
      <div class="field">
        <label for="wam">Pre-filled enquiry message</label>
        <textarea id="wam" name="whatsapp_message" rows="3" aria-invalid={!!e.whatsapp_message}>{v.whatsapp_message}</textarea>
        {#if e.whatsapp_message}<span class="field-error">{e.whatsapp_message}</span>{/if}
        <a class="hint" href={waLink(s.whatsapp_number, s.whatsapp_message)} target="_blank" rel="noopener noreferrer">Test current link ↗</a>
      </div>
    </div>

    <h2>Video call request button</h2>
    <div class="form-grid">
      <label class="checkbox"><input type="checkbox" name="video_call_enabled" checked={!!v.video_call_enabled} /> Show “Schedule a Video Call” button</label>
      <div class="field">
        <label for="vc">WhatsApp number for video call requests</label>
        <input id="vc" name="video_call_number" type="tel" value={v.video_call_number} aria-invalid={!!e.video_call_number} />
        {#if e.video_call_number}<span class="field-error">{e.video_call_number}</span>{/if}
      </div>
      <div class="field">
        <label for="vcm">Pre-filled video call request message</label>
        <textarea id="vcm" name="video_call_message" rows="3" aria-invalid={!!e.video_call_message}>{v.video_call_message}</textarea>
        {#if e.video_call_message}<span class="field-error">{e.video_call_message}</span>{/if}
      </div>
    </div>

    <h2>Contact information</h2>
    <div class="form-grid form-grid--2">
      <div class="field">
        <label for="cp">Display phone</label>
        <input id="cp" name="contact_phone" value={v.contact_phone} aria-invalid={!!e.contact_phone} />
        {#if e.contact_phone}<span class="field-error">{e.contact_phone}</span>{/if}
      </div>
      <div class="field">
        <label for="ce">Email (optional)</label>
        <input id="ce" name="contact_email" type="email" value={v.contact_email ?? ''} aria-invalid={!!e.contact_email} />
        {#if e.contact_email}<span class="field-error">{e.contact_email}</span>{/if}
      </div>
      <div class="field span-2">
        <label for="addr">Address</label>
        <textarea id="addr" name="address" rows="2" aria-invalid={!!e.address}>{v.address}</textarea>
        {#if e.address}<span class="field-error">{e.address}</span>{/if}
      </div>
      <div class="field span-2">
        <label for="bh">Business hours (optional)</label>
        <input id="bh" name="business_hours" value={v.business_hours ?? ''} placeholder="Mon–Sat, 10:00–19:00 IST" />
      </div>
      <div class="field">
        <label for="ig">Instagram URL</label>
        <input id="ig" name="instagram_url" value={v.instagram_url ?? ''} placeholder="https://instagram.com/…" aria-invalid={!!e.instagram_url} />
        {#if e.instagram_url}<span class="field-error">{e.instagram_url}</span>{/if}
      </div>
      <div class="field">
        <label for="fb">Facebook URL</label>
        <input id="fb" name="facebook_url" value={v.facebook_url ?? ''} placeholder="https://facebook.com/…" aria-invalid={!!e.facebook_url} />
        {#if e.facebook_url}<span class="field-error">{e.facebook_url}</span>{/if}
      </div>
    </div>

    <h2>Homepage text</h2>
    <p class="muted small">The heading shown on the homepage over the bridal photo (when no homepage slides are added).</p>
    <div class="form-grid">
      <div class="field">
        <label for="ht">Heading</label>
        <input id="ht" name="hero_title" value={v.hero_title} aria-invalid={!!e.hero_title} />
        {#if e.hero_title}<span class="field-error">{e.hero_title}</span>{/if}
      </div>
      <div class="field">
        <label for="hs">Line under the heading</label>
        <textarea id="hs" name="hero_subtitle" rows="3" aria-invalid={!!e.hero_subtitle}>{v.hero_subtitle}</textarea>
        {#if e.hero_subtitle}<span class="field-error">{e.hero_subtitle}</span>{/if}
      </div>
    </div>
    <div class="savebar"><button class="btn" type="submit">Save settings</button></div>
  </form>

  <div class="side">
    <section class="card tip">
      <h2>Homepage photos</h2>
      <p class="muted small">To change the big photo on the homepage, add slides in <a href="/admin/hero">Homepage Slides</a>. Until then the bridal photo is shown.</p>
    </section>
    {#each [{ field: 'logo_url', title: 'Logo (optional)', hint: 'Leave empty to use the official Mehfeez Jewels logo. PNG, SVG or WebP with transparent background.', accept: 'image/png,image/svg+xml,image/webp,image/jpeg' }] as img}
      {@const current = (s as Record<string, any>)[img.field] as string | null}
      <section class="card">
        <h2>{img.title}</h2>
        {#if current}<img class="preview" src={current} alt={img.title} />{:else}<p class="muted">Not uploaded yet.</p>{/if}
        <form method="POST" action="?/image" enctype="multipart/form-data" use:enhance>
          <input type="hidden" name="field" value={img.field} />
          <div class="field">
            <label for={img.field}>Upload</label>
            {#if img.field === 'logo_url'}
              <input id={img.field} name="file" type="file" accept={img.accept} required />
            {:else}
              <input id={img.field} name="file" type="file" accept={img.accept} required use:compressImages={1800} />
            {/if}
            <span class="hint">{img.hint} Max 5 MB.</span>
          </div>
          <button class="btn btn--sm" type="submit" style="margin-top: 10px">Upload</button>
        </form>
        {#if current}
          <form method="POST" action="?/image" use:enhance style="margin-top: 8px">
            <input type="hidden" name="field" value={img.field} /><input type="hidden" name="remove" value="1" />
            <button class="btn btn--sm btn--outline" type="submit">Remove</button>
          </form>
        {/if}
      </section>
    {/each}
  </div>
</div>

<style>
  .layout { display: grid; gap: 20px; }
  .small { font-size: 0.88rem; }
  .savebar { display: flex; justify-content: flex-end; margin-top: 24px; }
  @media (max-width: 959px) {
    .savebar { position: sticky; bottom: calc(64px + env(safe-area-inset-bottom)); z-index: 5; margin: 24px -16px -16px; padding: 10px 16px; background: var(--white); border-top: 1px solid var(--burgundy-15); }
    .savebar .btn { flex: 1; }
  }
  @media (min-width: 1200px) { .layout { grid-template-columns: 1.4fr 1fr; align-items: start; } }
  .side { display: grid; gap: 20px; }
  h2 { font-size: 1.35rem; margin: 26px 0 14px; padding-bottom: 6px; border-bottom: 1px solid var(--charcoal-08); }
  form > h2:first-child, section > h2:first-child { margin-top: 0; }
  .preview { max-height: 140px; width: auto; background: var(--ivory); padding: 10px; border: 1px solid var(--charcoal-08); border-radius: var(--radius); margin-bottom: 12px; }
</style>
