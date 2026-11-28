<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/Seo.svelte';
  import AuthShell from '$lib/components/AuthShell.svelte';
  import BusinessFields from '$lib/components/BusinessFields.svelte';
  import GoogleButton from '$lib/components/GoogleButton.svelte';

  let { form } = $props();
  let busy = $state(false);
  let showPw = $state(false);
  const v = $derived((form?.values ?? {}) as Record<string, string>);
  const e = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<Seo title="Register as a Wholesale Buyer" description="Register your business with Mehfeez Jewels to access wholesale prices on artificial jewellery. Open to retailers, distributors and resellers in India and worldwide." />

<AuthShell
  wide
  title="Register your business"
  subtitle="Takes 1 minute. After you verify your email, our team approves your account and you can see wholesale prices."
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

      <BusinessFields values={v} errors={e} minimal />

      <div class="form-grid form-grid--2" style="margin-top: 14px">
        <div class="field">
          <label for="email">Email <span class="req">*</span></label>
          <input id="email" name="email" type="email" autocomplete="email" required value={v.email ?? ''} aria-invalid={!!e.email} />
          {#if e.email}<span class="field-error">{e.email}</span>{/if}
        </div>
        <div class="field">
          <label for="password">Password <span class="req">*</span></label>
          <div class="pw">
            <input id="password" name="password" type={showPw ? 'text' : 'password'} autocomplete="new-password" required minlength="8" aria-invalid={!!e.password} />
            <button type="button" class="eye" onclick={() => (showPw = !showPw)} aria-label={showPw ? 'Hide password' : 'Show password'}>{showPw ? 'Hide' : 'Show'}</button>
          </div>
          <span class="hint">8+ characters with a letter and a number.</span>
          {#if e.password}<span class="field-error">{e.password}</span>{/if}
        </div>
        <div class="field span-2">
          <label class="checkbox"><input type="checkbox" name="terms" checked={v.terms === 'on'} /> <span>I am a business buyer and agree to the <a href="/privacy" target="_blank">Privacy Policy</a>.</span></label>
          {#if e.terms}<span class="field-error">{e.terms}</span>{/if}
        </div>
      </div>
      <button class="btn btn--block" type="submit" disabled={busy} style="margin-top: 20px">{busy ? 'Creating account…' : 'Create account'}</button>
    </form>
    <p class="alt">Already registered? <a href="/login">Login</a></p>
  {/if}
</AuthShell>

<style>
  .alt {
    margin-top: 22px;
  }
  .pw {
    position: relative;
  }
  .pw input {
    padding-right: 64px;
  }
  .eye {
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    padding: 6px 8px;
    border: 0;
    background: none;
    color: var(--burgundy);
    font: inherit;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
  }
  .g {
    max-width: 420px;
  }
</style>
