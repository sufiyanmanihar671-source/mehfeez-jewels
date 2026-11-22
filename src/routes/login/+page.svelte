<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/Seo.svelte';
  import AuthShell from '$lib/components/AuthShell.svelte';
  import { page } from '$app/state';
  let { data, form } = $props();
  const notice = $derived(page.url.searchParams.get('notice'));
  const linkError = $derived(page.url.searchParams.get('error') === 'link');
  let busy = $state(false);
</script>

<Seo title="Login" noindex />

<AuthShell title="Login" subtitle="Log in to view wholesale prices and manage your business account.">
  {#if notice === 'verified'}
    <div class="alert alert--success" role="status">Your email has been verified. Please log in to continue.</div>
  {:else if linkError && !form?.message}
    <div class="alert alert--error" role="alert">This link is invalid or has expired. Please log in, or request a new link from “Forgot password?”.</div>
  {/if}
  {#if form?.message}<div class="alert alert--error" role="alert">{form.message}</div>{/if}
  <form
    method="POST"
    use:enhance={() => {
      busy = true;
      return async ({ update }) => {
        await update();
        busy = false;
      };
    }}
  >
    <input type="hidden" name="next" value={data.next} />
    <div class="form-grid">
      <div class="field">
        <label for="email">Email address</label>
        <input id="email" name="email" type="email" autocomplete="email" required value={form?.email ?? ''} />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required />
      </div>
    </div>
    <p class="forgot"><a href="/forgot-password">Forgot password?</a></p>
    <button class="btn btn--block" type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
  </form>
  <p class="alt">New wholesale buyer? <a href="/register">Register your business</a></p>
</AuthShell>

<style>
  .forgot {
    text-align: right;
    margin: 10px 0 20px;
    font-size: 0.9rem;
  }
  .alt {
    margin: 22px 0 0;
    text-align: center;
    font-size: 0.95rem;
  }
</style>
