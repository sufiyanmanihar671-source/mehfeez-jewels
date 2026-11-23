<script lang="ts">
  /** Reference-style section heading: small label, serif title with an italic accent word, diamond divider. */
  let {
    eyebrow,
    title,
    accent = '',
    text = '',
    light = false
  }: { eyebrow: string; title: string; accent?: string; text?: string; light?: boolean } = $props();
</script>

<div class="sh" class:light>
  <span class="eb"><span class="ln"></span>{eyebrow}<span class="ln"></span></span>
  <h2>{title}{#if accent}{" "}<em>{accent}</em>{/if}</h2>
  <span class="dv" aria-hidden="true"><span></span><i></i><span></span></span>
  {#if text}<p>{text}</p>{/if}
</div>

<style>
  .sh {
    text-align: center;
    max-width: 760px;
    margin: 0 auto clamp(28px, 4vw, 48px);
  }
  .eb {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--burgundy-accent);
  }
  .ln {
    width: 34px;
    height: 1px;
    background: currentColor;
    opacity: 0.45;
  }
  h2 {
    margin: 12px 0 10px;
    font-size: clamp(2rem, 3.6vw, 3rem);
    font-weight: 500;
    color: var(--charcoal);
  }
  h2 em {
    font-style: italic;
    color: var(--burgundy);
  }
  .dv {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .dv span {
    width: 46px;
    height: 1px;
    background: var(--burgundy-30);
  }
  .dv i {
    width: 7px;
    height: 7px;
    background: var(--burgundy);
    transform: rotate(45deg);
  }
  p {
    margin: 14px auto 0;
    color: var(--muted);
    max-width: 60ch;
  }
  .light .eb {
    color: var(--ivory-70);
  }
  .light h2 {
    color: var(--white);
  }
  .light h2 em {
    color: var(--ivory);
  }
  .light .dv span {
    background: var(--ivory-20);
  }
  .light .dv i {
    background: var(--ivory);
  }
  .light p {
    color: var(--ivory-70);
  }
</style>
