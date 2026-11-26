<script lang="ts">
  type Name =
    | 'whatsapp' | 'video' | 'menu' | 'close' | 'user' | 'lock' | 'phone' | 'mail' | 'pin' | 'check'
    | 'diamond' | 'globe' | 'box' | 'factory' | 'handshake' | 'search' | 'arrow' | 'instagram' | 'facebook' | 'clock'
    | 'tag' | 'sparkle' | 'grid' | 'truck'
    | 'gem' | 'boxes' | 'seal' | 'world' | 'headset' | 'plane' | 'designs' | 'necklace';
  let { name, size = 20, label, stroke = 1.6 }: { name: Name; size?: number; label?: string; stroke?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={stroke}
  stroke-linecap="round"
  stroke-linejoin="round"
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : 'true'}
>
  {#if name === 'whatsapp'}
    <path
      fill="currentColor"
      stroke="none"
      d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.22-.08-.39-.12-.55.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z"
    />
  {:else if name === 'video'}
    <rect x="2.5" y="6" width="13" height="12" rx="2" /><path d="m15.5 10.5 6-3.5v10l-6-3.5" />
  {:else if name === 'menu'}
    <path d="M3 6h18M3 12h18M3 18h18" />
  {:else if name === 'close'}
    <path d="M6 6l12 12M18 6 6 18" />
  {:else if name === 'user'}
    <circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  {:else if name === 'lock'}
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
  {:else if name === 'phone'}
    <path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2" />
  {:else if name === 'mail'}
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
  {:else if name === 'pin'}
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" />
  {:else if name === 'check'}
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  {:else if name === 'diamond'}
    <path d="M6 4h12l3 5-9 11L3 9l3-5Z" /><path d="M3 9h18M9 4l3 16 3-16" />
  {:else if name === 'globe'}
    <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" />
  {:else if name === 'box'}
    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" /><path d="m3 7.5 9 4.5 9-4.5M12 12v9" />
  {:else if name === 'factory'}
    <path d="M3 21V10l5 3V10l5 3V6l8 4v11H3Z" /><path d="M7 17h2M12 17h2M17 17h1" />
  {:else if name === 'handshake'}
    <path d="m11 17 2 2a1.5 1.5 0 0 0 2-2" /><path d="m14 15 2.5 2.5a1.5 1.5 0 0 0 2-2l-4-4" /><path d="M21 11.5 17 7.5l-3 1-3-2-2 1L3 12" /><path d="m3 12 6 6a1.5 1.5 0 0 0 2-2" /><path d="m8.5 13.5 2 2" />
  {:else if name === 'search'}
    <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
  {:else if name === 'arrow'}
    <path d="M5 12h14M13 6l6 6-6 6" />
  {:else if name === 'instagram'}
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  {:else if name === 'facebook'}
    <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8Z" />
  {:else if name === 'clock'}
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  {:else if name === 'tag'}
    <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" /><circle cx="8" cy="8" r="1.6" />
  {:else if name === 'sparkle'}
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
  {:else if name === 'grid'}
    <rect x="3.5" y="3.5" width="7" height="7" /><rect x="13.5" y="3.5" width="7" height="7" /><rect x="3.5" y="13.5" width="7" height="7" /><rect x="13.5" y="13.5" width="7" height="7" />
  {:else if name === 'gem'}
    <path d="M7 3.5h10l4 5.5-9 11.5L3 9l4-5.5Z" /><path d="M3 9h18" /><path d="M9.5 3.5 8 9l4 11.5L16 9l-1.5-5.5" /><path d="M8 9l4-5.5L16 9" />
  {:else if name === 'boxes'}
    <path d="M3.5 13.5h7v7h-7zM13.5 13.5h7v7h-7zM8.5 3.5h7v7h-7z" /><path d="M6 13.5v2M17 13.5v2M11 3.5v2" />
  {:else if name === 'seal'}
    <path d="M12 2.8l2 1.5 2.5-.2.9 2.3 2.2 1.2-.4 2.5 1.2 2.2-1.6 1.9.1 2.5-2.4.8-1.3 2.1-2.5-.6L12 21l-1.9-1.6-2.5.6-1.3-2.1-2.4-.8.1-2.5L2.4 12.6l1.2-2.2-.4-2.5 2.2-1.2.9-2.3 2.5.2Z" /><path d="m8.6 12 2.3 2.3 4.5-4.6" />
  {:else if name === 'world'}
    <circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5c-2.3-2.4-3.4-5.2-3.4-8.5S9.7 5.9 12 3.5Z" /><path d="M5.5 6.6c2 1 4.1 1.4 6.5 1.4s4.5-.4 6.5-1.4M5.5 17.4c2-1 4.1-1.4 6.5-1.4s4.5.4 6.5 1.4" />
  {:else if name === 'headset'}
    <path d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1" /><rect x="3.5" y="13" width="4" height="6" rx="1.5" /><rect x="16.5" y="13" width="4" height="6" rx="1.5" /><path d="M18.5 19c0 1.4-1.6 2-4 2h-2" />
  {:else if name === 'plane'}
    <path d="M21 4 3 11.2l6.5 2.3L12 20l3.2-5.3L21 4Z" /><path d="m9.5 13.5 5.7-4.2" />
  {:else if name === 'designs'}
    <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1" /><rect x="13" y="3.5" width="7.5" height="7.5" rx="1" /><rect x="3.5" y="13" width="7.5" height="7.5" rx="1" /><path d="M16.75 13.5l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4Z" />
  {:else if name === 'necklace'}
    <path d="M4 4c.5 7 3.8 11 8 11s7.5-4 8-11" /><path d="M12 15l2 2.5-2 3-2-3 2-2.5Z" /><circle cx="6.6" cy="10" r=".9" fill="currentColor" /><circle cx="17.4" cy="10" r=".9" fill="currentColor" /><circle cx="9" cy="13" r=".9" fill="currentColor" /><circle cx="15" cy="13" r=".9" fill="currentColor" />
  {:else if name === 'truck'}
    <path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5V16h-7" /><circle cx="6.5" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" />
  {/if}
</svg>
