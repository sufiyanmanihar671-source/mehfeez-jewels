<script lang="ts">
  /**
   * Official Mehfeez wordmark (from the brand's own logo file, unchanged
   * lettering) with "JEWELS" set beneath it. An admin-uploaded logo in
   * Settings overrides it.
   */
  let {
    src = null,
    light = false,
    size = 'md'
  }: { src?: string | null; light?: boolean; size?: 'sm' | 'md' | 'lg' } = $props();
  const mark = $derived(light ? '/brand/mehfeez-white.png' : '/brand/mehfeez-burgundy.png');
</script>

<a href="/" class="logo {size}" class:light aria-label="Mehfeez Jewels — Home">
  {#if src}
    <img class="custom" {src} alt="Mehfeez Jewels" />
  {:else}
    <span class="lockup">
      <img class="mark" src={mark} alt="Mehfeez" width="1104" height="418" />
      <span class="jewels">JEWELS</span>
    </span>
  {/if}
</a>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    text-decoration: none !important;
    color: var(--burgundy);
    line-height: 1;
  }
  .light {
    color: var(--white);
  }
  .custom {
    height: 52px;
    width: auto;
    object-fit: contain;
  }
  .lockup {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
  }
  .mark {
    display: block;
    height: var(--h);
    width: auto;
  }
  .jewels {
    font-family: var(--font-body);
    font-weight: 500;
    letter-spacing: 0.62em;
    /* letter-spacing adds trailing space; pull it back so the word stays centred */
    margin-right: -0.62em;
    font-size: var(--fs);
    margin-top: var(--gap);
  }
  .sm {
    --h: 30px;
    --fs: 0.5rem;
    --gap: 3px;
  }
  .md {
    --h: 40px;
    --fs: 0.6rem;
    --gap: 4px;
  }
  .lg {
    --h: 56px;
    --fs: 0.78rem;
    --gap: 6px;
  }
</style>
