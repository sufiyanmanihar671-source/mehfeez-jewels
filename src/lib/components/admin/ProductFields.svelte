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
