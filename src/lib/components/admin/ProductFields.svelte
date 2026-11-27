<script lang="ts">
  import { STOCK_LABELS, slugify } from '$lib/format';
  import type { Price, Product } from '$lib/types';

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
</script>

<div class="form-grid form-grid--2">
  <div class="field">
    <label for="p-name">Product name *</label>
    <input id="p-name" name="name" required bind:value={name} oninput={() => { if (!slugTouched) slug = slugify(name); }} aria-invalid={!!errors.name} />
    {#if errors.name}<span class="field-error">{errors.name}</span>{/if}
  </div>
  <div class="field">
    <label for="p-sku">SKU *</label>
    <input id="p-sku" name="sku" required value={v.sku ?? ''} aria-invalid={!!errors.sku} style="text-transform: uppercase" />
    {#if errors.sku}<span class="field-error">{errors.sku}</span>{/if}
  </div>
  <div class="field">
    <label for="p-slug">URL slug</label>
    <input id="p-slug" name="slug" bind:value={slug} oninput={() => (slugTouched = true)} aria-invalid={!!errors.slug} />
    <span class="hint">/products/{slug || '…'}</span>
    {#if errors.slug}<span class="field-error">{errors.slug}</span>{/if}
  </div>
  <div class="field">
    <label for="p-cat">Category</label>
    <select id="p-cat" name="category_id">
      <option value="">— Uncategorised —</option>
      {#each categories as c}<option value={c.id} selected={v.category_id === c.id}>{c.name}</option>{/each}
    </select>
  </div>
  <div class="field span-2">
    <label for="p-desc">Description</label>
    <textarea id="p-desc" name="description" rows="5">{v.description ?? ''}</textarea>
  </div>

  <fieldset class="span-2 box">
    <legend>Wholesale price (visible only to approved customers)</legend>
    <div class="form-grid form-grid--2">
      <div class="field">
        <label for="p-price">Base wholesale price</label>
        <input id="p-price" name="price" type="number" step="0.01" min="0" value={v.price ?? ''} placeholder="Leave empty for “price on request”" aria-invalid={!!errors.price} />
        {#if errors.price}<span class="field-error">{errors.price}</span>{/if}
      </div>
      <div class="field">
        <label for="p-cur">Currency</label>
        <input id="p-cur" name="currency" maxlength="3" value={v.currency ?? 'INR'} style="text-transform: uppercase" aria-invalid={!!errors.currency} />
        {#if errors.currency}<span class="field-error">{errors.currency}</span>{/if}
      </div>
      <div class="field span-2">
        <label for="p-note">Price note</label>
        <input id="p-note" name="price_note" value={v.price_note ?? ''} placeholder="e.g. per set, excluding GST and shipping" />
      </div>
    </div>
  </fieldset>

  <div class="field">
    <label for="p-moq">Minimum order quantity (MOQ) *</label>
    <input id="p-moq" name="moq" type="number" min="1" required value={v.moq ?? 1} aria-invalid={!!errors.moq} />
    {#if errors.moq}<span class="field-error">{errors.moq}</span>{/if}
  </div>
  <div class="field">
    <label for="p-stock">Stock availability</label>
    <select id="p-stock" name="stock_status">
      {#each Object.entries(STOCK_LABELS) as [k, label]}<option value={k} selected={(v.stock_status ?? 'in_stock') === k}>{label}</option>{/each}
    </select>
  </div>
  <div class="field">
    <label for="p-qty">Stock quantity (optional)</label>
    <input id="p-qty" name="stock_quantity" type="number" min="0" value={v.stock_quantity ?? ''} aria-invalid={!!errors.stock_quantity} />
    {#if errors.stock_quantity}<span class="field-error">{errors.stock_quantity}</span>{/if}
  </div>
  <div class="field">
    <label for="p-sort">Sort order</label>
    <input id="p-sort" name="sort_order" type="number" min="0" value={v.sort_order ?? 0} />
  </div>

  <div class="span-2 flags">
    <label class="checkbox"><input type="checkbox" name="is_published" checked={flag('is_published', true)} /> Published (visible in catalogue)</label>
    <label class="checkbox"><input type="checkbox" name="is_featured" checked={flag('is_featured')} /> Featured collection</label>
    <label class="checkbox"><input type="checkbox" name="is_new_arrival" checked={flag('is_new_arrival')} /> New arrival</label>
    <label class="checkbox"><input type="checkbox" name="is_bestseller" checked={flag('is_bestseller')} /> Bestseller</label>
  </div>
  <fieldset class="span-2 box">
    <legend>Product details (shown on the product page)</legend>
    <div class="form-grid form-grid--2">
      <div class="field">
        <label for="p-colors">Colours</label>
        <input id="p-colors" name="colors" value={list(v.colors)} placeholder="Ruby, Emerald, White, Pink" aria-invalid={!!errors.colors} />
        <span class="hint">Separate with commas. Buyers can pick one on the product page.</span>
        {#if errors.colors}<span class="field-error">{errors.colors}</span>{/if}
      </div>
      <div class="field">
        <label for="p-sizes">Sizes</label>
        <input id="p-sizes" name="sizes" value={list(v.sizes)} placeholder="2.4, 2.6, 2.8 or Free size" aria-invalid={!!errors.sizes} />
        <span class="hint">Separate with commas (e.g. bangle sizes).</span>
        {#if errors.sizes}<span class="field-error">{errors.sizes}</span>{/if}
      </div>
      <div class="field">
        <label for="p-material">Base material</label>
        <input id="p-material" name="material" value={v.material ?? ''} placeholder="Brass / Copper alloy" />
      </div>
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
      <div class="field span-2">
        <label for="p-set">Set includes</label>
        <input id="p-set" name="set_includes" value={v.set_includes ?? ''} placeholder="1 Necklace, 2 Earrings, 1 Maang Tikka" />
      </div>
      <div class="field">
        <label for="p-dim">Size / dimensions</label>
        <input id="p-dim" name="dimensions" value={v.dimensions ?? ''} placeholder="Necklace length 16 in, adjustable" />
      </div>
      <div class="field">
        <label for="p-video">Product video link</label>
        <input id="p-video" name="video_url" value={v.video_url ?? ''} placeholder="https://youtube.com/… or Instagram reel link" aria-invalid={!!errors.video_url} />
        {#if errors.video_url}<span class="field-error">{errors.video_url}</span>{/if}
      </div>
    </div>
  </fieldset>

  <fieldset class="span-2 box">
    <legend>Homepage collections</legend>
    <div class="flags">
      {#each [['trending', 'Trending Designs'], ['premium', 'Premium Collection'], ['exclusive', 'Exclusive Designs'], ['traditional', 'Traditional Collection']] as [k, label]}
        <label class="checkbox"><input type="checkbox" name="collections" value={k} checked={(v.collections ?? []).includes(k)} /> {label}</label>
      {/each}
    </div>
  </fieldset>

  <fieldset class="span-2 box">
    <legend>SEO (optional)</legend>
    <div class="form-grid">
      <div class="field">
        <label for="p-mt">Meta title (max 70)</label>
        <input id="p-mt" name="meta_title" maxlength="70" value={v.meta_title ?? ''} />
      </div>
      <div class="field">
        <label for="p-md">Meta description (max 170)</label>
        <textarea id="p-md" name="meta_description" maxlength="170" rows="2">{v.meta_description ?? ''}</textarea>
      </div>
    </div>
  </fieldset>
</div>

<style>
  .box {
    border: 1px solid var(--charcoal-15);
    border-radius: var(--radius-lg);
    padding: 16px 18px 20px;
    margin: 0;
    background: var(--ivory);
  }
  legend {
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--burgundy);
    padding: 0 6px;
  }
  .flags {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 24px;
  }
</style>
