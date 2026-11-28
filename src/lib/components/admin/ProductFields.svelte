<script lang="ts">
  import { STOCK_LABELS, slugify } from '$lib/format';
  import type { Price, Product } from '$lib/types';

  /**
   * Product form, grouped the way the website shows a product:
   * basics → wholesale price → what buyers see on the product page → stock → labels,
   * with rarely used fields folded into "More options".
   * Field names are unchanged (see productSchema in $lib/server/validation).
   */
  let {
    product = null,
    price = null,
    categories,
    values = null,
    errors = {}
  }: {
    product?: Partial<Product> | null;
    price?: Price | null;
    categories: { id: string; name: string }[];
    values?: Record<string, any> | null;
    errors?: Record<string, string>;
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
  // Open "More options" automatically if one of its fields has an error.
  const moreHasError = $derived(['slug', 'sort_order', 'meta_title', 'meta_description', 'collections'].some((k) => !!errors[k]));
</script>

<section class="sec">
  <h3><span>1</span> Basic details</h3>
  <div class="form-grid form-grid--2">
    <div class="field span-2">
      <label for="p-name">Product name *</label>
      <input id="p-name" name="name" required bind:value={name} oninput={() => { if (!slugTouched) slug = slugify(name); }} aria-invalid={!!errors.name} placeholder="e.g. Kundan Bridal Necklace Set" />
      {#if errors.name}<span class="field-error">{errors.name}</span>{/if}
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

<section class="sec">
  <h3><span>2</span> Wholesale price <small>only approved buyers see it</small></h3>
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
  <h3><span>3</span> Shown on the product page</h3>
  <div class="form-grid form-grid--2">
    <div class="field">
      <label for="p-colors">Colours</label>
      <input id="p-colors" name="colors" value={list(v.colors)} placeholder="Ruby, Emerald, White, Pink" aria-invalid={!!errors.colors} />
      <span class="hint">Separate with commas — buyers tap one.</span>
      {#if errors.colors}<span class="field-error">{errors.colors}</span>{/if}
    </div>
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
    <div class="field">
      <label for="p-video">Product video link (optional)</label>
      <input id="p-video" name="video_url" type="url" value={v.video_url ?? ''} placeholder="https://… YouTube or Instagram reel" aria-invalid={!!errors.video_url} />
      {#if errors.video_url}<span class="field-error">{errors.video_url}</span>{/if}
    </div>
  </div>
  <p class="hint note">Photos are added after saving (on the product’s edit screen). “Min. order ₹1,000” is shown on every product automatically.</p>
</section>

<section class="sec">
  <h3><span>4</span> Stock</h3>
  <div class="form-grid form-grid--3">
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
    <div class="field">
      <label for="p-moq">MOQ (pieces / sets) *</label>
      <input id="p-moq" name="moq" type="number" inputmode="numeric" min="1" required value={v.moq ?? 1} aria-invalid={!!errors.moq} />
      {#if errors.moq}<span class="field-error">{errors.moq}</span>{/if}
    </div>
  </div>
</section>

<section class="sec">
  <h3><span>5</span> Show on website</h3>
  <div class="toggles">
    <label class="tg"><input type="checkbox" name="is_published" checked={flag('is_published', true)} /><span><b>Published</b><small>Visible in the catalogue. Untick to keep it as a draft.</small></span></label>
    <label class="tg"><input type="checkbox" name="is_new_arrival" checked={flag('is_new_arrival')} /><span><b>New arrival</b><small>Shown in “Latest Designs” on the homepage with a “New” tag.</small></span></label>
    <label class="tg"><input type="checkbox" name="is_bestseller" checked={flag('is_bestseller')} /><span><b>Bestseller</b><small>Adds a “Bestseller” tag on the photo.</small></span></label>
  </div>
</section>

<details class="sec more" open={moreHasError}>
  <summary>More options (optional)</summary>
  <p class="hint">Saved with the product for your records. These are not shown on the website at the moment.</p>
  <div class="form-grid form-grid--2">
    <div class="field">
      <label for="p-finish">Plating / finish</label>
      <input id="p-finish" name="finish" value={v.finish ?? ''} placeholder="Rhodium / Matte / Antique" />
    </div>
    <div class="field">
      <label for="p-stone">Stones</label>
      <input id="p-stone" name="stone" value={v.stone ?? ''} placeholder="American Diamond (CZ), Kundan, Pearls" />
    </div>
    <div class="field">
      <label for="p-weight">Approx. weight</label>
      <input id="p-weight" name="weight" value={v.weight ?? ''} placeholder="85 g per set" />
    </div>
    <div class="field">
      <label for="p-dim">Size / dimensions</label>
      <input id="p-dim" name="dimensions" value={v.dimensions ?? ''} placeholder="Necklace length 16 in" />
    </div>
    <div class="field span-2">
      <label for="p-set">Set includes</label>
      <input id="p-set" name="set_includes" value={v.set_includes ?? ''} placeholder="1 Necklace, 2 Earrings, 1 Maang Tikka" />
    </div>
    <div class="field">
      <label for="p-slug">Web address (URL)</label>
      <input id="p-slug" name="slug" bind:value={slug} oninput={() => (slugTouched = true)} aria-invalid={!!errors.slug} />
      <span class="hint">/products/{slug || '…'} — filled automatically from the name.</span>
      {#if errors.slug}<span class="field-error">{errors.slug}</span>{/if}
    </div>
    <div class="field">
      <label for="p-sort">Sort order</label>
      <input id="p-sort" name="sort_order" type="number" inputmode="numeric" min="0" value={v.sort_order ?? 0} />
      <span class="hint">Lower numbers show first.</span>
    </div>
    <div class="field span-2">
      <span class="lbl">Collections &amp; featured</span>
      <div class="flags">
        <label class="checkbox"><input type="checkbox" name="is_featured" checked={flag('is_featured')} /> Featured</label>
        {#each [['trending', 'Trending'], ['premium', 'Premium'], ['exclusive', 'Exclusive'], ['traditional', 'Traditional']] as [k, label]}
          <label class="checkbox"><input type="checkbox" name="collections" value={k} checked={(v.collections ?? []).includes(k)} /> {label}</label>
        {/each}
      </div>
    </div>
    <div class="field">
      <label for="p-mt">Google title (max 70)</label>
      <input id="p-mt" name="meta_title" maxlength="70" value={v.meta_title ?? ''} />
    </div>
    <div class="field">
      <label for="p-md">Google description (max 170)</label>
      <textarea id="p-md" name="meta_description" maxlength="170" rows="2">{v.meta_description ?? ''}</textarea>
    </div>
  </div>
</details>

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
  .form-grid--3 {
    display: grid;
    gap: 14px;
  }
  @media (min-width: 700px) {
    .form-grid--3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
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
  .more {
    border-bottom: 0;
  }
  .more summary {
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--burgundy);
    padding: 4px 0;
  }
  .more[open] summary {
    margin-bottom: 8px;
  }
  .lbl {
    display: block;
    margin-bottom: 6px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .flags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 20px;
  }
</style>
