<script lang="ts">
  /**
   * Official Mehfeez Jewels logo ("Mehfeez" with "Jewels" beneath), from the
   * brand's own logo file — lettering unchanged, only the background removed.
   * An admin-uploaded logo in Settings overrides it.
   */
  let {
    src = null,
    light = false,
    size = 'md'
  }: { src?: string | null; light?: boolean; size?: 'sm' | 'md' | 'lg' } = $props();
  const mark = $derived(light ? '/brand/mehfeez-jewels-white.png' : '/brand/mehfeez-jewels-burgundy.png');
</script>

<a href="/" class="logo {size}" aria-label="Mehfeez Jewels — Home">
  <img src={src || mark} alt="Mehfeez Jewels" width="1184" height="536" />
</a>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    line-height: 0;
    text-decoration: none !important;
  }
  img {
    display: block;
    height: var(--h);
    width: auto;
    object-fit: contain;
  }
  .sm {
    --h: 40px;
  }
  .md {
    --h: 52px;
  }
  .lg {
    --h: 76px;
  }
  @media (max-width: 480px) {
    .md {
      --h: 42px;
    }
  }
  @media (max-width: 360px) {
    .md {
      --h: 36px;
    }
  }
  @media (min-width: 1100px) {
    .md {
      --h: 60px;
    }
  }
</style>
