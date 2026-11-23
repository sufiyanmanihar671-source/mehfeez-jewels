<script lang="ts">
  import { onMount } from 'svelte';
  import { env } from '$env/dynamic/public';

  /**
   * "Sign in with Google" using Google Identity Services (Google's own button).
   * Because the ID token is issued for this site, Google's popup says
   * "to continue to mehfeezjewels.com" (not the Supabase address).
   * Falls back to the redirect flow (/auth/google) if Google's script can't load.
   */
  let { next = '/account', label = 'Continue with Google' }: { next?: string; label?: string } = $props();

  const enabled = env.PUBLIC_GOOGLE_LOGIN === 'true';
  const clientId = env.PUBLIC_GOOGLE_CLIENT_ID ?? '';
  const text = $derived(label.toLowerCase().startsWith('sign up') ? 'signup_with' : 'continue_with');

  let slot = $state<HTMLDivElement>();
  let wrap = $state<HTMLDivElement>();
  let mode = $state<'loading' | 'gis' | 'fallback'>('loading');
  let busy = $state(false);
  let message = $state('');

  type GoogleId = {
    initialize: (o: Record<string, unknown>) => void;
    renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
  };
  const gid = () => (window as unknown as { google?: { accounts?: { id?: GoogleId } } }).google?.accounts?.id;

  function loadScript(): Promise<void> {
    if (gid()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('gsi load failed'));
      document.head.appendChild(s);
      setTimeout(() => reject(new Error('gsi timeout')), 8000);
    });
  }

  async function onCredential(res: { credential?: string }) {
    if (!res.credential) return;
    busy = true;
    message = '';
    try {
      const r = await fetch('/auth/google/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: res.credential, next })
      });
      const out = await r.json().catch(() => ({}));
      if (r.ok && out.redirect) {
        window.location.assign(out.redirect);
        return;
      }
      message = out.message ?? 'Google sign-in could not be completed. Please try again.';
    } catch {
      message = 'Network error. Please try again.';
    }
    busy = false;
  }

  onMount(() => {
    if (!enabled) return;
    if (!clientId) {
      mode = 'fallback';
      return;
    }
    (async () => {
      try {
        const [{ nonce }] = await Promise.all([fetch('/auth/google/nonce').then((r) => r.json()), loadScript()]);
        const id = gid();
        if (!id || !slot) throw new Error('gsi unavailable');
        id.initialize({
          client_id: clientId,
          callback: onCredential,
          nonce,
          ux_mode: 'popup',
          context: text === 'signup_with' ? 'signup' : 'signin',
          itp_support: true,
          use_fedcm_for_button: true
        });
        id.renderButton(slot, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text,
          logo_alignment: 'center',
          width: Math.min(400, Math.max(220, Math.floor(wrap?.getBoundingClientRect().width || 320)))
        });
        mode = 'gis';
      } catch {
        mode = 'fallback';
      }
    })();
  });
</script>

{#if enabled}
  <div class="wrap" aria-busy={busy} bind:this={wrap}>
    <div class="gis" class:hidden={mode !== 'gis'} bind:this={slot}></div>
    {#if mode === 'loading'}
      <div class="placeholder" aria-hidden="true"></div>
    {:else if mode === 'fallback'}
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
    {/if}
    {#if busy}<p class="status" role="status">Signing you in…</p>{/if}
    {#if message}<p class="err" role="alert">{message}</p>{/if}
  </div>
  <div class="or" aria-hidden="true"><span>or</span></div>
{/if}

<style>
  .wrap {
    min-height: 44px;
  }
  .gis {
    display: flex;
    justify-content: center;
    min-height: 44px;
  }
  .gis.hidden {
    display: none;
  }
  .placeholder {
    height: 44px;
    border: 1px solid var(--charcoal-15);
    border-radius: var(--radius);
    background: var(--white);
  }
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
  }
  .google:hover {
    border-color: var(--burgundy);
  }
  .status,
  .err {
    margin: 8px 0 0;
    font-size: 0.88rem;
    text-align: center;
  }
  .err {
    color: var(--burgundy);
    font-weight: 500;
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
