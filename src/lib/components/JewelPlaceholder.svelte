<script lang="ts">
  let { label = 'Image coming soon' }: { label?: string } = $props();
</script>

<div class="ph" role="img" aria-label={label}>
  <svg viewBox="0 0 120 120" width="56" height="56" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round">
      <path d="M20 30c10 30 70 30 80 0" />
      <path d="M28 44c8 18 56 18 64 0" opacity=".6" />
      <path d="M60 66 72 80 60 100 48 80Z" />
      <path d="M48 80h24M54 80l6-14 6 14-6 20z" opacity=".7" />
    </g>
  </svg>
</div>

<style>
  .ph {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(160deg, var(--ivory), var(--white));
    color: var(--burgundy-30);
  }
</style>
