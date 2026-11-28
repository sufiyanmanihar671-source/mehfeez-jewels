<script lang="ts">
  import { STOCK_LABELS, slugify } from '$lib/format';
  import { compressImages } from '$lib/compress';
  import type { ColorStock, Price, Product, StockStatus } from '$lib/types';

  /**
   * Product form, grouped the way the website shows a product:
   * basics → wholesale price → what buyers see on the product page → stock → publish.
   * Kept deliberately short; fields not shown on the website are carried as hidden inputs.
   * Field names are unchanged (see productSchema in $lib/server/validation).
   */
  let {
    product = null,
    price = null,
    categories,
    values = null,
    errors = {},
    withPhotos = false
  }: {
    product?: Partial<Product> | null;
    price?: Price | null;
    categories: { id: string; name: string }[];
    values?: Record<string, any> | null;
    errors?: Record<string, string>;
    /** "Add product" page: pick photos in the same form (uploaded when saving). */
    withPhotos?: boolean;
  } = $props();

  const v = $derived(values ?? { ...(product ?? {}), price: price?.price ?? '', currency: price?.currency ?? 'INR', price_note: price?.price_note ?? '' });
  const list = (x: unknown) => (Array.isArray(x) ? x.join(', ') : typeof x === 'string' ? x : '');
  const flag = (k: string, def = false) => (values ? !!values[k] : ((product as Record<string, unknown> | null)?.[k] as boolean | undefined) ?? def);
  let name = $state('');
  let slug = $state('');
  let slugTouched = $state(false);
  $effect.pre(() => {
    name = v.name ?? '';
    slug = v.slug ?? '';
    slugTouched = !!v.slug;
  });

  // Colours with their own stock. Older products only have a colour list: start those
  // colours with the product's overall availability.
  type Row = { name: string; status: StockStatus; qty: string };
  let rows = $state<Row[]>([]);
  $effect.pre(() => {
    const cs = (v.color_stock ?? []) as ColorStock[];
    const legacy: string[] = Array.isArray(v.colors) ? v.colors : typeof v.colors === 'string' && v.colors ? v.colors.split(',') : [];
    rows = cs.length
      ? cs.map((c) => ({ name: c.name, status: c.status, qty: c.qty === null || c.qty === undefined ? '' : String(c.qty) }))
      : legacy.map((n) => ({ name: n.trim(), status: (v.stock_status ?? 'in_stock') as StockStatus, qty: '' })).filter((r) => r.name);
  });
  const addRow = () => (rows = [...rows, { name: '', status: 'in_stock', qty: '' }]);
  const removeRow = (i: number) => (rows = rows.filter((_, j) => j !== i));

  // Photo picker previews (Add product page)
  let previews = $state<string[]>([]);
  function showPreviews(e: Event) {
    previews.forEach((u) => URL.revokeObjectURL(u));
    const files = (e.currentTarget as HTMLInputElement).files;
    previews = files ? [...files].slice(0, 10).map((f) => URL.createObjectURL(f)) : [];
  }
</script>

<section class="sec">
  <h3><span>1</span> Basic details</h3>
  <div class="form-grid form-grid--2">
    <div class="field span-2">
      <label for="p-name">Product name *</label>
      <input id="p-name" name="name" required bind:value={name} oninput={() => { if (!slugTouched) slug = slugify(name); }} aria-invalid={!!errors.name} placeholder="e.g. Kundan Bridal Necklace Set" />
      {#if errors.name}<span class="field-error">{errors.name}</span>{/if}
      {#if errors.slug}<span class="field-error">This name is already used by another product — please change it slightly.</span>{/if}
    </div>
    <div class="field">
      <label for="p-sku">SKU / design code *</label>
      <input id="p-sku" name="sku" required value={v.sku ?? ''} aria-invalid={!!errors.sku} style="text-transform: uppercase" placeholder="MJ-BR-001" />
      {#if errors.sku}<span class="field-error">{errors.sku}</span>{/if}
    </div>
    <div class="field">
      <label for="p-cat">Category</label>
      <select id="p-cat" name="category_id">
        <option value="">— Choose category —</option>
        {#each categories as c}<option value={c.id} selected={v.category_id === c.id}>{c.name}</option>{/each}
      </select>
    </div>
    <div class="field span-2">
      <label for="p-desc">Description</label>
      <textarea id="p-desc" name="description" rows="4" placeholder="Short description buyers see on the product page">{v.description ?? ''}</textarea>
    </div>
  </div>
</section>

{#if withPhotos}
  <section class="sec">
    <h3><span>2</span> Photos</h3>
    <label class="picker">
      <input name="images" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onchange={showPreviews} use:compressImages />
      <span>Choose photos (gallery or camera)</span>
    </label>
    {#if previews.length}
      <div class="pv">{#each previews as src, i}<img {src} alt={`Photo ${i + 1}`} />{/each}</div>
      <p class="hint">First photo will be the cover. You can add or remove photos later too.</p>
    {:else}
      <p class="hint">Add 2–5 clear photos. JPG, PNG or WebP — they are optimised automatically.</p>
    {/if}
  </section>
{/if}

<section class="sec">
  <h3><span>{withPhotos ? 3 : 2}</span> Wholesale price <small>only approved buyers see it</small></h3>
  <div class="form-grid form-grid--2">
    <div class="field">
      <label for="p-price">Price per piece / set</label>
      <input id="p-price" name="price" type="number" inputmode="decimal" step="0.01" min="0" value={v.price ?? ''} placeholder="Empty = price on request" aria-invalid={!!errors.price} />
      {#if errors.price}<span class="field-error">{errors.price}</span>{/if}
    </div>
    <div class="field">
      <label for="p-cur">Currency</label>
      <input id="p-cur" name="currency" maxlength="3" value={v.currency ?? 'INR'} style="text-transform: uppercase" aria-invalid={!!errors.currency} />
      {#if errors.currency}<span class="field-error">{errors.currency}</span>{/if}
    </div>
    <div class="field span-2">
      <label for="p-note">Price note (optional)</label>
      <input id="p-note" name="price_note" value={v.price_note ?? ''} placeholder="e.g. per set, excluding GST and shipping" />
    </div>
  </div>
</section>

<section class="sec">
  <h3><span>{withPhotos ? 4 : 3}</span> Shown on the product page</h3>
  <div class="form-grid form-grid--2">
    <div class="field">
      <label for="p-sizes">Sizes</label>
      <input id="p-sizes" name="sizes" value={list(v.sizes)} placeholder="2.4, 2.6, 2.8 or Free size" aria-invalid={!!errors.sizes} />
      <span class="hint">Separate with commas (e.g. bangle sizes).</span>
      {#if errors.sizes}<span class="field-error">{errors.sizes}</span>{/if}
    </div>
    <div class="field">
      <label for="p-material">Material</label>
      <input id="p-material" name="material" value={v.material ?? ''} placeholder="Brass / Copper alloy" />
      <span class="hint">Shown as “Material: …” under the name.</span>
    </div>
    <div class="field span-2">
      <label for="p-video">Product video link (optional)</label>
      <input id="p-video" name="video_url" type="url" value={v.video_url ?? ''} placeholder="https://… YouTube or Instagram reel" aria-invalid={!!errors.video_url} />
      {#if errors.video_url}<span class="field-error">{errors.video_url}</span>{/if}
    </div>
  </div>
  <p class="hint note">“Mix designs · Min. ₹5,000” is shown on every product automatically.</p>
</section>

<section class="sec">
  <h3><span>{withPhotos ? 5 : 4}</span> Colours &amp; stock</h3>
  {#if rows.length}
    <div class="crow chead" aria-hidden="true"><span>Colour</span><span>Availability</span><span>Qty</span><span></span></div>
    {#each rows as r, i (i)}
      <div class="crow">
        <input name="cs_name" bind:value={r.name} placeholder="e.g. Ruby" aria-label={`Colour ${i + 1} name`} maxlength="40" />
        <select name="cs_status" bind:value={r.status} aria-label={`Colour ${i + 1} availability`}>
          {#each Object.entries(STOCK_LABELS) as [k, label]}<option value={k}>{label}</option>{/each}
        </select>
        <input name="cs_qty" type="number" inputmode="numeric" min="0" bind:value={r.qty} placeholder="—" aria-label={`Colour ${i + 1} quantity`} />
        <button type="button" class="rm" onclick={() => removeRow(i)} aria-label={`Remove colour ${r.name || i + 1}`}>✕</button>
      </div>
    {/each}
    <p class="hint">Overall stock is worked out from the colours. Buyers see the stock of the colour they choose.</p>
  {:else}
    <div class="form-grid form-grid--2">
      <div class="field">
        <label for="p-stock">Availability</label>
        <select id="p-stock" name="stock_status">
          {#each Object.entries(STOCK_LABELS) as [k, label]}<option value={k} selected={(v.stock_status ?? 'in_stock') === k}>{label}</option>{/each}
        </select>
      </div>
      <div class="field">
        <label for="p-qty">Quantity in stock (optional)</label>
        <input id="p-qty" name="stock_quantity" type="number" inputmode="numeric" min="0" value={v.stock_quantity ?? ''} aria-invalid={!!errors.stock_quantity} />
        {#if errors.stock_quantity}<span class="field-error">{errors.stock_quantity}</span>{/if}
      </div>
    </div>
  {/if}
  <button type="button" class="btn btn--sm btn--outline addc" onclick={addRow}>+ Add colour</button>
  {#if errors.color_stock}<span class="field-error">{errors.color_stock}</span>{/if}
  <div class="field moq">
    <label for="p-moq">MOQ (pieces / sets) *</label>
    <input id="p-moq" name="moq" type="number" inputmode="numeric" min="1" required value={v.moq ?? 1} aria-invalid={!!errors.moq} />
    {#if errors.moq}<span class="field-error">{errors.moq}</span>{/if}
  </div>
</section>

<section class="sec">
  <h3><span>{withPhotos ? 6 : 5}</span> Show on website</h3>
  <div class="toggles">
    <label class="tg"><input type="checkbox" name="is_published" checked={flag('is_published', true)} /><span><b>Published</b><small>Visible on the website. Newest designs appear first in “Latest Designs” on the homepage. Untick to keep it as a draft.</small></span></label>
  </div>
</section>

<!-- Not shown in the form (kept simple). Hidden inputs keep existing values when a product is saved. -->
<input type="hidden" name="slug" value={slug} />
<input type="hidden" name="sort_order" value={v.sort_order ?? 0} />
{#each ['finish', 'stone', 'weight', 'dimensions', 'set_includes', 'meta_title', 'meta_description'] as k}
  <input type="hidden" name={k} value={v[k] ?? ''} />
{/each}
{#each v.collections ?? [] as c}<input type="hidden" name="collections" value={c} />{/each}
{#each ['is_featured', 'is_new_arrival', 'is_bestseller'] as k}
  {#if flag(k)}<input type="hidden" name={k} value="on" />{/if}
{/each}

<style>
  .sec {
    padding: 16px 0 18px;
    border-bottom: 1px solid var(--charcoal-08);
  }
  .sec:first-of-type {
    padding-top: 0;
  }
  h3 {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0 0 12px;
    font-family: var(--font-body);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--burgundy);
  }
  h3 > span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--burgundy);
    color: var(--white);
    font-size: 0.7rem;
    letter-spacing: 0;
  }
  h3 small {
    font-weight: 500;
    letter-spacing: 0.02em;
    text-transform: none;
    color: var(--muted);
  }
  .note {
    margin: 10px 0 0;
  }
  .picker {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 64px;
    border: 1.5px dashed var(--burgundy-30);
    background: var(--ivory);
    color: var(--burgundy);
    font-weight: 600;
    cursor: pointer;
  }
  .picker input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
  .pv {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    overflow-x: auto;
  }
  .pv img {
    flex: none;
    width: 72px;
    height: 90px;
    object-fit: cover;
    border: 1px solid var(--burgundy-15);
  }
  .pv img:first-child {
    outline: 2px solid var(--burgundy);
    outline-offset: -2px;
  }
  .crow {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 1.2fr) 74px 36px;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
  }
  .crow input,
  .crow select {
    min-height: 44px;
    padding: 6px 10px;
    font-size: 0.92rem;
  }
  .chead {
    margin-bottom: 4px;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .rm {
    width: 36px;
    height: 36px;
    border: 1px solid var(--burgundy-15);
    background: var(--white);
    color: var(--burgundy);
    cursor: pointer;
  }
  .addc {
    margin-top: 6px;
  }
  .moq {
    margin-top: 14px;
    max-width: 260px;
  }
  .toggles {
    display: grid;
    gap: 8px;
  }
  .tg {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    background: var(--ivory);
    border: 1px solid var(--burgundy-15);
    cursor: pointer;
  }
  .tg input {
    width: 20px;
    height: 20px;
    margin-top: 2px;
    accent-color: var(--burgundy);
    flex: none;
  }
  .tg span {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .tg small {
    color: var(--muted);
    font-size: 0.8rem;
  }
</style>
