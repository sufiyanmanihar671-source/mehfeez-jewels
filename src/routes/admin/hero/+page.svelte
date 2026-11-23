<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/Seo.svelte';
  import { compressImages } from '$lib/compress';
  let { data, form } = $props();
  let busy = $state(false);
  const v = $derived((form?.values ?? {}) as Record<string, any>);
  const e = $derived((form?.errors ?? {}) as Record<string, string>);
  const reload = () => {
    busy = true;
    return async ({ update }: { update: (o?: { reset?: boolean }) => Promise<void> }) => {
      await update();
      busy = false;
    };
  };
</script>

<Seo title="Homepage slides — Admin" noindex />

<h1>Homepage slides</h1>
<p class="muted">
  Large banner images at the top of the homepage. Use wide, high-quality jewellery photos (landscape, at least 1600px wide).
  Optionally add a separate portrait photo for phones. Without any slides, the homepage shows your latest product photos.
</p>

{#if data.missingTable}
  <div class="alert alert--error">
    The slides table is not set up yet. Run <strong>supabase/setup/2026-11-24-redesign.sql</strong> in Supabase → SQL Editor, then
    refresh this page.
  </div>
{/if}
{#if form?.message}<div class="alert alert--error">{form.message}</div>{/if}
{#if form?.saved}<div class="alert alert--success">Slide saved. It is live on the homepage.</div>{/if}
{#if form?.deleted}<div class="alert alert--success">Slide deleted.</div>{/if}

<section class="card add">
  <h2>Add a slide</h2>
  <form method="POST" action="?/create" enctype="multipart/form-data" novalidate use:enhance={reload}>
    <div class="form-grid form-grid--2">
      <div class="field">
        <label for="n-img">Slide image (desktop) *</label>
        <input id="n-img" name="image" type="file" accept="image/jpeg,image/png,image/webp" required use:compressImages={2000} />
      </div>
      <div class="field">
        <label for="n-mimg">Phone image (optional, portrait)</label>
        <input id="n-mimg" name="mobile_image" type="file" accept="image/jpeg,image/png,image/webp" use:compressImages={1200} />
      </div>
      <div class="field">
        <label for="n-eb">Small label</label>
        <input id="n-eb" name="eyebrow" value={v.eyebrow ?? 'Mehfeez Jewels'} />
      </div>
      <div class="field">
        <label for="n-title">Heading *</label>
        <input id="n-title" name="title" value={v.title ?? 'Premium Artificial Jewellery Manufacturer & Wholesale Supplier'} aria-invalid={!!e.title} />
        {#if e.title}<span class="field-error">{e.title}</span>{/if}
      </div>
      <div class="field span-2">
        <label for="n-sub">Supporting text</label>
        <textarea id="n-sub" name="subtitle" rows="2">{v.subtitle ?? 'Discover elegant artificial jewellery collections, exceptional craftsmanship and competitive wholesale pricing for your business.'}</textarea>
      </div>
      <div class="field">
        <label for="n-cta">Button text</label>
        <input id="n-cta" name="cta_label" value={v.cta_label ?? 'Explore Collections'} />
      </div>
      <div class="field">
        <label for="n-href">Button link</label>
        <input id="n-href" name="cta_href" value={v.cta_href ?? '/collections'} placeholder="/categories/bridal-jewellery" aria-invalid={!!e.cta_href} />
        {#if e.cta_href}<span class="field-error">{e.cta_href}</span>{/if}
      </div>
      <div class="field">
        <label for="n-order">Order</label>
        <input id="n-order" name="sort_order" type="number" min="0" value={v.sort_order ?? data.slides.length + 1} />
      </div>
      <label class="checkbox"><input type="checkbox" name="is_active" checked /> Show on homepage</label>
    </div>
    <button class="btn" type="submit" disabled={busy || data.missingTable} style="margin-top: 18px">{busy ? 'Uploading…' : 'Add slide'}</button>
  </form>
</section>

<div class="list">
  {#each data.slides as s (s.id)}
    <form class="card slide" method="POST" action="?/update" enctype="multipart/form-data" use:enhance={reload}>
      <input type="hidden" name="id" value={s.id} />
      <div class="thumbs">
        <img src={s.image_url} alt="" width="320" height="200" />
        {#if s.mobile_image_url}<img class="m" src={s.mobile_image_url} alt="" width="90" height="120" />{/if}
      </div>
      <div class="form-grid form-grid--2">
        <div class="field"><label for={`t-${s.id}`}>Heading</label><input id={`t-${s.id}`} name="title" value={s.title} /></div>
        <div class="field"><label for={`e-${s.id}`}>Small label</label><input id={`e-${s.id}`} name="eyebrow" value={s.eyebrow ?? ''} /></div>
        <div class="field span-2"><label for={`s-${s.id}`}>Supporting text</label><textarea id={`s-${s.id}`} name="subtitle" rows="2">{s.subtitle ?? ''}</textarea></div>
        <div class="field"><label for={`c-${s.id}`}>Button text</label><input id={`c-${s.id}`} name="cta_label" value={s.cta_label ?? ''} /></div>
        <div class="field"><label for={`h-${s.id}`}>Button link</label><input id={`h-${s.id}`} name="cta_href" value={s.cta_href ?? ''} /></div>
        <div class="field"><label for={`o-${s.id}`}>Order</label><input id={`o-${s.id}`} name="sort_order" type="number" min="0" value={s.sort_order} /></div>
        <label class="checkbox"><input type="checkbox" name="is_active" checked={s.is_active} /> Show on homepage</label>
        <div class="field"><label for={`i-${s.id}`}>Replace desktop image</label><input id={`i-${s.id}`} name="image" type="file" accept="image/jpeg,image/png,image/webp" use:compressImages={2000} /></div>
        <div class="field">
          <label for={`mi-${s.id}`}>Replace phone image</label>
          <input id={`mi-${s.id}`} name="mobile_image" type="file" accept="image/jpeg,image/png,image/webp" use:compressImages={1200} />
          {#if s.mobile_image_url}<label class="checkbox"><input type="checkbox" name="remove_mobile" /> Remove phone image</label>{/if}
        </div>
      </div>
      <div class="row">
        <button class="btn btn--sm" type="submit" disabled={busy}>Save</button>
        <button
          class="btn btn--sm btn--danger"
          type="submit"
          formaction="?/delete"
          onclick={(ev) => {
            if (!confirm('Delete this slide?')) ev.preventDefault();
          }}>Delete</button
        >
      </div>
    </form>
  {:else}
    {#if !data.missingTable}<p class="muted">No slides yet. Add your first slide above.</p>{/if}
  {/each}
</div>

<style>
  h2 {
    font-size: 1.4rem;
  }
  .add {
    margin: 20px 0 28px;
  }
  .list {
    display: grid;
    gap: 18px;
  }
  .thumbs {
    display: flex;
    gap: 10px;
    align-items: flex-end;
    margin-bottom: 16px;
  }
  .thumbs img {
    height: 120px;
    width: auto;
    object-fit: cover;
    border: 1px solid var(--charcoal-08);
  }
  .row {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }
</style>
