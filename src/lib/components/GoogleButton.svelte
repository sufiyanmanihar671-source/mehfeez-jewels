<script lang="ts">
  import { env } from '$env/dynamic/public';
  // Shown only once Google is enabled in Supabase (PUBLIC_GOOGLE_LOGIN=true in wrangler.toml).
  const enabled = env.PUBLIC_GOOGLE_LOGIN === 'true';
  let { next = '/account', label = 'Continue with Google' }: { next?: string; label?: string } = $props();
</script>

{#if enabled}
<!-- A plain link (not a form): the CSP's form-action 'self' would block a form redirecting to Google. -->
<a
  class="google"
  href={`/auth/google?next=${encodeURIComponent(next || '/account')}`}
  data-sveltekit-reload
  data-sveltekit-preload-data="off"
  rel="nofollow"
>
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M21.6 12.23c0-.68-.06-1.36-.18-2.02H12v3.83h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.98-4.32 2.98-7.33ZM12 22c2.7 0 4.98-.9 6.63-2.43l-3.23-2.5c-.9.6-2.05.95-3.4.95-2.6 0-4.81-1.76-5.6-4.12H3.07v2.58A10 10 0 0 0 12 22Zm-5.6-8.1a6 6 0 0 1 0-3.8V7.52H3.07a10 10 0 0 0 0 8.96L6.4 13.9ZM12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.52L6.4 10.1C7.19 7.74 9.4 5.98 12 5.98Z"
    />
  </svg>
  <span>{label}</span>
</a>

<div class="or" aria-hidden="true"><span>or</span></div>
{/if}

<style>
  .google {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    min-height: 48px;
    border: 1px solid var(--charcoal-15);
    border-radius: var(--radius);
    background: var(--white);
    color: var(--charcoal);
    font-weight: 500;
    font-size: 0.95rem;
    text-decoration: none !important;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .google:hover {
    border-color: var(--burgundy);
    box-shadow: 0 0 0 3px var(--burgundy-08);
  }
  .or {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
    color: var(--charcoal-50);
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .or::before,
  .or::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--charcoal-15);
  }
</style>
