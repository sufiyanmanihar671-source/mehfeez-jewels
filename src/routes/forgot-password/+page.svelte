<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/Seo.svelte';
  import AuthShell from '$lib/components/AuthShell.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { page } from '$app/state';
  import { waLink } from '$lib/whatsapp';

  let { data, form } = $props();
  let busy = $state(false);
  let changeBusy = $state(false);
  let showRequest = $state(false);

  const loggedIn = $derived(!!data.user);
  const sentTo = $derived((form?.sent && (form?.email as string)) || '');
  const isGmail = $derived(/@(gmail|googlemail)\.com$/i.test(sentTo));
  const help = $derived(
    waLink(
      data.settings.whatsapp_number,
      `Hello Mehfeez Jewels, I need help resetting the password for my wholesale account${sentTo ? ` (${sentTo})` : ''}.`
    )
  );

  const sending = () => {
    busy = true;
    return async ({ update }: { update: (o?: { reset?: boolean }) => Promise<void> }) => {
      await update({ reset: false });
      busy = false;
    };
  };
</script>

<Seo title="Forgot password" noindex />

<AuthShell
  title={loggedIn && !showRequest ? 'Change your password' : 'Reset your password'}
  subtitle={loggedIn && !showRequest
    ? `You are signed in as ${data.user?.email}. Choose a new password below — no email needed.`
    : 'Enter the email address you registered with and we will send you a reset link.'}
>
  {#if loggedIn && !showRequest && !form?.sent}
    <!-- Signed in: change the password directly (handled by /reset-password). -->
    {#if form?.message}<div class="alert alert--error" role="alert">{form.message}</div>{/if}
    <form
      method="POST"
      action="/reset-password"
      use:enhance={() => {
        changeBusy = true;
        return async ({ update }) => {
          await update();
          changeBusy = false;
        };
      }}
    >
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
      <button class="btn btn--block" type="submit" disabled={changeBusy} style="margin-top: 20px">
        {changeBusy ? 'Saving…' : 'Save new password'}
      </button>
    </form>
    <div class="options">
      <a href="/account"><Icon name="user" size={16} /> My account</a>
      {#if data.profile?.role === 'admin'}<a href="/admin"><Icon name="lock" size={16} /> Admin panel</a>{/if}
      <button type="button" class="linklike" onclick={() => (showRequest = true)}><Icon name="mail" size={16} /> Email me a reset link instead</button>
    </div>
  {:else if form?.sent}
    <div class="alert alert--success" role="status">
      If an account exists for <strong>{sentTo}</strong>, a password reset link is on its way. It usually arrives within a
      minute — please also check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
    </div>

    <div class="actions">
      {#if isGmail}
        <a class="btn btn--block" href="https://mail.google.com/mail/u/0/#search/from%3Anoreply%40mehfeezjewels.com" target="_blank" rel="noopener noreferrer">
          <Icon name="mail" size={18} /> Open Gmail
        </a>
      {/if}
      <form method="POST" use:enhance={sending}>
        <input type="hidden" name="email" value={sentTo} />
        <button class="btn btn--outline btn--block" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Resend the link'}</button>
      </form>
    </div>

    <div class="options">
      <a href="/forgot-password" data-sveltekit-reload><Icon name="arrow" size={16} /> Use a different email</a>
      {#if loggedIn}
        <a href="/account"><Icon name="user" size={16} /> Back to my account</a>
      {:else}
        <a href="/login"><Icon name="user" size={16} /> Back to login</a>
        <a href="/register"><Icon name="diamond" size={16} /> Create a wholesale account</a>
      {/if}
      <a href={help} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={16} /> Need help? WhatsApp us</a>
    </div>
  {:else}
    {#if page.url.searchParams.get('expired')}<div class="alert alert--error" role="alert">That reset link could not be used here. Please request a new one.</div>{/if}
    {#if form?.message}<div class="alert alert--error" role="alert">{form.message}</div>{/if}
    <form method="POST" use:enhance={sending}>
      <div class="field">
        <label for="email">Email address</label>
        <input id="email" name="email" type="email" autocomplete="email" required value={form?.email ?? data.user?.email ?? ''} />
      </div>
      <button class="btn btn--block" type="submit" disabled={busy} style="margin-top: 20px">{busy ? 'Sending…' : 'Send reset link'}</button>
    </form>
    <div class="options">
      {#if loggedIn}
        <button type="button" class="linklike" onclick={() => (showRequest = false)}><Icon name="lock" size={16} /> Change password directly</button>
        <a href="/account"><Icon name="user" size={16} /> Back to my account</a>
      {:else}
        <a href="/login"><Icon name="user" size={16} /> Back to login</a>
        <a href="/register"><Icon name="diamond" size={16} /> Create a wholesale account</a>
      {/if}
      <a href={help} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={16} /> Need help? WhatsApp us</a>
    </div>
  {/if}
</AuthShell>

<style>
  .actions {
    display: grid;
    gap: 10px;
    margin-bottom: 8px;
  }
  .options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid var(--charcoal-08);
  }
  .options a,
  .linklike {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--burgundy);
    font-size: 0.95rem;
  }
  .linklike {
    background: none;
    border: 0;
    padding: 0;
    font: inherit;
    cursor: pointer;
    text-align: left;
  }
  .linklike:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
