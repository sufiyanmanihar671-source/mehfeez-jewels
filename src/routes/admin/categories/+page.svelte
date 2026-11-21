<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/Seo.svelte';
  import { compressImages } from '$lib/compress';
  import type { Category } from '$lib/types';
  let { data, form } = $props();
  let editing = $state<Category | 'new' | null>(null);
  const cur = $derived(editing && editing !== 'new' ? editing : null);
</script>

<Seo title="Categories — Admin" noindex />

<div class="toolbar">
  <h1>Categories</h1>
  <button class="btn btn--sm" onclick={() => (editing = 'new')}>Add category</button>
</div>
{#if form?.message}<div class="alert alert--error">{form.message}</div>{/if}
{#if form?.saved}<div class="alert alert--success">Category saved.</div>{/if}
{#if form?.deleted}<div class="alert alert--success">Category deleted. Its products are now uncategorised.</div>{/if}

{#if editing}
  {#key editing}
    <form
      class="card editor"
      method="POST"
      action="?/save"
      enctype="multipart/form-data"
      use:enhance={() => async ({ result, update }) => {
        await update();
        if (result.type === 'success') editing = null;
      }}
    >
      <h2>{cur ? `Edit “${cur.name}”` : 'New category'}</h2>
      {#if cur}<input type="hidden" name="id" value={cur.id} />{/if}
      <div class="form-grid form-grid--2">
        <div class="field">
          <label for="c-name">Name *</label>
          <input id="c-name" name="name" required value={cur?.name ?? ''} />
          {#if form?.errors?.name}<span class="field-error">{form.errors.name}</span>{/if}
        </div>
        <div class="field">
          <label for="c-slug">URL slug</label>
          <input id="c-slug" name="slug" value={cur?.slug ?? ''} placeholder="auto from name" />
          {#if form?.errors?.slug}<span class="field-error">{form.errors.slug}</span>{/if}
        </div>
        <div class="field span-2">
          <label for="c-desc">Description</label>
          <textarea id="c-desc" name="description" rows="2">{cur?.description ?? ''}</textarea>
        </div>
        <div class="field">
          <label for="c-order">Sort order</label>
          <input id="c-order" name="sort_order" type="number" min="0" value={cur?.sort_order ?? data.all.length + 1} />
        </div>
        <div class="field">
          <label for="c-img">Image</label>
          <input id="c-img" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" use:compressImages />
          {#if cur?.image_url}<label class="checkbox"><input type="checkbox" name="remove_image" /> Remove current image</label>{/if}
        </div>
        <label class="checkbox"><input type="checkbox" name="is_active" checked={cur?.is_active ?? true} /> Visible on website</label>
      </div>
      <div class="row">
        <button class="btn" type="submit">Save</button>
        <button class="btn btn--outline" type="button" onclick={() => (editing = null)}>Cancel</button>
      </div>
    </form>
  {/key}
{/if}

<div class="table-wrap">
  <table>
    <thead><tr><th>Order</th><th>Name</th><th>Slug</th><th>Products</th><th>Visible</th><th>Actions</th></tr></thead>
    <tbody>
      {#each data.all as c, i (c.id)}
        <tr>
          <td class="ord">
            <form method="POST" action="?/move" use:enhance><input type="hidden" name="id" value={c.id} /><input type="hidden" name="dir" value="up" /><button disabled={i === 0} aria-label="Move up">▲</button></form>
            <form method="POST" action="?/move" use:enhance><input type="hidden" name="id" value={c.id} /><input type="hidden" name="dir" value="down" /><button disabled={i === data.all.length - 1} aria-label="Move down">▼</button></form>
          </td>
          <td><strong>{c.name}</strong></td>
          <td><a href={`/categories/${c.slug}`} target="_blank">/{c.slug}</a></td>
          <td>{data.productCounts[c.id] ?? 0}</td>
          <td>{c.is_active ? 'Yes' : 'Hidden'}</td>
          <td class="acts">
            <button class="btn btn--sm btn--outline" onclick={() => (editing = c)}>Edit</button>
            <form method="POST" action="?/delete" use:enhance={({ cancel }) => { if (!confirm(`Delete category “${c.name}”? Products will be kept but uncategorised.`)) cancel(); }}>
              <input type="hidden" name="id" value={c.id} />
              <button class="btn btn--sm btn--danger" type="submit">Delete</button>
            </form>
          </td>
        </tr>
      {:else}
        <tr><td colspan="6" class="muted">No categories yet.</td></tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .editor { margin-bottom: 22px; }
  .editor h2 { font-size: 1.4rem; }
  .row, .acts { display: flex; gap: 8px; flex-wrap: wrap; }
  .row { margin-top: 18px; }
  .ord { display: flex; gap: 4px; }
  .ord button { border: 1px solid var(--charcoal-15); background: var(--white); border-radius: var(--radius); cursor: pointer; padding: 2px 8px; color: var(--burgundy); }
  .ord button:disabled { opacity: 0.3; cursor: default; }
</style>
