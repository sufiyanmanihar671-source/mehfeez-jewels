import { z } from 'zod';

const trimmed = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

/** "Ruby, Emerald,  Pink" -> ["Ruby","Emerald","Pink"] (max 20 items, 40 chars each). */
const listField = (label: string) =>
  z
    .string()
    .optional()
    .transform((v) =>
      (v ?? '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
        .filter((x, i, a) => a.findIndex((y) => y.toLowerCase() === x.toLowerCase()) === i)
    )
    .refine((a) => a.length <= 20 && a.every((x) => x.length <= 40), `${label}: up to 20 values, 40 characters each`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

const phonePattern = /^\+?[0-9 ()-]{7,20}$/;

export const whatsappSchema = z
  .string({ error: 'WhatsApp number is required' })
  .trim()
  .regex(phonePattern, 'Enter a valid WhatsApp number with country code, e.g. +91 98765 43210');

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address').max(200));

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

const gstSchema = z
  .string()
  .trim()
  .toUpperCase()
  .max(20)
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^[0-9A-Z]{15}$/.test(v), 'GST number must be 15 letters/digits');

export const businessProfileSchema = z.object({
  full_name: trimmed(2, 120, 'Full name'),
  company_name: trimmed(2, 160, 'Business / company name'),
  whatsapp: whatsappSchema,
  country: trimmed(2, 80, 'Country'),
  city: trimmed(2, 80, 'City'),
  address: trimmed(5, 400, 'Business address'),
  business_type: trimmed(2, 80, 'Business type'),
  gst_number: gstSchema,
  website: optionalText(200),
  additional_info: optionalText(2000)
});

export const registerSchema = businessProfileSchema
  .extend({
    email: emailSchema,
    password: passwordSchema,
    confirm_password: z.string()
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match'
  });

export const enquirySchema = z.object({
  full_name: trimmed(2, 120, 'Full name'),
  business_name: trimmed(2, 160, 'Business name'),
  email: emailSchema,
  whatsapp: whatsappSchema,
  country: trimmed(2, 80, 'Country'),
  categories: z.array(z.string().trim().max(80)).max(20).default([]),
  estimated_quantity: optionalText(80),
  message: trimmed(5, 3000, 'Message'),
  product_id: z
    .string()
    .optional()
    .transform((v) => (v && /^[0-9a-f-]{36}$/i.test(v) ? v : null))
});

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug may contain lowercase letters, numbers and hyphens');

export const categorySchema = z.object({
  name: trimmed(1, 120, 'Name'),
  slug: slugSchema,
  description: optionalText(1000),
  sort_order: z.coerce.number().int().min(0).max(10000).default(0),
  is_active: z.boolean(),
  category_group: z.enum(['type', 'style']).default('type')
});

const stock = z.enum(['in_stock', 'low_stock', 'out_of_stock', 'made_to_order']);

const optionalInt = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? Number(v) : null))
  .refine((v) => v === null || (Number.isInteger(v) && v >= 0), 'Must be a whole number of 0 or more');

export const productSchema = z.object({
  name: trimmed(1, 200, 'Product name'),
  slug: slugSchema,
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, 'SKU is required')
    .max(64)
    .regex(/^[A-Z0-9._/-]+$/, 'SKU may contain letters, numbers, . _ / -'),
  description: z.string().trim().max(5000).default(''),
  category_id: z
    .string()
    .optional()
    .transform((v) => (v && /^[0-9a-f-]{36}$/i.test(v) ? v : null)),
  moq: z.coerce.number().int().min(1, 'MOQ must be at least 1').max(100000),
  stock_status: stock,
  stock_quantity: optionalInt,
  is_published: z.boolean(),
  is_featured: z.boolean(),
  is_new_arrival: z.boolean(),
  is_bestseller: z.boolean(),
  meta_title: optionalText(70),
  meta_description: optionalText(170),
  sort_order: z.coerce.number().int().min(0).max(100000).default(0),
  collections: z.array(z.enum(['trending', 'premium', 'exclusive', 'traditional'])).max(4).default([]),
  // Product details (comma-separated lists in the admin form)
  colors: listField('Colours'),
  sizes: listField('Sizes'),
  material: optionalText(120),
  finish: optionalText(120),
  stone: optionalText(120),
  weight: optionalText(60),
  set_includes: optionalText(300),
  dimensions: optionalText(160),
  video_url: z
    .string()
    .trim()
    .max(400)
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^https:\/\/[^\s]+$/.test(v), 'Video link must start with https://')
});

export const priceSchema = z.object({
  price: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0), 'Price must be a positive number'),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, 'Use a 3-letter currency code such as INR or USD'),
  price_note: optionalText(200)
});

export const variantSchema = z.object({
  name: trimmed(1, 120, 'Variant name'),
  sku: optionalText(64),
  stock_status: stock,
  price: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0), 'Variant price must be a positive number')
});

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https:\/\/[^\s]+$/.test(v), 'Enter a full https:// link');

export const settingsSchema = z.object({
  whatsapp_number: z.string().trim().regex(phonePattern, 'Enter a valid number with country code'),
  whatsapp_message: trimmed(5, 600, 'WhatsApp message'),
  video_call_number: z.string().trim().regex(phonePattern, 'Enter a valid number with country code'),
  video_call_message: trimmed(5, 600, 'Video call message'),
  video_call_enabled: z.boolean(),
  contact_phone: trimmed(5, 40, 'Contact phone'),
  contact_email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || z.email().safeParse(v).success, 'Enter a valid email'),
  address: trimmed(5, 400, 'Address'),
  business_hours: optionalText(200),
  instagram_url: optionalUrl,
  facebook_url: optionalUrl,
  hero_title: trimmed(3, 120, 'Hero title'),
  hero_subtitle: trimmed(3, 400, 'Hero subtitle')
});

export function formToObject(form: FormData, arrays: string[] = [], booleans: string[] = []): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of form.entries()) {
    if (typeof v !== 'string') continue;
    if (arrays.includes(k)) {
      const list = (out[k] as string[] | undefined) ?? [];
      list.push(v);
      out[k] = list;
    } else {
      out[k] = v;
    }
  }
  for (const a of arrays) out[a] ??= [];
  for (const b of booleans) out[b] = form.get(b) === 'on' || form.get(b) === 'true';
  return out;
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    out[key] ??= issue.message;
  }
  return out;
}

/** Honeypot: hidden field that real users never fill in. */
export function isBot(form: FormData): boolean {
  return Boolean(form.get('company_website_hp'));
}

/** Strip sensitive fields before echoing form values back to the page. */
export function safeValues(obj: Record<string, unknown>): Record<string, unknown> {
  const { password: _p, confirm_password: _c, ...rest } = obj;
  return rest;
}
