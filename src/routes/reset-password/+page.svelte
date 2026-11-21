<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/Seo.svelte';
  import AuthShell from '$lib/components/AuthShell.svelte';
  let { form } = $props();
</script>

<Seo title="Choose a new password" noindex />

<AuthShell title="Choose a new password">
  {#if form?.message}<div class="alert alert--error" role="alert">{form.message}</div>{/if}
  <form method="POST" use:enhance>
    <div class="form-grid">
      <div class="field">
        <label for="password">New password</label>
        <input id="password" name="password" type="password" autocomplete="new-password" required minlength="8" />
        <span class="hint">At least 8 characters, including a letter and a number.</span>
      </div>
      <div class="field">
        <label for="confirm_password">Confirm new password</label>
        <input id="confirm_password" name="confirm_password" type="password" autocomplete="new-password" required />
      </div>
    </div>
    <button class="btn btn--block" type="submit" style="margin-top: 20px">Update password</button>
  </form>
</AuthShell>
