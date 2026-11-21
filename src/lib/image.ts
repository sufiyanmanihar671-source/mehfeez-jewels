import { env } from '$env/dynamic/public';

/**
 * Returns an optimised image URL. When Supabase Image Transformations are
 * enabled (PUBLIC_SUPABASE_IMAGE_TRANSFORM=true) the public object URL is
 * rewritten to the render endpoint with a width; otherwise the original
 * (already WebP-compressed on upload) URL is returned.
 */
export function imageUrl(url: string | null | undefined, width?: number): string {
  if (!url) return '';
  if (env.PUBLIC_SUPABASE_IMAGE_TRANSFORM !== 'true' || !width) return url;
  if (!url.includes('/storage/v1/object/public/')) return url;
  return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + `?width=${width}&quality=78&resize=contain`;
}

export function srcset(url: string | null | undefined, widths = [320, 480, 720, 1080]): string | undefined {
  if (!url || env.PUBLIC_SUPABASE_IMAGE_TRANSFORM !== 'true') return undefined;
  return widths.map((w) => `${imageUrl(url, w)} ${w}w`).join(', ');
}
