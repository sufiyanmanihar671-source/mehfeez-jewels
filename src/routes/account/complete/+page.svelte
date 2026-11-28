<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/Seo.svelte';
  import AuthShell from '$lib/components/AuthShell.svelte';
  import BusinessFields from '$lib/components/BusinessFields.svelte';

  let { data, form } = $props();
  let busy = $state(false);
  const values = $derived((form?.values as Record<string, string>) ?? { full_name: data.profile?.full_name ?? '' });
  const e = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<Seo title="Complete your business profile" noindex />

<AuthShell
  wide
  title="Complete your business profile"
  subtitle="You are signed in as {data.user?.email}. Add your business details so our team can review your wholesale account. Wholesale prices become visible once it is approved."
>
  {#if form?.message}<div class="alert alert--error" role="alert">{form.message}</div>{/if}
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
    <input type="hidden" name="next" value={data.next} />
    <BusinessFields {values} errors={e} minimal />
    <div class="field" style="margin-top: 18px">
      <label class="checkbox"><input type="checkbox" name="terms" /> <span>I am a business buyer and agree to the <a href="/privacy" target="_blank">Privacy Policy</a>.</span></label>
      {#if e.terms}<span class="field-error">{e.terms}</span>{/if}
    </div>
    <button class="btn" type="submit" disabled={busy} style="margin-top: 22px">{busy ? 'Saving…' : 'Submit for approval'}</button>
  </form>
  <form method="POST" action="/logout" style="margin-top: 18px">
    <button class="linklike" type="submit">Not you? Log out</button>
  </form>
</AuthShell>

<style>
  .linklike {
    background: none;
    border: 0;
    padding: 0;
    color: var(--burgundy);
    font: inherit;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: underline;
  }
</style>
