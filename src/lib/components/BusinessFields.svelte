<script lang="ts">
  import { BUSINESS_TYPES, COUNTRIES } from '$lib/countries';
  let { values = {}, errors = {} }: { values?: Record<string, any>; errors?: Record<string, string> } = $props();
  let country = $state('');
  $effect.pre(() => {
    country = values.country ?? '';
  });
</script>

<div class="form-grid form-grid--2">
  <div class="field">
    <label for="full_name">Full name <span class="req">*</span></label>
    <input id="full_name" name="full_name" type="text" autocomplete="name" required value={values.full_name ?? ''} aria-invalid={!!errors.full_name} />
    {#if errors.full_name}<span class="field-error">{errors.full_name}</span>{/if}
  </div>
  <div class="field">
    <label for="company_name">Business / company name <span class="req">*</span></label>
    <input id="company_name" name="company_name" type="text" autocomplete="organization" required value={values.company_name ?? ''} aria-invalid={!!errors.company_name} />
    {#if errors.company_name}<span class="field-error">{errors.company_name}</span>{/if}
  </div>
  <div class="field">
    <label for="whatsapp">WhatsApp number <span class="req">*</span></label>
    <input id="whatsapp" name="whatsapp" type="tel" autocomplete="tel" placeholder="+91 98765 43210" required value={values.whatsapp ?? ''} aria-invalid={!!errors.whatsapp} />
    <span class="hint">Include your country code.</span>
    {#if errors.whatsapp}<span class="field-error">{errors.whatsapp}</span>{/if}
  </div>
  <div class="field">
    <label for="business_type">Business type <span class="req">*</span></label>
    <select id="business_type" name="business_type" required aria-invalid={!!errors.business_type}>
      <option value="">Select business type</option>
      {#each BUSINESS_TYPES as t}<option value={t} selected={values.business_type === t}>{t}</option>{/each}
    </select>
    {#if errors.business_type}<span class="field-error">{errors.business_type}</span>{/if}
  </div>
  <div class="field">
    <label for="country">Country <span class="req">*</span></label>
    <select id="country" name="country" required bind:value={country} aria-invalid={!!errors.country}>
      <option value="">Select country</option>
      {#each COUNTRIES as c}<option value={c}>{c}</option>{/each}
    </select>
    {#if errors.country}<span class="field-error">{errors.country}</span>{/if}
  </div>
  <div class="field">
    <label for="city">City <span class="req">*</span></label>
    <input id="city" name="city" type="text" autocomplete="address-level2" required value={values.city ?? ''} aria-invalid={!!errors.city} />
    {#if errors.city}<span class="field-error">{errors.city}</span>{/if}
  </div>
  <div class="field span-2">
    <label for="address">Business address <span class="req">*</span></label>
    <textarea id="address" name="address" rows="2" autocomplete="street-address" required aria-invalid={!!errors.address}>{values.address ?? ''}</textarea>
    {#if errors.address}<span class="field-error">{errors.address}</span>{/if}
  </div>
  <div class="field">
    <label for="gst_number">GST number {#if country === 'India'}(recommended){:else}(optional){/if}</label>
    <input id="gst_number" name="gst_number" type="text" maxlength="15" value={values.gst_number ?? ''} aria-invalid={!!errors.gst_number} />
    <span class="hint">Optional for international buyers.</span>
    {#if errors.gst_number}<span class="field-error">{errors.gst_number}</span>{/if}
  </div>
  <div class="field">
    <label for="website">Website / Instagram (optional)</label>
    <input id="website" name="website" type="text" placeholder="www.example.com or @yourstore" value={values.website ?? ''} aria-invalid={!!errors.website} />
    {#if errors.website}<span class="field-error">{errors.website}</span>{/if}
  </div>
  <div class="field span-2">
    <label for="additional_info">Additional business information</label>
    <textarea id="additional_info" name="additional_info" rows="3" placeholder="Number of stores, categories you sell, typical order size…" aria-invalid={!!errors.additional_info}
      >{values.additional_info ?? ''}</textarea
    >
    {#if errors.additional_info}<span class="field-error">{errors.additional_info}</span>{/if}
  </div>
</div>
