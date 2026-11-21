<script lang="ts">
  /**
   * Logo slot. Shows the official logo uploaded in Admin > Settings.
   * Until it is uploaded, the brand name is shown as plain text — this is a
   * placeholder, not an alternative logo.
   */
  let { src = null, light = false }: { src?: string | null; light?: boolean } = $props();
</script>

<a href="/" class="logo" class:light aria-label="Mehfeez Jewels — Home">
  {#if src}
    <img {src} alt="Mehfeez Jewels" width="180" height="56" />
  {:else}
    <span class="wordmark">MEHFEEZ <span>JEWELS</span></span>
  {/if}
</a>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    text-decoration: none !important;
    color: var(--burgundy);
  }
  .logo img {
    height: 48px;
    width: auto;
    object-fit: contain;
  }
  .wordmark {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.45rem;
    letter-spacing: 0.18em;
    white-space: nowrap;
  }
  .wordmark span {
    font-weight: 500;
    letter-spacing: 0.32em;
    font-size: 0.82em;
    margin-left: 4px;
  }
  .light {
    color: var(--white);
  }
</style>
