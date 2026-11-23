<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title, subtitle = '', wide = false, children }: { title: string; subtitle?: string; wide?: boolean; children: Snippet } = $props();
</script>

<section class="auth">
  <div class="container">
    <div class="box card" class:wide>
      <span class="eyebrow">Wholesale account</span>
      <h1>{title}</h1>
      {#if subtitle}<p class="muted">{subtitle}</p>{/if}
      {@render children()}
    </div>
  </div>
</section>

<style>
  .auth {
    padding: clamp(36px, 7vw, 80px) 0;
    background: linear-gradient(180deg, var(--cream) 0, var(--cream) 220px, var(--ivory) 220px);
  }
  .box {
    max-width: 480px;
    margin: 0 auto;
  }
  .box.wide {
    max-width: 880px;
  }
  h1 {
    font-size: clamp(1.9rem, 4vw, 2.5rem);
  }
</style>
