/**
 * Svelte action for <input type="file">: resizes selected photos in the
 * browser to max 1600px and re-encodes them as WebP before upload, so the
 * catalogue serves light, fast images even without a paid image CDN.
 */
export function compressImages(
  node: HTMLInputElement,
  opts: number | { max?: number; onbusy?: (busy: boolean) => void } = 1600
) {
  const maxSize = typeof opts === 'number' ? opts : (opts.max ?? 1600);
  const onbusy = typeof opts === 'number' ? undefined : opts.onbusy;
  async function shrink(file: File): Promise<File> {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
      const w = Math.round(bitmap.width * scale);
      const h = Math.round(bitmap.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
      const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.82));
      if (!blob || blob.size >= file.size) return file;
      return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' });
    } catch {
      return file;
    }
  }

  let busy = false;
  async function onChange() {
    if (busy || !node.files?.length) return;
    busy = true;
    onbusy?.(true);
    const dt = new DataTransfer();
    for (const f of Array.from(node.files)) dt.items.add(await shrink(f));
    node.files = dt.files;
    busy = false;
    onbusy?.(false);
  }
  node.addEventListener('change', onChange);
  return { destroy: () => node.removeEventListener('change', onChange) };
}
