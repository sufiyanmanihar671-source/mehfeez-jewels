// Enquiry cart: a list of designs the buyer wants to ask about, sent as ONE
// WhatsApp message from /cart. It is NOT a shopping cart: no prices, no totals,
// no checkout or payment. Stored only in this browser (localStorage).
import { browser } from '$app/environment';

export interface CartItem {
  /** product id + chosen options, so the same design in two colours = two lines */
  key: string;
  productId: string;
  slug: string;
  name: string;
  sku: string;
  image: string | null;
  variant: string | null;
  color: string | null;
  size: string | null;
}

const STORAGE_KEY = 'mj-enquiry-cart-v1';
const MAX_ITEMS = 50;

function load(): CartItem[] {
  if (!browser) return [];
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((i) => i && typeof i.key === 'string' && typeof i.name === 'string').slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

function save(items: CartItem[]) {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage blocked (private mode): the cart still works for this visit */
  }
}

class EnquiryCart {
  items = $state<CartItem[]>([]);
  ready = $state(false);

  constructor() {
    if (browser) {
      this.items = load();
      this.ready = true;
      // Keep tabs in sync.
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) this.items = load();
      });
    }
  }

  get count() {
    return this.items.length;
  }

  has(key: string) {
    return this.items.some((i) => i.key === key);
  }

  add(item: Omit<CartItem, 'key'>) {
    const key = [item.productId, item.variant ?? '', item.color ?? '', item.size ?? ''].join('|');
    if (this.has(key)) return key;
    this.items = [...this.items, { ...item, key }].slice(-MAX_ITEMS);
    save(this.items);
    return key;
  }

  remove(key: string) {
    this.items = this.items.filter((i) => i.key !== key);
    save(this.items);
  }

  clear() {
    this.items = [];
    save(this.items);
  }
}

export const cart = new EnquiryCart();

export const itemKey = (productId: string, variant: string | null, color: string | null, size: string | null) =>
  [productId, variant ?? '', color ?? '', size ?? ''].join('|');
