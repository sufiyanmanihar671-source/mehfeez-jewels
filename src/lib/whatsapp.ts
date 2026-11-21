/** Digits only, as required by wa.me links (country code + number, no +). */
export function waDigits(number: string): string {
  return (number || '').replace(/\D/g, '');
}

export function waLink(number: string, message: string): string {
  return `https://wa.me/${waDigits(number)}?text=${encodeURIComponent(message)}`;
}

export function productEnquiryMessage(product: { name: string; sku: string }, url?: string): string {
  return [
    'Hello Mehfeez Jewels, I am interested in a wholesale order for this design:',
    `Product: ${product.name}`,
    `SKU: ${product.sku}`,
    url ? `Link: ${url}` : '',
    'Please share wholesale pricing, MOQ and availability.'
  ]
    .filter(Boolean)
    .join('\n');
}
