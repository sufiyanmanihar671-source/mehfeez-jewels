<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/Seo.svelte';
  import AuthShell from '$lib/components/AuthShell.svelte';
  import BusinessFields from '$lib/components/BusinessFields.svelte';
  import GoogleButton from '$lib/components/GoogleButton.svelte';

  let { form } = $props();
  let busy = $state(false);
  const v = $derived((form?.values ?? {}) as Record<string, string>);
  const e = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<Seo title="Register as a Wholesale Buyer" description="Register your business with Mehfeez Jewels to access wholesale prices on artificial jewellery. Open to retailers, distributors and resellers in India and worldwide." />

<AuthShell
  wide
  title="Register your business"
  subtitle="Wholesale prices are visible to approved business customers. After you register and verify your email, our team reviews your details — usually within one business day."
>
  {#if form?.success}
    <div class="alert alert--success" role="status">
      <strong>Almost done — please verify your email.</strong><br />
      We have sent a verification link to {form.email || 'your email address'}. After verifying, your account will be reviewed by our
      team. You will be able to see wholesale prices once it is approved.
    </div>
    <a class="btn" href="/login">Go to login</a>
  {:else}
    {#if form?.message}<div class="alert alert--error" role="alert">{form.message}</div>{/if}
    <div class="g"><GoogleButton label="Sign up with Google" /></div>
    <form
      method="POST"
      novalidate
      use:enhance={() => {
        busy = true;
        return async ({ update }) => {
          await update({ reset: false });
          busy = false;
        };
      }}
    >
      <div class="hp" aria-hidden="true">
        <label>Company website <input type="text" name="company_website_hp" tabindex="-1" autocomplete="off" /></label>
      </div>

      <h2 class="h">Business details</h2>
      <BusinessFields values={v} errors={e} />

      <h2 class="h">Login details</h2>
      <div class="form-grid form-grid--2">
        <div class="field span-2">
          <label for="email">Email address <span class="req">*</span></label>
          <input id="email" name="email" type="email" autocomplete="email" required value={v.email ?? ''} aria-invalid={!!e.email} />
          {#if e.email}<span class="field-error">{e.email}</span>{/if}
        </div>
        <div class="field">
          <label for="password">Password <span class="req">*</span></label>
          <input id="password" name="password" type="password" autocomplete="new-password" required minlength="8" aria-invalid={!!e.password} />
          <span class="hint">At least 8 characters, including a letter and a number.</span>
          {#if e.password}<span class="field-error">{e.password}</span>{/if}
        </div>
        <div class="field">
          <label for="confirm_password">Confirm password <span class="req">*</span></label>
          <input id="confirm_password" name="confirm_password" type="password" autocomplete="new-password" required aria-invalid={!!e.confirm_password} />
          {#if e.confirm_password}<span class="field-error">{e.confirm_password}</span>{/if}
        </div>
        <div class="field span-2">
          <label class="checkbox"><input type="checkbox" name="terms" /> I am registering on behalf of a business for wholesale purchases.</label>
          {#if e.terms}<span class="field-error">{e.terms}</span>{/if}
        </div>
      </div>
      <button class="btn" type="submit" disabled={busy} style="margin-top: 24px">{busy ? 'Creating account…' : 'Create wholesale account'}</button>
    </form>
    <p class="alt">Already registered? <a href="/login">Login</a></p>
  {/if}
</AuthShell>

<style>
  .h {
    font-size: 1.35rem;
    margin: 28px 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--charcoal-08);
  }
  .alt {
    margin-top: 22px;
  }
  .g {
    max-width: 420px;
  }
</style>
