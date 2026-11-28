<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  import Seo from '$lib/components/Seo.svelte';
  import ProductFields from '$lib/components/admin/ProductFields.svelte';
  import { compressImages } from '$lib/compress';
  import { STOCK_LABELS } from '$lib/format';
  let { data, form } = $props();
  const p = $derived(data.product);
  const base = $derived(data.prices.find((x) => x.variant_id === null) ?? null);
  const vPrice = (id: string) => data.prices.find((x) => x.variant_id === id);
  let uploading = $state(false);
  let compressing = $state(false);
  const keep = () => async ({ update }: { update: (o?: { reset?: boolean }) => Promise<void> }) => update({ reset: false });
</script>

<Seo title={`${p.name} — Admin`} noindex />

<p class="crumbs"><a href="/admin/products">← All products</a><a href={`/products/${p.slug}`} target="_blank">View on website ↗</a></p>
<h1>{p.name}</h1>
{#if page.url.searchParams.get('created')}<div class="alert alert--success">Product created. Add images and variations below.</div>{/if}
{#if form?.message}<div class="alert alert--error">{form.message}</div>{/if}
{#if form?.saved}<div class="alert alert--success">Product details saved.</div>{/if}

<div class="layout">
  <form class="card" method="POST" action="?/save" novalidate use:enhance={keep}>
    <h2>Product details</h2>
    <ProductFields product={p} price={base} categories={data.allCategories} values={(form?.values as Record<string, unknown>) ?? null} errors={form?.errors ?? {}} />
    <div class="savebar">
      {#if form?.saved}<span class="ok">✓ Saved</span>{/if}
      <button class="btn" type="submit">Save product</button>
    </div>
  </form>

  <div class="side">
    <section class="card">
      <h2>Photos</h2>
      <p class="muted small">First photo is the cover. Add 2–5 clear photos on a plain background.</p>
      {#if form?.imageMessage}<div class="alert alert--error">{form.imageMessage}</div>{/if}
      {#if p.images?.length}
        <div class="imgs">
          {#each p.images as img, i (img.id)}
            <div class="img">
              <img src={img.url} alt={img.alt ?? ''} loading="lazy" width="120" height="150" />
              {#if i === 0}<span class="badge badge--solid cover">Cover</span>{/if}
              <div class="img-acts">
                {#if i > 0}
                  <form method="POST" action="?/coverImage" use:enhance><input type="hidden" name="image_id" value={img.id} /><button type="submit">Make cover</button></form>
                {/if}
                <form method="POST" action="?/deleteImage" use:enhance={({ cancel }) => { if (!confirm('Delete this image?')) cancel(); }}>
                  <input type="hidden" name="image_id" value={img.id} /><button type="submit">Delete</button>
                </form>
              </div>
            </div>
          {/each}
        </div>
      {:else}<p class="muted">No images yet.</p>{/if}
      <form
        method="POST"
        action="?/uploadImages"
        enctype="multipart/form-data"
        use:enhance={() => {
          uploading = true;
          return async ({ update }) => {
            await update();
            uploading = false;
          };
        }}
      >
        <div class="field">
          <label for="imgs">Add photos (from gallery or camera)</label>
          <input id="imgs" name="images" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" use:compressImages={{ onbusy: (b) => (compressing = b) }} />
          <span class="hint">JPG, PNG or WebP. Photos are optimised automatically before upload.</span>
        </div>
        <div class="field" style="margin-top: 10px">
          <label for="alt">Photo description (for Google)</label>
          <input id="alt" name="alt" value={p.name} />
        </div>
        <button class="btn btn--sm btn--block" type="submit" disabled={uploading || compressing} style="margin-top: 12px">
          {compressing ? 'Optimising…' : uploading ? 'Uploading…' : 'Upload photos'}
        </button>
      </form>
    </section>

    <section class="card">
      <h2>Variations</h2>
      <p class="muted small">Only for options with a <b>different price</b> (e.g. “With nath”). For simple colours or sizes use section 3 instead.</p>
      {#each p.variants ?? [] as v (v.id)}
        {@const vp = vPrice(v.id)}
        <form class="variant" method="POST" action="?/updateVariant" use:enhance={keep}>
          <input type="hidden" name="variant_id" value={v.id} />
          <input name="name" value={v.name} aria-label="Variant name" required />
          <input name="sku" value={v.sku ?? ''} placeholder="SKU" aria-label="Variant SKU" />
          <select name="stock_status" aria-label="Variant stock">
            {#each Object.entries(STOCK_LABELS) as [k, l]}<option value={k} selected={v.stock_status === k}>{l}</option>{/each}
          </select>
          <input name="price" type="number" step="0.01" min="0" value={vp?.price ?? ''} placeholder="Price" aria-label="Variant price" />
          <input name="currency" value={vp?.currency ?? base?.currency ?? 'INR'} maxlength="3" aria-label="Currency" class="cur" />
          <div class="vacts">
            <button class="btn btn--sm" type="submit">Save</button>
            <button class="btn btn--sm btn--outline" type="submit" formaction="?/deleteVariant">Delete</button>
          </div>
        </form>
      {/each}
      <form class="variant new" method="POST" action="?/addVariant" use:enhance>
        <input name="name" placeholder="New variant name" aria-label="New variant name" required value={(form?.variantValues as Record<string, string>)?.name ?? ''} />
        <input name="sku" placeholder="SKU (optional)" aria-label="New variant SKU" />
        <select name="stock_status" aria-label="New variant stock">
          {#each Object.entries(STOCK_LABELS) as [k, l]}<option value={k}>{l}</option>{/each}
        </select>
        <input name="price" type="number" step="0.01" min="0" placeholder="Price (optional)" aria-label="New variant price" />
        <input name="currency" value={base?.currency ?? 'INR'} maxlength="3" aria-label="Currency" class="cur" />
        <div class="vacts"><button class="btn btn--sm" type="submit">Add variation</button></div>
        {#if form?.variantErrors}<span class="field-error">{Object.values(form.variantErrors)[0]}</span>{/if}
      </form>
    </section>

    <section class="card">
      <h2>Delete product</h2>
      <p class="muted small">Removes the product, its images, variations and prices permanently.</p>
      <form method="POST" action="?/delete" use:enhance={({ cancel }) => { if (!confirm(`Delete “${p.name}” permanently?`)) cancel(); }}>
        <button class="btn btn--sm btn--danger" type="submit">Delete product</button>
      </form>
    </section>
  </div>
</div>

<style>
  .layout { display: grid; gap: 20px; }
  .crumbs { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-size: 0.9rem; }
  .savebar { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 18px; }
  .savebar .ok { color: #2f6b3a; font-weight: 600; font-size: 0.9rem; }
  @media (max-width: 959px) {
    .savebar { position: sticky; bottom: calc(64px + env(safe-area-inset-bottom)); z-index: 5; margin: 18px -16px -16px; padding: 10px 16px; background: var(--white); border-top: 1px solid var(--burgundy-15); box-shadow: 0 -8px 20px -14px rgba(0,0,0,0.35); }
    .savebar .btn { flex: 1; }
    .variant { grid-template-columns: 1fr 1fr; }
  }
  .img-acts button { min-height: 30px; }
  @media (min-width: 1200px) { .layout { grid-template-columns: 1.3fr 1fr; align-items: start; } }
  .side { display: grid; gap: 20px; }
  h2 { font-size: 1.4rem; margin: 0 0 14px; }
  .small { font-size: 0.85rem; }
  .imgs { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; margin-bottom: 18px; }
  .img { position: relative; border: 1px solid var(--charcoal-08); border-radius: var(--radius); overflow: hidden; background: var(--white); }
  .img img { width: 100%; aspect-ratio: 4/5; object-fit: cover; }
  .cover { position: absolute; top: 6px; left: 6px; }
  .img-acts { display: flex; justify-content: space-between; padding: 4px; }
  .img-acts button { background: none; border: 0; color: var(--burgundy); font: inherit; font-size: 0.75rem; cursor: pointer; padding: 2px 4px; }
  .variant { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 12px 0; border-bottom: 1px solid var(--charcoal-08); }
  .variant input, .variant select { min-height: 38px; padding: 6px 10px; font-size: 0.9rem; }
  .variant .cur { text-transform: uppercase; }
  .vacts { grid-column: span 2; display: flex; gap: 6px; }
  .new { border-bottom: 0; }
</style>
