<script lang="ts">
  import { page } from '$app/state';
  import { env } from '$env/dynamic/public';

  let {
    title,
    description = 'Mehfeez Jewels — artificial jewellery manufacturer and wholesaler in Mumbai, India. American Diamond, Victorian, Heritage, South Indian and Bridal jewellery for retailers and distributors worldwide.',
    image = null,
    type = 'website',
    noindex = false,
    jsonld = null
  }: {
    title: string;
    description?: string;
    image?: string | null;
    type?: string;
    noindex?: boolean;
    jsonld?: Record<string, unknown> | null;
  } = $props();

  const site = $derived((env.PUBLIC_SITE_URL || page.url.origin).replace(/\/$/, ''));
  const canonical = $derived(site + page.url.pathname);
  const fullTitle = $derived(title.includes('Mehfeez') ? title : `${title} | Mehfeez Jewels`);
  const ld = $derived(jsonld ? '<script type="application/ld+json">' + JSON.stringify(jsonld).replace(/</g, '\\u003c') + '</' + 'script>' : '');
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description.slice(0, 170)} />
  <link rel="canonical" href={canonical} />
  {#if noindex}<meta name="robots" content="noindex, nofollow" />{/if}
  <meta property="og:site_name" content="Mehfeez Jewels" />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description.slice(0, 200)} />
  <meta property="og:type" content={type} />
  <meta property="og:url" content={canonical} />
  {#if image}<meta property="og:image" content={image} />{/if}
  <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html ld}
</svelte:head>
