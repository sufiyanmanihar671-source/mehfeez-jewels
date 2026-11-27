<script lang="ts">
  import Icon from './Icon.svelte';
  import { waLink } from '$lib/whatsapp';
  import type { SiteSettings } from '$lib/types';

  let { settings }: { settings: SiteSettings } = $props();
</script>

<div class="floating" aria-label="Contact shortcuts">
  {#if settings.video_call_enabled}
    <a
      class="fab fab--video"
      href={waLink(settings.video_call_number, settings.video_call_message)}
      target="_blank"
      rel="noopener noreferrer"
      title="Send a WhatsApp message requesting a video call"
    >
      <Icon name="video" size={22} />
      <span class="text">Schedule a Video Call</span>
    </a>
  {/if}
  <a
    class="fab fab--wa"
    href={waLink(settings.whatsapp_number, settings.whatsapp_message)}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with Mehfeez Jewels on WhatsApp"
    title="Chat on WhatsApp"
  >
    <Icon name="whatsapp" size={30} />
  </a>
</div>

<style>
  /* Phones use the bottom bar instead (MobileBar). */
  @media (max-width: 759px) {
    .floating {
      display: none !important;
    }
  }
  .floating {
    position: fixed;
    right: max(16px, env(safe-area-inset-right));
    bottom: max(16px, env(safe-area-inset-bottom));
    z-index: 60;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
  }
  .fab {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-decoration: none !important;
    box-shadow: var(--shadow-lg);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .fab:hover {
    transform: translateY(-2px);
  }
  .fab--wa {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    /* WhatsApp glyph in white on brand burgundy keeps the site palette intact. */
    background: var(--burgundy);
    color: var(--white);
    border: 2px solid var(--white);
  }
  .fab--video {
    height: 48px;
    padding: 0 18px 0 14px;
    border-radius: 999px;
    background: var(--white);
    color: var(--burgundy);
    border: 1px solid var(--burgundy);
    font-size: 0.76rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .fab--video:hover {
    background: var(--burgundy);
    color: var(--white);
  }
  @media (max-width: 520px) {
    .fab--video {
      width: 48px;
      padding: 0;
    }
    .fab--video .text {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
    }
  }
</style>
