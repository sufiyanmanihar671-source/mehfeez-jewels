<script lang="ts">
  import { enhance } from '$app/forms';
  import { COUNTRIES } from '$lib/countries';
  import type { Category } from '$lib/types';

  let {
    categories,
    form = null,
    action = '/wholesale-enquiry',
    productId = null,
    productLabel = null,
    defaults = {},
    compact = false
  }: {
    categories: Category[];
    form?: { success?: boolean; errors?: Record<string, string>; values?: Record<string, unknown>; message?: string } | null;
    action?: string;
    productId?: string | null;
    productLabel?: string | null;
    defaults?: Record<string, string>;
    compact?: boolean;
  } = $props();

  let submitting = $state(false);
  const v = $derived((form?.values ?? defaults) as Record<string, any>);
  const e = $derived(form?.errors ?? {});
  const chosen = $derived(new Set<string>((v.categories as string[]) ?? []));
</script>

{#if form?.success}
  <div class="alert alert--success" role="status">
    <strong>Thank you — your enquiry has been received.</strong><br />
    Our wholesale team will contact you on WhatsApp or email shortly.
  </div>
{:else}
  {#if form?.message}<div class="alert alert--error" role="alert">{form.message}</div>{/if}
  <form
    method="POST"
    {action}
    novalidate
    use:enhance={() => {
      submitting = true;
      return async ({ update }) => {
        await update({ reset: false });
        submitting = false;
      };
    }}
  >
    <div class="hp" aria-hidden="true">
      <label>Company website <input type="text" name="company_website_hp" tabindex="-1" autocomplete="off" /></label>
    </div>
    {#if productId}<input type="hidden" name="product_id" value={productId} />{/if}
    {#if productLabel}<p class="muted">Enquiry for: <strong>{productLabel}</strong></p>{/if}

    <div class="form-grid form-grid--2">
      <div class="field">
        <label for="eq-name">Full name <span class="req">*</span></label>
        <input id="eq-name" name="full_name" type="text" autocomplete="name" required value={v.full_name ?? ''} aria-invalid={!!e.full_name} />
        {#if e.full_name}<span class="field-error">{e.full_name}</span>{/if}
      </div>
      <div class="field">
        <label for="eq-biz">Business name <span class="req">*</span></label>
        <input id="eq-biz" name="business_name" type="text" autocomplete="organization" required value={v.business_name ?? ''} aria-invalid={!!e.business_name} />
        {#if e.business_name}<span class="field-error">{e.business_name}</span>{/if}
      </div>
      <div class="field">
        <label for="eq-email">Email <span class="req">*</span></label>
        <input id="eq-email" name="email" type="email" autocomplete="email" required value={v.email ?? ''} aria-invalid={!!e.email} />
        {#if e.email}<span class="field-error">{e.email}</span>{/if}
      </div>
      <div class="field">
        <label for="eq-wa">WhatsApp number <span class="req">*</span></label>
        <input id="eq-wa" name="whatsapp" type="tel" autocomplete="tel" placeholder="+971 50 123 4567" required value={v.whatsapp ?? ''} aria-invalid={!!e.whatsapp} />
        {#if e.whatsapp}<span class="field-error">{e.whatsapp}</span>{/if}
      </div>
      <div class="field">
        <label for="eq-country">Country <span class="req">*</span></label>
        <select id="eq-country" name="country" required aria-invalid={!!e.country}>
          <option value="">Select country</option>
          {#each COUNTRIES as c}<option value={c} selected={v.country === c}>{c}</option>{/each}
        </select>
        {#if e.country}<span class="field-error">{e.country}</span>{/if}
      </div>
      <div class="field">
        <label for="eq-qty">Estimated order quantity</label>
        <input id="eq-qty" name="estimated_quantity" type="text" placeholder="e.g. 200 sets / 500 pieces" value={v.estimated_quantity ?? ''} aria-invalid={!!e.estimated_quantity} />
        {#if e.estimated_quantity}<span class="field-error">{e.estimated_quantity}</span>{/if}
      </div>
      {#if !compact && categories.length}
        <fieldset class="field span-2">
          <legend class="label">Interested jewellery categories</legend>
          <div class="chip-group">
            {#each categories as c}
              <label><input type="checkbox" name="categories" value={c.name} checked={chosen.has(c.name)} /> {c.name}</label>
            {/each}
          </div>
        </fieldset>
      {/if}
      <div class="field span-2">
        <label for="eq-msg">Message <span class="req">*</span></label>
        <textarea id="eq-msg" name="message" required placeholder="Tell us about your business and the designs you are looking for." aria-invalid={!!e.message}>{v.message ?? ''}</textarea>
        {#if e.message}<span class="field-error">{e.message}</span>{/if}
      </div>
    </div>
    <button class="btn" type="submit" disabled={submitting} style="margin-top: 22px">
      {submitting ? 'Sending…' : 'Send wholesale enquiry'}
    </button>
  </form>
{/if}

<style>
  fieldset {
    border: 0;
    padding: 0;
    margin: 0;
  }
  legend {
    margin-bottom: 8px;
  }
</style>
