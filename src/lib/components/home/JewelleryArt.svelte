<!--
  Decorative line-art of a bridal necklace set (choker, drops, centre pendant)
  with a pair of jhumka earrings. Used in the hero until real photos exist.
  Pure SVG in currentColor — no external images.
-->
<svg class="art" viewBox="0 0 420 300" role="img" aria-label="Illustration of a necklace set with jhumka earrings">
  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <!-- necklace: outer and inner chains -->
    <path d="M110 40c18 74 58 110 100 110s82-36 100-110" stroke-width="1.4" />
    <path d="M122 40c16 62 50 94 88 94s72-32 88-94" stroke-width="1" opacity=".7" />

    <!-- stones along the necklace -->
    {#each Array(13) as _, i}
      {@const t = i / 12}
      {@const x = Math.round((110 + 200 * t) * 10) / 10}
      {@const y = Math.round((40 + 110 * Math.sin(Math.PI * t) * (0.55 + 0.45 * Math.sin(Math.PI * t))) * 10) / 10}
      <circle cx={x} cy={y} r={i % 2 ? 3.2 : 4.6} stroke-width="1.2" />
      {#if i > 0 && i < 12 && i % 2 === 0}
        <path d={`M${x} ${y + 5}v10`} stroke-width="1" />
        <path d={`M${x} ${y + 15}l4 6-4 7-4-7Z`} stroke-width="1.1" />
      {/if}
    {/each}

    <!-- centre pendant -->
    <path d="M210 150v8" stroke-width="1.2" />
    <path d="M210 158c16 0 26 12 26 26 0 18-14 30-26 42-12-12-26-24-26-42 0-14 10-26 26-26Z" stroke-width="1.4" />
    <path d="M210 170c9 0 15 7 15 15 0 10-8 17-15 24-7-7-15-14-15-24 0-8 6-15 15-15Z" stroke-width="1" opacity=".75" />
    <circle cx="210" cy="186" r="5" stroke-width="1.2" />
    <path d="M196 226l14 18 14-18" stroke-width="1" opacity=".7" />
    <circle cx="210" cy="250" r="3.4" stroke-width="1.1" />

    <!-- jhumka (left) -->
    <g transform="translate(46 70)">
      <circle cx="0" cy="0" r="6" stroke-width="1.2" />
      <path d="M0 6v10" stroke-width="1.1" />
      <circle cx="0" cy="22" r="6" stroke-width="1.1" />
      <path d="M-26 66c0-22 11-36 26-36s26 14 26 36Z" stroke-width="1.4" />
      <path d="M-16 66c0-14 7-24 16-24s16 10 16 24" stroke-width=".9" opacity=".7" />
      {#each [-22, -13, -4, 5, 14, 23] as x}
        <path d={`M${x} 66v9`} stroke-width=".9" />
        <circle cx={x} cy="78" r="2.4" stroke-width="1" />
      {/each}
    </g>

    <!-- jhumka (right) -->
    <g transform="translate(374 70)">
      <circle cx="0" cy="0" r="6" stroke-width="1.2" />
      <path d="M0 6v10" stroke-width="1.1" />
      <circle cx="0" cy="22" r="6" stroke-width="1.1" />
      <path d="M-26 66c0-22 11-36 26-36s26 14 26 36Z" stroke-width="1.4" />
      <path d="M-16 66c0-14 7-24 16-24s16 10 16 24" stroke-width=".9" opacity=".7" />
      {#each [-22, -13, -4, 5, 14, 23] as x}
        <path d={`M${x} 66v9`} stroke-width=".9" />
        <circle cx={x} cy="78" r="2.4" stroke-width="1" />
      {/each}
    </g>

    <!-- subtle sparkle accents -->
    <path d="M58 200l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5Z" stroke-width=".9" opacity=".6" />
    <path d="M360 214l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" stroke-width=".9" opacity=".6" />
  </g>
</svg>

<style>
  .art {
    display: block;
    width: 100%;
    height: auto;
    color: var(--ivory);
  }
</style>
