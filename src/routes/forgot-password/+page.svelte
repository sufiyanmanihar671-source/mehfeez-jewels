<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/Seo.svelte';
  import AuthShell from '$lib/components/AuthShell.svelte';
  let { form } = $props();
</script>

<Seo title="Forgot password" noindex />

<AuthShell title="Reset your password" subtitle="Enter the email address you registered with and we will send you a reset link.">
  {#if form?.sent}
    <div class="alert alert--success" role="status">If an account exists for that email, a password reset link is on its way. Please check your inbox.</div>
    <a href="/login">Back to login</a>
  {:else}
    {#if form?.message}<div class="alert alert--error" role="alert">{form.message}</div>{/if}
    <form method="POST" use:enhance>
      <div class="field">
        <label for="email">Email address</label>
        <input id="email" name="email" type="email" autocomplete="email" required value={form?.email ?? ''} />
      </div>
      <button class="btn btn--block" type="submit" style="margin-top: 20px">Send reset link</button>
    </form>
    <p style="margin-top: 18px"><a href="/login">Back to login</a></p>
  {/if}
</AuthShell>
